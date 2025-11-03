import { supabase } from './supabase';

class EventsService {
  /**
   * Получить все события
   */
  async getEvents(filter: 'all' | 'upcoming' | 'active' | 'past' = 'upcoming') {
    try {
      let query = supabase.from('events').select('*');

      const now = new Date().toISOString();

      switch (filter) {
        case 'upcoming':
          query = query.gt('starts_at', now).order('starts_at');
          break;
        case 'active':
          query = query.lte('starts_at', now).gte('ends_at', now).order('starts_at');
          break;
        case 'past':
          query = query.lt('ends_at', now).order('ends_at', { ascending: false });
          break;
        default:
          query = query.order('starts_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get events error:', error);
      return { data: null, error };
    }
  }

  /**
   * Получить событие по ID
   */
  async getEventById(eventId: string) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get event by ID error:', error);
      return { data: null, error };
    }
  }

  /**
   * Зарегистрироваться на событие
   */
  async registerForEvent(userId: string, eventId: string) {
    try {
      // Проверяем событие
      const { data: event } = await this.getEventById(eventId);
      if (!event) throw new Error('Event not found');

      // Проверяем не зарегистрирован ли уже
      const { data: existing } = await supabase
        .from('event_participants')
        .select('*')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .maybeSingle();

      if (existing) {
        return { data: existing, error: null };
      }

      // Проверяем лимиты
      if (event.max_participants && event.current_participants >= event.max_participants) {
        return { data: null, error: 'Мест больше нет' };
      }

      // Проверяем срок регистрации
      if (event.registration_deadline) {
        const deadline = new Date(event.registration_deadline);
        if (new Date() > deadline) {
          return { data: null, error: 'Регистрация закрыта' };
        }
      }

      // Проверяем уровень
      const { data: user } = await supabase
        .from('users')
        .select('level, coins')
        .eq('id', userId)
        .single();

      if (!user) throw new Error('User not found');

      if (user.level < event.min_level) {
        return { data: null, error: `Требуется ${event.min_level} уровень` };
      }

      // Проверяем взнос
      if (event.entry_fee > 0 && user.coins < event.entry_fee) {
        return { data: null, error: 'Недостаточно монет' };
      }

      // Списываем взнос
      if (event.entry_fee > 0) {
        await supabase
          .from('users')
          .update({ coins: user.coins - event.entry_fee })
          .eq('id', userId);

        await supabase.from('transactions').insert({
          user_id: userId,
          transaction_type: 'event_prize',
          coins_change: -event.entry_fee,
          description: `Регистрация на событие: ${event.title}`,
          metadata: { event_id: eventId },
        });
      }

      // Регистрируем участника
      const { data, error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: userId,
          status: 'registered',
        })
        .select()
        .single();

      if (error) throw error;

      // Увеличиваем счетчик участников
      await supabase
        .from('events')
        .update({ current_participants: event.current_participants + 1 })
        .eq('id', eventId);

      return { data, error: null };
    } catch (error: any) {
      console.error('Register for event error:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Отменить регистрацию
   */
  async cancelRegistration(userId: string, eventId: string) {
    try {
      const { error } = await supabase
        .from('event_participants')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('event_id', eventId);

      if (error) throw error;

      // Уменьшаем счетчик
      const { data: event } = await this.getEventById(eventId);
      if (event) {
        await supabase
          .from('events')
          .update({ current_participants: Math.max(0, event.current_participants - 1) })
          .eq('id', eventId);
      }

      return { error: null };
    } catch (error: any) {
      console.error('Cancel registration error:', error);
      return { error: error.message };
    }
  }

  /**
   * Получить участников события
   */
  async getEventParticipants(eventId: string) {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select(`
          *,
          user:users(*)
        `)
        .eq('event_id', eventId)
        .in('status', ['registered', 'confirmed', 'attended'])
        .order('score', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get event participants error:', error);
      return { data: null, error };
    }
  }

  /**
   * Проверить регистрацию пользователя
   */
  async getUserRegistration(userId: string, eventId: string) {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get user registration error:', error);
      return { data: null, error };
    }
  }
}

export const eventsService = new EventsService();