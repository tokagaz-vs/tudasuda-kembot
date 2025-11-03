import { supabase } from './supabase';
import { User, TelegramUser } from '@/types';

class AuthService {
  /**
   * Авторизация через Telegram
   */
  async authenticateWithTelegram(telegramUser: TelegramUser): Promise<User | null> {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔐 [AUTH] НАЧАЛО АВТОРИЗАЦИИ');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📋 Данные Telegram пользователя:', {
    telegram_id: telegramUser.id,
    username: telegramUser.username,
    first_name: telegramUser.first_name,
    last_name: telegramUser.last_name,
    language_code: telegramUser.language_code,
    is_premium: telegramUser.is_premium,
  });

  try {
    console.log('');
    console.log('🚀 [AUTH] Вызов функции create_or_update_user...');
    
    const functionParams = {
      p_telegram_id: telegramUser.id,
      p_username: telegramUser.username || null,
      p_first_name: telegramUser.first_name || 'User',
      p_last_name: telegramUser.last_name || null,
      p_photo_url: telegramUser.photo_url || null,
      p_language_code: telegramUser.language_code || 'ru',
      p_is_premium: telegramUser.is_premium || false,
    };

    console.log('📤 [AUTH] Параметры функции:', functionParams);

    // ✅ ИЗМЕНЕНО: убрали .single() так как функция возвращает одну строку
    const { data, error: rpcError } = await supabase
      .rpc('create_or_update_user', functionParams);

    console.log('📥 [AUTH] Результат вызова функции:', { data, error: rpcError });

    if (rpcError) {
      console.error('');
      console.error('❌ [AUTH] ОШИБКА ВЫЗОВА ФУНКЦИИ:');
      console.error('   Code:', rpcError.code);
      console.error('   Message:', rpcError.message);
      console.error('   Details:', rpcError.details);
      console.error('   Hint:', rpcError.hint);
      console.error('');
      
      if (rpcError.code === '42883') {
        console.error('💡 Функция не найдена. Выполните SQL скрипт настройки БД!');
      }
      
      console.log('🔄 [AUTH] Пробуем FALLBACK (прямой INSERT)...');
      return this.authenticateDirectly(telegramUser);
    }

    if (!data) {
      console.error('❌ [AUTH] Функция вернула null');
      throw new Error('Функция не вернула данные пользователя');
    }

    const user = data as User;

    console.log('');
    console.log('✅ [AUTH] УСПЕХ! Пользователь создан/обновлен:');
    console.log('   ID:', user.id);
    console.log('   Telegram ID:', user.telegram_id);
    console.log('   Username:', user.username);
    console.log('   Name:', user.first_name, user.last_name);
    console.log('   Points:', user.points);
    console.log('   Level:', user.level);
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    return user;

  } catch (error: any) {
    console.error('');
    console.error('❌❌❌ [AUTH] КРИТИЧЕСКАЯ ОШИБКА ❌❌❌');
    console.error('Error:', error);
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Stack:', error.stack);
    console.error('═══════════════════════════════════════════════════════');
    console.error('');

    return null;
  }
}

  /**
   * Прямая авторизация (fallback)
   */
  private async authenticateDirectly(telegramUser: TelegramUser): Promise<User | null> {
    console.log('🔄 [AUTH] FALLBACK: Прямая работа с таблицей users...');
    
    try {
      // Проверяем существующего
      console.log('🔍 Поиск пользователя с telegram_id:', telegramUser.id);
      
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .maybeSingle();

      console.log('📊 Результат поиска:', { found: !!existingUser, error: selectError });

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('❌ Ошибка SELECT:', selectError);
      }

      const userData = {
        telegram_id: telegramUser.id,
        username: telegramUser.username || null,
        first_name: telegramUser.first_name || 'User',
        last_name: telegramUser.last_name || null,
        full_name: `${telegramUser.first_name || 'User'} ${telegramUser.last_name || ''}`.trim(),
        photo_url: telegramUser.photo_url || null,
        language_code: telegramUser.language_code || 'ru',
        is_premium: telegramUser.is_premium || false,
      };

      if (existingUser) {
        // Обновляем
        console.log('🔄 Обновление существующего пользователя...');
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            ...userData,
            last_login_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('telegram_id', telegramUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('❌ Ошибка UPDATE:', updateError);
          return existingUser as User;
        }

        console.log('✅ Пользователь обновлен');
        return updatedUser as User;
      } else {
        // Создаем нового
        console.log('➕ Создание нового пользователя...');
        console.log('📝 Данные для вставки:', userData);

        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert(userData)
          .select()
          .single();

        if (insertError) {
          console.error('');
          console.error('❌❌❌ ОШИБКА INSERT ❌❌❌');
          console.error('Code:', insertError.code);
          console.error('Message:', insertError.message);
          console.error('Details:', insertError.details);
          console.error('Hint:', insertError.hint);
          console.error('');

          if (insertError.code === '42501') {
            console.error('🔒 ОШИБКА ПРАВ ДОСТУПА (RLS)!');
            console.error('👉 Выполните SQL скрипт для отключения RLS!');
          } else if (insertError.code === '23505') {
            console.error('⚠️ Дубликат telegram_id');
          }

          throw insertError;
        }

        console.log('✅ Новый пользователь создан:', newUser);
        return newUser as User;
      }

    } catch (error: any) {
      console.error('❌ Fallback не удался:', error);
      return null;
    }
  }

  /**
   * Получить текущего пользователя
   */
  async getCurrentUser(telegramId: number): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (error) throw error;
      return data as User;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Обновить профиль пользователя
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      console.log('📝 [AUTH] Обновление профиля:', { userId, updates });

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (error) {
        console.error('❌ Ошибка обновления:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Пользователь не найден');
      }

      console.log('✅ Профиль обновлен');
      return data as User;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }

  /**
   * Добавить опыт пользователю
   */
  async addExperience(userId: string, amount: number): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('add_experience', {
        p_user_id: userId,
        p_experience: amount,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding experience:', error);
      return false;
    }
  }

  /**
   * Добавить монеты и очки
   */
  async addCurrency(
    userId: string,
    coins: number = 0,
    points: number = 0
  ): Promise<boolean> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('coins, points')
        .eq('id', userId)
        .single();

      if (!user) throw new Error('User not found');

      const { error } = await supabase
        .from('users')
        .update({
          coins: user.coins + coins,
          points: user.points + points,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding currency:', error);
      return false;
    }
  }
}

export const authService = new AuthService();