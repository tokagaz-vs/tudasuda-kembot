import { useEffect, useState } from 'react';
import { notificationService, Notification } from '@/services/notification.service';
import { useAuthStore } from '@/store/authStore';
import { useTelegram } from './useTelegram';

export const useNotifications = () => {
  const { user } = useAuthStore();
  const { hapticFeedback, showAlert } = useTelegram();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    loadNotifications();

    // Подписываемся на новые уведомления
    const unsubscribe = notificationService.subscribeToNotifications(
      user.id,
      (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        
        // Вибрация и показ уведомления
        hapticFeedback.notification('success');
        showAlert(`${notification.title}\n\n${notification.message}`);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    setIsLoading(true);

    const { data } = await notificationService.getNotifications(user.id);
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }

    setIsLoading(false);
  };

  const markAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!user) return;

    await notificationService.markAllAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = async (notificationId: string) => {
    await notificationService.deleteNotification(notificationId);
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    reload: loadNotifications,
  };
};