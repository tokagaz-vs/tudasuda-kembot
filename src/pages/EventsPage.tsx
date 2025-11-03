import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTelegram } from '@/hooks/useTelegram';
import { eventsService } from '@/services/events.service';
import type { Event } from '@/types';
import { 
  CalendarBlank, 
  MapPin, 
  Users, 
  Trophy,
  Clock,
  Coin,
} from '@phosphor-icons/react';

const EVENT_FILTERS = [
  { key: 'upcoming', label: 'Предстоящие' },
  { key: 'active', label: 'Активные' },
  { key: 'past', label: 'Прошедшие' },
];

export const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { colors, spacing, gradients } = useTheme();
  const { hapticFeedback } = useTelegram();

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'active' | 'past'>('upcoming');

  useEffect(() => {
    loadEvents();
  }, [filter]);

  const loadEvents = async () => {
    setIsLoading(true);
    const { data } = await eventsService.getEvents(filter);
    if (data) {
      setEvents(data);
    }
    setIsLoading(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      competition: '🏆 Соревнование',
      festival: '🎉 Фестиваль',
      meetup: '🤝 Встреча',
      challenge: '⚡ Челлендж',
    };
    return types[type] || type;
  };

  return (
    <Layout>
      <div style={{ paddingBottom: `${spacing.xxl}px` }}>
        {/* Заголовок */}
        <div style={{
          padding: `${spacing.xxl}px ${spacing.lg}px ${spacing.lg}px`,
          background: `linear-gradient(180deg, ${gradients.brand.colors[0]}, ${colors.background})`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            marginBottom: spacing.md,
          }}>
            <CalendarBlank size={32} color="#FFFFFF" weight="fill" />
            <h1 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: 0,
            }}>
              События
            </h1>
          </div>

          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.9)',
            margin: 0,
          }}>
            Участвуйте в соревнованиях и мероприятиях
          </p>
        </div>

        {/* Фильтры */}
        <div style={{
          padding: `${spacing.lg}px`,
          display: 'flex',
          gap: spacing.sm,
          borderBottom: `1px solid ${colors.border}`,
        }}>
          {EVENT_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                hapticFeedback.selection();
                setFilter(f.key as any);
              }}
              style={{
                flex: 1,
                padding: `${spacing.md}px`,
                borderRadius: '12px',
                border: 'none',
                background: filter === f.key ? colors.primary : colors.surface,
                color: filter === f.key ? '#FFFFFF' : colors.text,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* События */}
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
          ) : events.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              {events.map((event, index) => {
                // ✅ ИСПРАВЛЕНО: удалена неиспользуемая переменная isPast
                const isFull = event.max_participants && event.current_participants >= event.max_participants;
                
                return (
                  <div
                    key={event.id}
                    style={{
                      opacity: 0,
                      animation: `fadeInUp 0.5s ease forwards ${index * 50}ms`,
                    }}
                  >
                    <Card 
                      variant="glass"
                      onPress={() => navigate(`/events/${event.id}`)}
                    >
                      {/* Бейджи */}
                      <div style={{
                        display: 'flex',
                        gap: spacing.sm,
                        marginBottom: spacing.md,
                        flexWrap: 'wrap',
                      }}>
                        <div style={{
                          padding: `${spacing.xs}px ${spacing.md}px`,
                          background: colors.primary + '15',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: colors.primary,
                        }}>
                          {getEventTypeLabel(event.event_type)}
                        </div>
                        
                        {event.is_featured && (
                          <div style={{
                            padding: `${spacing.xs}px ${spacing.md}px`,
                            background: colors.warning + '15',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: colors.warning,
                          }}>
                            ⭐ Рекомендуем
                          </div>
                        )}

                        {isFull && (
                          <div style={{
                            padding: `${spacing.xs}px ${spacing.md}px`,
                            background: colors.error + '15',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: colors.error,
                          }}>
                            🔒 Мест нет
                          </div>
                        )}
                      </div>

                      {/* Заголовок */}
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: colors.text,
                        marginBottom: spacing.sm,
                      }}>
                        {event.title}
                      </h3>

                      {/* Описание */}
                      <p style={{
                        fontSize: '14px',
                        color: colors.textSecondary,
                        lineHeight: '20px',
                        marginBottom: spacing.md,
                      }}>
                        {event.description}
                      </p>

                      {/* Мета информация */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: spacing.sm,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                          <Clock size={16} color={colors.textSecondary} />
                          <span style={{ fontSize: '13px', color: colors.textSecondary }}>
                            {formatDate(event.starts_at)} - {formatDate(event.ends_at)}
                          </span>
                        </div>

                        {event.venue && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                            <MapPin size={16} color={colors.textSecondary} />
                            <span style={{ fontSize: '13px', color: colors.textSecondary }}>
                              {event.venue}
                            </span>
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                          <Users size={16} color={colors.textSecondary} />
                          <span style={{ fontSize: '13px', color: colors.textSecondary }}>
                            {event.current_participants} участников
                            {event.max_participants && ` / ${event.max_participants}`}
                          </span>
                        </div>

                        {event.entry_fee > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                            <Coin size={16} color={colors.warning} weight="fill" />
                            <span style={{ fontSize: '13px', color: colors.textSecondary }}>
                              Взнос: {event.entry_fee} монет
                            </span>
                          </div>
                        )}

                        {/* Призы */}
                        {event.prizes && Array.isArray(event.prizes) && event.prizes.length > 0 && (
                          <div style={{
                            marginTop: spacing.sm,
                            padding: spacing.md,
                            background: colors.surfaceAlt,
                            borderRadius: '8px',
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: spacing.xs,
                              marginBottom: spacing.xs,
                            }}>
                              <Trophy size={14} color={colors.warning} weight="fill" />
                              <span style={{ fontSize: '12px', fontWeight: 600, color: colors.text }}>
                                Призы:
                              </span>
                            </div>
                            {event.prizes.slice(0, 3).map((prize: any, i: number) => (
                              <div key={i} style={{ fontSize: '12px', color: colors.textSecondary }}>
                                {prize.position} место: {prize.description}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: `${spacing.xxl}px` }}>
              <CalendarBlank size={64} color={colors.textLight} style={{ margin: '0 auto' }} />
              <p style={{
                fontSize: '16px',
                fontWeight: 600,
                color: colors.textSecondary,
                marginTop: spacing.lg,
              }}>
                {filter === 'upcoming' ? 'Нет предстоящих событий' :
                 filter === 'active' ? 'Нет активных событий' :
                 'Нет прошедших событий'}
              </p>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
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