import { supabase } from './supabase';
import { User, TelegramUser } from '@/types';

class AuthService {
  /**
   * Авторизация через Telegram
   */
  async authenticateWithTelegram(telegramUser: TelegramUser): Promise<User | null> {
    try {
      console.log('🔐 Начало авторизации:', telegramUser);

      // Проверяем, существует ли пользователь
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .maybeSingle();

      console.log('Результат поиска:', { existingUser, selectError });

      if (existingUser) {
        // Обновляем данные пользователя
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            username: telegramUser.username || null,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name || null,
            photo_url: telegramUser.photo_url || null,
            language_code: telegramUser.language_code || 'ru',
            is_premium: telegramUser.is_premium || false,
            last_login_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('telegram_id', telegramUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('❌ Ошибка обновления:', updateError);
          throw updateError;
        }

        console.log('✅ Пользователь обновлен:', updatedUser);
        return updatedUser as User;
      } else {
        // Создаем нового пользователя
        const newUserData = {
          telegram_id: telegramUser.id,
          username: telegramUser.username || null,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name || null,
          photo_url: telegramUser.photo_url || null,
          language_code: telegramUser.language_code || 'ru',
          is_premium: telegramUser.is_premium || false,
        };

        console.log('📝 Создание пользователя:', newUserData);

        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert(newUserData)
          .select()
          .single();

        if (insertError) {
          console.error('❌ Ошибка создания:', insertError);
          throw insertError;
        }

        console.log('✅ Пользователь создан:', newUser);
        return newUser as User;
      }
    } catch (error: any) {
      console.error('❌ Ошибка авторизации:', error);
      
      // Детальная информация об ошибке
      if (error.code === '42501') {
        console.error('🔒 Ошибка прав доступа: необходимо настроить RLS политики в Supabase');
      } else if (error.code === 'PGRST116') {
        console.error('📭 Пользователь не найден в БД');
      } else if (error.message) {
        console.error('💬 Сообщение ошибки:', error.message);
      }
      
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
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
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
      // Используем RPC функцию из базы данных
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