import React from 'react';
import { Layout } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTelegram } from '@/hooks/useTelegram';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, CheckCircle, Trash, Sparkle } from '@phosphor-icons/react';

export const NotificationsPage: React.FC = () => {
  const { colors, spacing } = useTheme();
  const { hapticFeedback } = useTelegram();
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return '🏆';
      case 'level_up':
        return '🎉';
      case 'quest_reminder':
        return '⏰';
      case 'companion_match':
        return '👥';
      default:
        return '📢';
    }
  };

  return (
    <Layout>
      <div style={{ paddingBottom: `${spacing.xxl}px` }}>
        {/* Заголовок */}
        <div style={{
          padding: `${spacing.xxl}px ${spacing.lg}px ${spacing.lg}px`,
          background: `linear-gradient(180deg, ${colors.primary}, ${colors.background})`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.md,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
              <Bell size={32} color="#FFFFFF" weight="fill" />
              <h1 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#FFFFFF',
                margin: 0,
              }}>
                Уведомления
              </h1>
            </div>

            {unreadCount > 0 && (
              <div style={{
                padding: `${spacing.xs}px ${spacing.md}px`,
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.2)',
              }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                  {unreadCount} новых
                </span>
              </div>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              title="Прочитать все"
              variant="ghost"
              size="small"
              onClick={() => {
                hapticFeedback.impact('light');
                markAllAsRead();
              }}
              icon={<CheckCircle size={18} color="#FFFFFF" />}
            />
          )}
        </div>

        {/* Список уведомлений */}
        <div style={{ padding: `${spacing.lg}px` }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: `${spacing.xxl}px 0` }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: `3px solid ${colors.surfaceAlt}`,
                borderTopColor: colors.primary,
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto',
              }} />
            </div>
          ) : notifications.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  style={{
                    opacity: 0,
                    animation: `fadeInUp 0.5s ease forwards ${index * 30}ms`,
                  }}
                >
                  <Card 
                    variant="glass"
                    style={{
                      opacity: notification.is_read ? 0.6 : 1,
                      borderLeft: !notification.is_read ? `4px solid ${colors.primary}` : undefined,
                    }}
                  >
                    <div style={{ display: 'flex', gap: spacing.md }}>
                      {/* Иконка */}
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '24px',
                        background: !notification.is_read 
                          ? `linear-gradient(135deg, ${colors.primary}, ${colors.primary}99)`
                          : colors.surfaceAlt,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        flexShrink: 0,
                      }}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Контент */}
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '15px',
                          fontWeight: 600,
                          color: colors.text,
                          marginBottom: spacing.xs,
                        }}>
                          {notification.title}
                        </h4>

                        <p style={{
                          fontSize: '14px',
                          color: colors.textSecondary,
                          lineHeight: '20px',
                          marginBottom: spacing.sm,
                        }}>
                          {notification.message}
                        </p>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                          <span style={{ fontSize: '12px', color: colors.textLight }}>
                            {new Date(notification.created_at).toLocaleString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>

                          <div style={{ display: 'flex', gap: spacing.sm }}>
                            {!notification.is_read && (
                              <button
                                onClick={() => {
                                  hapticFeedback.selection();
                                  markAsRead(notification.id);
                                }}
                                style={{
                                  padding: `${spacing.xs}px ${spacing.md}px`,
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: colors.primary + '15',
                                  color: colors.primary,
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Прочитать
                              </button>
                            )}
                            <button
                              onClick={() => {
                                hapticFeedback.impact('light');
                                deleteNotification(notification.id);
                              }}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: 'none',
                                background: colors.error + '15',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash size={16} color={colors.error} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: `${spacing.xxl}px`,
            }}>
              <Sparkle size={64} color={colors.textLight} style={{ margin: '0 auto' }} />
              <p style={{
                fontSize: '16px',
                fontWeight: 600,
                color: colors.textSecondary,
                marginTop: spacing.lg,
              }}>
                Нет уведомлений
              </p>
              <p style={{
                fontSize: '14px',
                color: colors.textLight,
              }}>
                Здесь появятся важные новости и напоминания
              </p>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </Layout>
  );
};