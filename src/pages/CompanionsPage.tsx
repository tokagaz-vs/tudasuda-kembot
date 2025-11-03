import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { Button, Card } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTelegram } from '@/hooks/useTelegram';
import { useAuthStore } from '@/store/authStore';
import { socialService } from '@/services/social.service';
import { CompanionRequestCard } from '@/components/social/CompanionRequestCard';
import { CreateRequestModal } from '@/components/social/CreateRequestModal';
import type { CompanionRequest } from '@/types';
import { 
  Users, 
  Plus, 
  UsersFour, 
  UserCircle,
  ChatCircle,
  X,
  Check,
} from '@phosphor-icons/react';

export const CompanionsPage: React.FC = () => {
  const { colors, spacing, gradients } = useTheme();
  const { hapticFeedback, showAlert, showConfirm } = useTelegram();
  const { user } = useAuthStore();

  const [requests, setRequests] = useState<CompanionRequest[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab, user]);

  const loadData = async () => {
    setIsLoading(true);

    if (activeTab === 'all') {
      const { data } = await socialService.getCompanionRequests();
      if (data) {
        const filtered = data.filter((r) => r.user_id !== user?.id);
        setRequests(filtered);
      }
    } else if (user) {
      const { data } = await socialService.getMyRequests(user.id);
      if (data) {
        setMyRequests(data);
      }
    }

    setIsLoading(false);
  };

  const handleRespond = async (requestId: string) => {
    if (!user) return;

    const confirmed = await showConfirm(
      'Хотите откликнуться на этот запрос? Создатель запроса получит уведомление.'
    );

    if (!confirmed) return;

    hapticFeedback.impact('medium');

    const { error } = await socialService.respondToRequest(requestId, user.id);

    if (error) {
      await showAlert('Не удалось отправить отклик. Попробуйте позже.');
      return;
    }

    await showAlert('✅ Отклик отправлен!\n\nОжидайте ответа от создателя запроса.');
    loadData();
  };

  // ✅ НОВОЕ: Создание запроса
  const handleCreateRequest = async (data: {
  questId: string;
  message: string;
  maxCompanions: number;
  preferredLanguage: string;
}) => {
  if (!user) return;

  hapticFeedback.impact('medium');
  setShowCreateModal(false);

  const { error } = await socialService.createCompanionRequest(
    user.id,
    data.questId,
    data.message,
    data.maxCompanions,
    data.preferredLanguage
  );

  if (error) {
    await showAlert('❌ Не удалось создать запрос. Попробуйте позже.');
    return;
  }

  await showAlert('✅ Запрос создан!\n\nДругие пользователи смогут увидеть его и откликнуться.');
  setActiveTab('my');
  loadData();
};

  // ✅ НОВОЕ: Принять/отклонить компаньона
  const handleMatchAction = async (matchId: string, status: 'accepted' | 'rejected', userName: string) => {
    const confirmed = await showConfirm(
      status === 'accepted'
        ? `Принять ${userName} в компанию?`
        : `Отклонить отклик от ${userName}?`
    );

    if (!confirmed) return;

    hapticFeedback.impact('medium');

    const { error } = await socialService.updateMatchStatus(matchId, status);

    if (error) {
      await showAlert('Не удалось обновить статус. Попробуйте позже.');
      return;
    }

    if (status === 'accepted') {
      await showAlert('✅ Компаньон принят!\n\nТеперь вы можете написать ему в Telegram.');
    }

    loadData();
  };

  // ✅ НОВОЕ: Открыть чат с компаньоном
  const handleOpenChat = (telegramId: number | string, username?: string) => {
    hapticFeedback.impact('medium');
    socialService.openTelegramChat(telegramId, username);
  };

  return (
    <Layout>
      <div style={{ paddingBottom: `${spacing.xxl}px` }}>
        {/* Заголовок */}
        <div style={{
          padding: `${spacing.xxl}px ${spacing.lg}px ${spacing.lg}px`,
          background: `linear-gradient(135deg, ${gradients.success?.colors?.[0] || colors.success}, ${gradients.success?.colors?.[1] || colors.success}99)`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.md,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
              <Users size={32} color="#FFFFFF" weight="fill" />
              <h1 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#FFFFFF',
                margin: 0,
              }}>
                Компаньоны
              </h1>
            </div>

            <button
              onClick={() => {
                hapticFeedback.impact('light');
                setShowCreateModal(true);
              }}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Plus size={24} color="#FFFFFF" weight="bold" />
            </button>
          </div>

          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.9)',
            margin: 0,
            lineHeight: '20px',
          }}>
            Найдите попутчиков для совместного прохождения квестов
          </p>
        </div>

        {/* Табы */}
        <div style={{
          display: 'flex',
          gap: spacing.sm,
          padding: `${spacing.lg}px`,
          borderBottom: `1px solid ${colors.border}`,
        }}>
          <button
            onClick={() => {
              hapticFeedback.selection();
              setActiveTab('all');
            }}
            style={{
              flex: 1,
              padding: `${spacing.md}px`,
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'all' ? colors.success : colors.surface,
              color: activeTab === 'all' ? '#FFFFFF' : colors.text,
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Все запросы
          </button>
          <button
            onClick={() => {
              hapticFeedback.selection();
              setActiveTab('my');
            }}
            style={{
              flex: 1,
              padding: `${spacing.md}px`,
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'my' ? colors.success : colors.surface,
              color: activeTab === 'my' ? '#FFFFFF' : colors.text,
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Мои запросы
          </button>
        </div>

        {/* Контент */}
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
          ) : activeTab === 'all' ? (
            requests.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                {requests.map((request, index) => (
                  <div
                    key={request.id}
                    style={{
                      opacity: 0,
                      animation: `fadeInUp 0.5s ease forwards ${index * 50}ms`,
                    }}
                  >
                    <CompanionRequestCard
                      request={request}
                      onRespond={handleRespond}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: `${spacing.xxl}px`,
              }}>
                <UsersFour size={64} color={colors.textLight} style={{ margin: '0 auto' }} />
                <p style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: colors.textSecondary,
                  marginTop: spacing.lg,
                  marginBottom: spacing.xs,
                }}>
                  Нет активных запросов
                </p>
                <p style={{
                  fontSize: '14px',
                  color: colors.textLight,
                  marginBottom: spacing.lg,
                }}>
                  Создайте свой запрос или проверьте позже
                </p>
                <Button
                  title="Создать запрос"
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                  icon={<Plus size={20} color="#FFFFFF" weight="bold" />}
                />
              </div>
            )
          ) : (
            myRequests.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                {myRequests.map((request, index) => (
                  <div
                    key={request.id}
                    style={{
                      opacity: 0,
                      animation: `fadeInUp 0.5s ease forwards ${index * 50}ms`,
                    }}
                  >
                    <Card variant="glass">
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: spacing.md,
                      }}>
                        <div>
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: colors.text,
                            marginBottom: spacing.xs,
                          }}>
                            {request.quest?.title}
                          </h4>
                          <span style={{
                            fontSize: '13px',
                            color: colors.textSecondary,
                          }}>
                            {request.matches?.length || 0} откликов
                          </span>
                        </div>
                        <div style={{
                          padding: `${spacing.xs}px ${spacing.md}px`,
                          borderRadius: '999px',
                          background: request.status === 'open' ? colors.success + '15' : colors.surfaceAlt,
                          fontSize: '12px',
                          fontWeight: 600,
                          color: request.status === 'open' ? colors.success : colors.textSecondary,
                        }}>
                          {request.status === 'open' ? '🟢 Активен' : 
                           request.status === 'matched' ? '✅ Набран' : '🔴 Закрыт'}
                        </div>
                      </div>

                      {/* Отклики */}
                      {request.matches && request.matches.length > 0 && (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: spacing.sm,
                        }}>
                          {request.matches.map((match: any) => (
                            <div
                              key={match.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: spacing.md,
                                background: match.status === 'accepted' 
                                  ? colors.success + '10' 
                                  : colors.surface,
                                borderRadius: '12px',
                                border: match.status === 'accepted' 
                                  ? `1px solid ${colors.success}` 
                                  : 'none',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '20px',
                                  background: colors.primary,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  overflow: 'hidden',
                                }}>
                                  {match.user?.photo_url ? (
                                    <img 
                                      src={match.user.photo_url} 
                                      alt={match.user.first_name}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  ) : (
                                    <UserCircle 
                                      size={20} 
                                      color="#FFFFFF" 
                                      weight="fill" 
                                    />
                                  )}
                                </div>
                                <div>
                                  <p style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: colors.text,
                                    margin: 0,
                                  }}>
                                    {match.user?.first_name}
                                  </p>
                                  <p style={{
                                    fontSize: '12px',
                                    color: colors.textSecondary,
                                    margin: 0,
                                  }}>
                                    {match.status === 'pending' ? '⏳ Ожидает' :
                                     match.status === 'accepted' ? '✅ Принят' : '❌ Отклонен'}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Кнопки действий */}
                              <div style={{ display: 'flex', gap: spacing.xs }}>
                                {match.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleMatchAction(
                                        match.id, 
                                        'accepted',
                                        match.user?.first_name
                                      )}
                                      style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: colors.success,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <Check size={20} color="#FFFFFF" weight="bold" />
                                    </button>
                                    <button
                                      onClick={() => handleMatchAction(
                                        match.id,
                                        'rejected',
                                        match.user?.first_name
                                      )}
                                      style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: colors.error,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <X size={20} color="#FFFFFF" weight="bold" />
                                    </button>
                                  </>
                                )}
                                
                                {match.status === 'accepted' && (
                                  <button
                                    onClick={() => handleOpenChat(
                                      match.user?.telegram_id,
                                      match.user?.username
                                    )}
                                    style={{
                                      padding: `${spacing.xs}px ${spacing.md}px`,
                                      borderRadius: '8px',
                                      border: 'none',
                                      background: colors.primary,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: spacing.xs,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <ChatCircle size={16} color="#FFFFFF" weight="fill" />
                                    <span style={{
                                      fontSize: '13px',
                                      fontWeight: 600,
                                      color: '#FFFFFF',
                                    }}>
                                      Написать
                                    </span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: `${spacing.xxl}px`,
              }}>
                <UsersFour size={64} color={colors.textLight} style={{ margin: '0 auto' }} />
                <p style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: colors.textSecondary,
                  marginTop: spacing.lg,
                  marginBottom: spacing.xs,
                }}>
                  У вас нет запросов
                </p>
                <p style={{
                  fontSize: '14px',
                  color: colors.textLight,
                  marginBottom: spacing.lg,
                }}>
                  Создайте запрос, чтобы найти компаньонов
                </p>
                <Button
                  title="Создать запрос"
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                  icon={<Plus size={20} color="#FFFFFF" weight="bold" />}
                />
              </div>
            )
          )}
        </div>
      </div>

      {/* Модальное окно создания запроса */}
      <CreateRequestModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateRequest}
      />

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