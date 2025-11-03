import { supabase } from './supabase';
import type { LeaderboardEntry } from '@/types';

class SocialService {
  /**
   * ✅ НОВОЕ: Открыть чат с пользователем в Telegram
   */
  openTelegramChat(telegramId: number | string, username?: string) {
    try {
      // Используем Telegram Web App API для открытия чата
      if (window.Telegram?.WebApp) {
        const link = username 
          ? `https://t.me/${username}` 
          : `tg://user?id=${telegramId}`;
        
        window.Telegram.WebApp.openTelegramLink(link);
        return { success: true };
      } else {
        // Fallback для браузера
        const link = username 
          ? `https://t.me/${username}` 
          : `tg://user?id=${telegramId}`;
        window.open(link, '_blank');
        return { success: true };
      }
    } catch (error) {
      console.error('Open Telegram chat error:', error);
      return { success: false, error };
    }
  }

  /**
   * Создать запрос на поиск компаньона
   */
  async createCompanionRequest(
    userId: string,
    questId: string,
    message?: string,
    maxCompanions: number = 3,
    preferredLanguage?: string
  ) {
    try {
      // Проверяем, нет ли уже активного запроса
      const { data: existing } = await supabase
        .from('companion_requests')
        .select('*')
        .eq('user_id', userId)
        .eq('quest_id', questId)
        .eq('status', 'open')
        .maybeSingle();

      if (existing) {
        return { data: existing, error: null };
      }

      // Получаем геолокацию пользователя (опционально)
      let latitude: number | undefined;
      let longitude: number | undefined;

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
            });
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch (e) {
          console.warn('Could not get geolocation:', e);
        }
      }

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Запрос действует 24 часа

      const { data, error } = await supabase
        .from('companion_requests')
        .insert({
          user_id: userId,
          quest_id: questId,
          message,
          max_companions: maxCompanions,
          preferred_language: preferredLanguage,
          latitude,
          longitude,
          status: 'open',
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
        })
        .select(`
          *,
          user:users(*),
          quest:quests(*)
        `)
        .single();

      if (error) throw error;
      
      console.log('✅ Запрос на компанию создан:', data);
      return { data, error: null };
    } catch (error: any) {
      console.error('Create companion request error:', error);
      return { data: null, error };
    }
  }

  /**
   * Получить доступные запросы на компаньонов
   */
  async getCompanionRequests(questId?: string, limit: number = 20) {
    try {
      let query = supabase
        .from('companion_requests')
        .select(`
          *,
          user:users(*),
          quest:quests(*)
        `)
        .eq('status', 'open')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (questId) {
        query = query.eq('quest_id', questId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get companion requests error:', error);
      return { data: null, error };
    }
  }

  /**
   * Откликнуться на запрос
   */
  async respondToRequest(requestId: string, userId: string, message?: string) {
    try {
      // Проверяем, что запрос еще активен
      const { data: request } = await supabase
        .from('companion_requests')
        .select('*')
        .eq('id', requestId)
        .eq('status', 'open')
        .single();

      if (!request) {
        return { data: null, error: 'Request not found or closed' };
      }

      // Проверяем, не откликался ли уже пользователь
      const { data: existing } = await supabase
        .from('companion_matches')
        .select('*')
        .eq('request_id', requestId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        return { data: existing, error: null };
      }

      // Создаем отклик
      const { data, error } = await supabase
        .from('companion_matches')
        .insert({
          request_id: requestId,
          user_id: userId,
          message,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select(`
          *,
          user:users(*)
        `)
        .single();

      if (error) throw error;

      console.log('✅ Отклик отправлен:', data);

      // ✅ НОВОЕ: Создаем уведомление для создателя запроса
      try {
        await supabase.from('notifications').insert({
          user_id: request.user_id,
          type: 'companion_match',
          title: 'Новый отклик на запрос',
          message: `Пользователь откликнулся на ваш запрос компаньона`,
          metadata: {
            request_id: requestId,
            match_id: data.id,
            user_id: userId,
          },
          created_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Could not create notification:', e);
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Respond to request error:', error);
      return { data: null, error };
    }
  }

  /**
   * ✅ ОБНОВЛЕНО: Принять/отклонить компаньона с уведомлением
   */
  async updateMatchStatus(
    matchId: string,
    status: 'accepted' | 'rejected'
  ) {
    try {
      const { data, error } = await supabase
        .from('companion_matches')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', matchId)
        .select(`
          *,
          user:users(*),
          request:companion_requests(*)
        `)
        .single();

      if (error) throw error;

      // Если принят, обновляем статус запроса
      if (status === 'accepted' && data.request) {
        const { data: matches } = await supabase
          .from('companion_matches')
          .select('*', { count: 'exact' })
          .eq('request_id', data.request_id)
          .eq('status', 'accepted');

        if (matches && matches.length >= data.request.max_companions) {
          await supabase
            .from('companion_requests')
            .update({ status: 'matched' })
            .eq('id', data.request_id);
        }

        // ✅ НОВОЕ: Создаем уведомление для принятого пользователя
        try {
          await supabase.from('notifications').insert({
            user_id: data.user_id,
            type: 'companion_accepted',
            title: status === 'accepted' ? '🎉 Вас приняли!' : '❌ Отклик отклонен',
            message: status === 'accepted' 
              ? 'Ваш отклик на запрос компаньона принят! Можете начать общение.'
              : 'К сожалению, ваш отклик был отклонен.',
            metadata: {
              request_id: data.request_id,
              match_id: matchId,
              status,
            },
            created_at: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Could not create notification:', e);
        }
      }

      console.log(`✅ Статус отклика обновлен: ${status}`);
      return { data, error: null };
    } catch (error: any) {
      console.error('Update match status error:', error);
      return { data: null, error };
    }
  }

  /**
   * Получить мои запросы
   */
  async getMyRequests(userId: string) {
    try {
      const { data, error } = await supabase
        .from('companion_requests')
        .select(`
          *,
          quest:quests(*),
          matches:companion_matches(
            *,
            user:users(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get my requests error:', error);
      return { data: null, error };
    }
  }

  /**
   * Получить мои отклики
   */
  async getMyMatches(userId: string) {
    try {
      const { data, error } = await supabase
        .from('companion_matches')
        .select(`
          *,
          request:companion_requests(
            *,
            user:users(*),
            quest:quests(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get my matches error:', error);
      return { data: null, error };
    }
  }

  /**
   * Закрыть запрос
   */
  async closeRequest(requestId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('companion_requests')
        .update({ 
          status: 'closed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Close request error:', error);
      return { error };
    }
  }

  /**
   * Получить глобальный рейтинг
   */
  async getLeaderboard(
    type: 'points' | 'quests' | 'level' = 'points',
    limit: number = 100
  ): Promise<{ data: LeaderboardEntry[] | null; error: any }> {
    try {
      let orderBy = 'points';
      if (type === 'quests') orderBy = 'quests_completed';
      if (type === 'level') orderBy = 'level';

      const { data, error } = await supabase
        .from('users')
        .select('id, telegram_id, username, first_name, photo_url, points, level, quests_completed')
        .eq('is_active', true)
        .eq('is_banned', false)
        .order(orderBy, { ascending: false })
        .order('points', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const leaderboard: LeaderboardEntry[] = data?.map((user, index) => ({
        ...user,
        rank: index + 1,
      })) || [];

      return { data: leaderboard, error: null };
    } catch (error: any) {
      console.error('Get leaderboard error:', error);
      return { data: null, error };
    }
  }

  /**
   * Получить рейтинг пользователя
   */
  async getUserRank(userId: string, type: 'points' | 'quests' | 'level' = 'points') {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('points, quests_completed, level')
        .eq('id', userId)
        .single();

      if (!user) return { data: null, error: 'User not found' };

      let value = user.points;
      if (type === 'quests') value = user.quests_completed;
      if (type === 'level') value = user.level;

      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('is_banned', false)
        .gt(type === 'points' ? 'points' : type === 'quests' ? 'quests_completed' : 'level', value);

      const rank = (count || 0) + 1;

      return { data: { rank, value, type }, error: null };
    } catch (error: any) {
      console.error('Get user rank error:', error);
      return { data: null, error };
    }
  }

  /**
   * Получить друзей (пользователи, с которыми проходили квесты)
   */
  async getFriends(userId: string) {
    try {
      const { data: myMatches } = await supabase
        .from('companion_matches')
        .select(`
          request:companion_requests(user_id)
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted');

      const { data: matchesWithMe } = await supabase
        .from('companion_requests')
        .select(`
          matches:companion_matches(user_id)
        `)
        .eq('user_id', userId)
        .eq('status', 'matched');

      const friendIds = new Set<string>();
      myMatches?.forEach((m: any) => {
        if (m.request?.user_id) friendIds.add(m.request.user_id);
      });
      matchesWithMe?.forEach((m: any) => {
        m.matches?.forEach((match: any) => {
          if (match.user_id && match.status === 'accepted') {
            friendIds.add(match.user_id);
          }
        });
      });

      if (friendIds.size === 0) {
        return { data: [], error: null };
      }

      const { data: friends, error } = await supabase
        .from('users')
        .select('id, telegram_id, username, first_name, photo_url, points, level, quests_completed')
        .in('id', Array.from(friendIds));

      if (error) throw error;
      return { data: friends || [], error: null };
    } catch (error: any) {
      console.error('Get friends error:', error);
      return { data: null, error };
    }
  }
}

export const socialService = new SocialService();