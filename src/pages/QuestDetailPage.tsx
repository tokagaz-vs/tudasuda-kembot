import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, Button, GlassPanel } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTelegram } from '@/hooks/useTelegram';
import { useAuthStore } from '@/store/authStore';
import { questService } from '@/services/quest.service';
import { QuestWithDetails, UserProgress } from '@/types';
import { ROUTES } from '@/constants';
import {
  Star,
  Clock,
  Lightning,
  Target,
  Sparkle,
  CheckCircle,
  Play,
} from '@phosphor-icons/react';


const DIFFICULTY_LEVELS = {
  easy: { label: 'Легко', color: '#10B981' },
  medium: { label: 'Средне', color: '#F59E0B' },
  hard: { label: 'Сложно', color: '#EF4444' },
};

export const QuestDetailPage: React.FC = () => {
  const { questId } = useParams<{ questId: string }>();
  const navigate = useNavigate();
  const { colors, spacing, typography, gradients } = useTheme();
  const { hapticFeedback } = useTelegram();
  const { user } = useAuthStore();

  const [quest, setQuest] = useState<QuestWithDetails | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (questId) {
      loadQuest();
    }
  }, [questId]);

  const loadQuest = async () => {
    if (!questId) return;

    const { data } = await questService.getQuestById(questId);
    if (data) {
      setQuest(data);

      if (user) {
        const { data: progressData } = await questService.getUserProgress(user.id, questId);
        if (progressData) setProgress(progressData);
      }
    }
    setIsLoading(false);
  };

  const handleStartQuest = async () => {
    if (!user || !quest) return;

    hapticFeedback.impact('medium');
    setIsStarting(true);

    if (progress && progress.status === 'in_progress') {
      navigate(`${ROUTES.quests}/${quest.id}/play`);
      setIsStarting(false);
      return;
    }

    const { error } = await questService.startQuest(user.id, quest.id);

    if (error) {
      alert('Не удалось начать квест');
      setIsStarting(false);
      return;
    }

    setIsStarting(false);
    navigate(`${ROUTES.quests}/${quest.id}/play`);
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '30м';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}ч ${mins > 0 ? mins + 'м' : ''}`;
    return `${mins}м`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${colors.surfaceAlt}`,
              borderTopColor: colors.primary,
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        </div>
      </Layout>
    );
  }

  if (!quest) {
    return (
      <Layout>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            gap: `${spacing.md}px`,
            padding: `${spacing.lg}px`,
          }}
        >
          <Target size={64} color={colors.textLight} />
          <h2 style={{ ...typography.h2, color: colors.textSecondary }}>
            Квест не найден
          </h2>
          <Button title="Назад" onClick={() => navigate(ROUTES.quests)} variant="glass" />
        </div>
      </Layout>
    );
  }

  const isInProgress = progress?.status === 'in_progress';
  const isCompleted = progress?.status === 'completed';
  const HEADER_HEIGHT = 120;

  return (
    <Layout>
      <div style={{ paddingBottom: `${spacing.xxl * 3}px` }}>
        {/* Компактный градиентный хедер */}
        <div
          style={{
            background: `linear-gradient(180deg, ${quest.category?.color || colors.primary}, ${colors.background})`,
            height: `${HEADER_HEIGHT}px`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Декоративные элементы */}
          <Sparkle
            size={16}
            color="rgba(255,255,255,0.2)"
            weight="fill"
            style={{ position: 'absolute', top: '20px', right: '30px' }}
          />
          <Sparkle
            size={12}
            color="rgba(255,255,255,0.15)"
            weight="fill"
            style={{ position: 'absolute', top: '60px', left: '40px' }}
          />
          <Sparkle
            size={14}
            color="rgba(255,255,255,0.1)"
            weight="fill"
            style={{ position: 'absolute', top: '80px', right: '80px' }}
          />
        </div>

        {/* Основная информация */}
        <div
          style={{
            padding: `${spacing.lg}px`,
            marginTop: `-${spacing.xxl}px`,
            opacity: 0,
            animation: 'fadeInDown 0.5s ease forwards 200ms',
          }}
        >
          <Card variant="glass">
            <div style={{ marginBottom: `${spacing.sm}px` }}>
              {/* Бейджи */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: `${spacing.sm}px`,
                }}
              >
                {quest.category && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '3px',
                        background: quest.category.color || colors.primary,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: colors.textSecondary,
                      }}
                    >
                      {quest.category.name}
                    </span>
                  </div>
                )}

                {isCompleted && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '999px',
                      background: colors.success,
                    }}
                  >
                    <CheckCircle size={14} color="#FFFFFF" weight="fill" />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#FFFFFF' }}>
                      Пройден
                    </span>
                  </div>
                )}

                {isInProgress && progress && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '999px',
                      background: colors.info,
                    }}
                  >
                    <Play size={14} color="#FFFFFF" weight="fill" />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#FFFFFF' }}>
                      {Math.round((progress.current_point / quest.pointsCount) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Заголовок */}
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: colors.text,
                letterSpacing: '-0.5px',
                lineHeight: '30px',
                marginBottom: `${spacing.sm}px`,
              }}
            >
              {quest.title}
            </h1>

            {/* Описание */}
            {quest.description && (
              <p
                style={{
                  fontSize: '15px',
                  lineHeight: '22px',
                  color: colors.textSecondary,
                  margin: 0,
                }}
              >
                {quest.description}
              </p>
            )}
          </Card>
        </div>

        {/* Компактная статистика - 4 в ряд */}
        <div
          style={{
            padding: `0 ${spacing.lg}px ${spacing.md}px`,
            opacity: 0,
            animation: 'fadeInDown 0.5s ease forwards 300ms',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: `${spacing.sm}px`,
            }}
          >
            {[
              {
                icon: Star,
                value: quest.totalPoints || 0,
                label: 'Очков',
                gradient: gradients.brand.colors,
              },
              {
                icon: Clock,
                value: formatDuration(quest.estimated_duration),
                label: 'Время',
                gradient: gradients.accent.colors,
              },
              {
                icon: Lightning,
                value: quest.difficulty ? DIFFICULTY_LEVELS[quest.difficulty].label : 'Легко',
                label: 'Уровень',
                gradient: ['#F59E0B', '#DC2626'],
              },
              {
                icon: Target,
                value: quest.pointsCount || quest.points?.length || 0,
                label: 'Точек',
                gradient: gradients.success?.colors || ['#22C55E', '#10B981'],
              },
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: `${spacing.md}px ${spacing.xs}px`,
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${stat.gradient[0]}, ${stat.gradient[1]})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <stat.icon size={16} color="#FFFFFF" weight="fill" />
                </div>
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: colors.text,
                    marginBottom: '2px',
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    color: colors.textSecondary,
                  }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Прогресс */}
        {progress && !isCompleted && (
          <div
            style={{
              padding: `0 ${spacing.lg}px ${spacing.md}px`,
              opacity: 0,
              animation: 'fadeInDown 0.5s ease forwards 400ms',
            }}
          >
            <Card variant="glass">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: `${spacing.sm}px`,
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 600, color: colors.text }}>
                  Прогресс
                </span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: colors.primary }}>
                  {Math.round((progress.current_point / quest.pointsCount) * 100)}%
                </span>
              </div>
              <div
                style={{
                  height: '6px',
                  background: colors.border,
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginBottom: `${spacing.sm}px`,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${(progress.current_point / quest.pointsCount) * 100}%`,
                    background: `linear-gradient(90deg, ${gradients.brand.colors[0]}, ${gradients.brand.colors[1]})`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: colors.textSecondary }}>
                  {progress.current_point}/{quest.pointsCount} точек
                </span>
                <span style={{ fontSize: '12px', color: colors.textSecondary }}>
                  {progress.total_points} очков
                </span>
              </div>
            </Card>
          </div>
        )}

        {/* Точки маршрута */}
        {quest.points && quest.points.length > 0 && (
          <div
            style={{
              padding: `0 ${spacing.lg}px ${spacing.md}px`,
              opacity: 0,
              animation: 'fadeInDown 0.5s ease forwards 500ms',
            }}
          >
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: colors.text,
                marginBottom: `${spacing.md}px`,
              }}
            >
              📍 Точки маршрута
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.sm}px` }}>
              {quest.points.map((point, index) => {
                const isPassed = progress ? index < progress.current_point : false;
                const isCurrent = progress ? index === progress.current_point : false;

                return (
                  <Card
                    key={point.id}
                    variant="glass"
                    style={{
                      opacity: isPassed ? 0.6 : 1,
                      border: isCurrent ? `2px solid ${colors.primary}` : undefined,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: `${spacing.md}px` }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '20px',
                          background: isPassed
                            ? colors.success
                            : isCurrent
                            ? colors.primary
                            : colors.surfaceAlt,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isPassed ? (
                          <CheckCircle size={20} color="#FFFFFF" weight="fill" />
                        ) : (
                          <span style={{ fontSize: '16px', fontWeight: 700, color: colors.text }}>
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4
                          style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: colors.text,
                            marginBottom: '2px',
                          }}
                        >
                          {point.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={12} color={colors.warning} weight="fill" />
                          <span style={{ fontSize: '12px', color: colors.textSecondary }}>
                            {point.points} очков
                          </span>
                        </div>
                      </div>
                      {isCurrent && (
                        <div
                          style={{
                            padding: '4px 8px',
                            borderRadius: '999px',
                            background: colors.primary + '15',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: colors.primary,
                          }}
                        >
                          Текущая
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Кнопка действия */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: `${spacing.md}px ${spacing.lg}px`,
          background: colors.background,
          borderTop: `1px solid ${colors.border}`,
          opacity: 0,
          animation: 'fadeInUp 0.5s ease forwards 500ms',
        }}
      >
        <GlassPanel padding={0}>
          <div style={{ padding: `${spacing.sm}px` }}>
            {isCompleted ? (
              <Button
                title="Пройти снова"
                variant="secondary"
                size="large"
                onClick={handleStartQuest}
                loading={isStarting}
                fullWidth
                icon={<Play size={24} color="#FFFFFF" weight="fill" />}
              />
            ) : isInProgress ? (
              <Button
                title="Продолжить"
                variant="primary"
                size="large"
                onClick={handleStartQuest}
                fullWidth
                icon={<Play size={24} color="#FFFFFF" weight="fill" />}
              />
            ) : (
              <Button
                title="Начать квест"
                variant="primary"
                size="large"
                onClick={handleStartQuest}
                loading={isStarting}
                fullWidth
                icon={<Star size={24} color="#FFFFFF" weight="fill" />}
              />
            )}
          </div>
        </GlassPanel>
      </div>

      <style>
        {`
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

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