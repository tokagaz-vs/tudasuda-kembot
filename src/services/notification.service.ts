import { supabase } from './supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: 'quest_reminder' | 'achievement' | 'companion_match' | 'level_up' | 'system';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

class NotificationService {
  /**
   * Подписка на уведомления
   */
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Получить уведомления пользователя
   */
  async getNotifications(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get notifications error:', error);
      return { data: null, error };
    }
  }

  /**
   * Получить непрочитанные уведомления
   */
  async getUnreadNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get unread notifications error:', error);
      return { data: null, error };
    }
  }

  /**
   * Пометить уведомление как прочитанное
   */
  async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Mark as read error:', error);
      return { error };
    }
  }

  /**
   * Пометить все уведомления как прочитанные
   */
  async markAllAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Mark all as read error:', error);
      return { error };
    }
  }

  /**
   * Создать уведомление
   */
  async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data?: any
  ) {
    try {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          data,
          is_read: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Отправляем Telegram уведомление (если доступно)
      await this.sendTelegramNotification(userId, title, message);

      return { data: notification, error: null };
    } catch (error: any) {
      console.error('Create notification error:', error);
      return { data: null, error };
    }
  }

  /**
   * Отправка уведомления через Telegram Bot API
   */
  private async sendTelegramNotification(userId: string, title: string, message: string) {
    try {
      // Получаем telegram_id пользователя
      const { data: user } = await supabase
        .from('users')
        .select('telegram_id')
        .eq('id', userId)
        .single();

      if (!user?.telegram_id) return;

      const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
      if (!botToken) return;

      const text = `*${title}*\n\n${message}`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: user.telegram_id,
          text,
          parse_mode: 'Markdown',
        }),
      });
    } catch (error) {
      console.error('Send telegram notification error:', error);
    }
  }

  /**
   * Удалить уведомление
   */
  async deleteNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Delete notification error:', error);
      return { error };
    }
  }

  /**
   * Создать напоминание о квесте
   */
  async scheduleQuestReminder(userId: string, questId: string, questTitle: string, delay: number = 3600000) {
    // delay в миллисекундах (по умолчанию 1 час)
    setTimeout(async () => {
      await this.createNotification(
        userId,
        'quest_reminder',
        '⏰ Напоминание о квесте',
        `Не забудьте продолжить квест "${questTitle}"!`,
        { quest_id: questId }
      );
    }, delay);
  }

  /**
   * Уведомление о новом достижении
   */
  async notifyAchievement(userId: string, achievementName: string, reward: number) {
    await this.createNotification(
      userId,
      'achievement',
      '🏆 Новое достижение!',
      `Вы получили достижение "${achievementName}"! Награда: ${reward} очков.`,
      { achievement_name: achievementName }
    );
  }

  /**
   * Уведомление о повышении уровня
   */
  async notifyLevelUp(userId: string, newLevel: number, rewards: any) {
    await this.createNotification(
      userId,
      'level_up',
      `🎉 Уровень ${newLevel}!`,
      `Поздравляем! Вы достигли ${newLevel} уровня. Получено наград: ${JSON.stringify(rewards)}`,
      { level: newLevel, rewards }
    );
  }

  /**
   * Уведомление о новом отклике на запрос компаньона
   */
  async notifyCompanionMatch(userId: string, companionName: string, questTitle: string) {
    await this.createNotification(
      userId,
      'companion_match',
      '👥 Новый отклик!',
      `${companionName} хочет пройти квест "${questTitle}" вместе с вами!`,
      { companion_name: companionName }
    );
  }
}

export const notificationService = new NotificationService();