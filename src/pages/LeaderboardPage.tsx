import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { Card, Avatar } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase';
import { Star, Trophy } from '@phosphor-icons/react';


interface LeaderboardUser {
  id: string;
  telegram_id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  photo_url?: string;
  points: number;
  rank: number;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return null;
  }
};

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return '#FFD700';
    case 2:
      return '#C0C0C0';
    case 3:
      return '#CD7F32';
    default:
      return '';
  }
};

export const LeaderboardPage: React.FC = () => {
  const { colors, spacing, gradients } = useTheme();
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('points', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (data) {
        const rankedData: LeaderboardUser[] = data.map((profile: any, index: number) => ({
          ...profile,
          rank: index + 1,
        }));

        setLeaderboard(rankedData);

        if (user) {
          const userIndex = rankedData.findIndex((p) => p.telegram_id === user.telegram_id);
          setUserRank(userIndex !== -1 ? userIndex + 1 : null);
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const TopThreePodium = () => {
    const top3 = leaderboard.slice(0, 3);
    if (top3.length === 0) return null;

    const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
    const heights = [120, 160, 100];

    return (
      <div
        style={{
          background: colors.surface,
          padding: `${spacing.xl}px ${spacing.lg}px`,
          marginBottom: `${spacing.lg}px`,
        }}
      >
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: colors.text,
            textAlign: 'center',
            marginBottom: `${spacing.xl}px`,
          }}
        >
          Топ игроков 🏆
        </h2>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: `${spacing.md}px`,
          }}
        >
          {podiumOrder.map((player, index) => {
            if (!player) return null;

            const actualRank = player.rank;
            const height = heights[index];

            return (
              <div
                key={player.id}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* Аватар */}
                <div style={{ position: 'relative', marginBottom: `${spacing.sm}px` }}>
                  <Avatar
                    src={player.photo_url}
                    alt={player.first_name}
                    size="lg"
                    fallback={player.first_name?.charAt(0)}
                    showBorder
                    borderColor={getRankColor(actualRank)}
                  />
                  {/* Бейдж ранга */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-5px',
                      right: '-5px',
                      width: '30px',
                      height: '30px',
                      borderRadius: '15px',
                      background: getRankColor(actualRank),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${colors.surface}`,
                      fontSize: '16px',
                    }}
                  >
                    {getRankIcon(actualRank)}
                  </div>
                </div>

                {/* Имя */}
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.text,
                    textAlign: 'center',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                  }}
                >
                  {player.first_name} {player.last_name || ''}
                </span>

                {/* Очки */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginBottom: `${spacing.sm}px`,
                  }}
                >
                  <Star size={14} color={colors.warning} weight="fill" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: colors.textSecondary }}>
                    {player.points}
                  </span>
                </div>

                {/* Постамент */}
                <div
                  style={{
                    width: '100%',
                    height: `${height}px`,
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px',
                    background: `linear-gradient(180deg, ${getRankColor(actualRank)}, ${getRankColor(actualRank)}80)`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingTop: `${spacing.sm}px`,
                  }}
                >
                  <span style={{ fontSize: '32px', fontWeight: 700, color: colors.surface }}>
                    {actualRank}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div style={{ paddingBottom: `${spacing.xxl}px` }}>
        {isLoading ? (
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
        ) : (
          <>
            {/* Топ-3 подиум */}
            <TopThreePodium />

            {/* Карточка позиции пользователя */}
            {user && userRank && (
              <div style={{ padding: `0 ${spacing.lg}px ${spacing.lg}px` }}>
                <Card
                  variant="gradient"
                  gradient={gradients.brand.colors}
                  style={{ padding: `${spacing.lg}px` }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: '13px',
                          color: 'rgba(255,255,255,0.9)',
                          marginBottom: '4px',
                        }}
                      >
                        Ваша позиция
                      </p>
                      <h3
                        style={{
                          fontSize: '28px',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          margin: 0,
                        }}
                      >
                        #{userRank}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Star size={20} color={colors.warning} weight="fill" />
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
                        {user.points} очков
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Список остальных */}
            {leaderboard.length > 3 && (
              <div style={{ padding: `0 ${spacing.lg}px` }}>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: colors.textSecondary,
                    marginBottom: `${spacing.md}px`,
                  }}
                >
                  Остальные игроки
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.sm}px` }}>
                  {leaderboard.slice(3).map((item, index) => {
                    const isCurrentUser = user?.telegram_id === item.telegram_id;

                    return (
                      <Card
                        key={item.id}
                        variant="glass"
                        style={{
                          border: isCurrentUser ? `2px solid ${colors.primary}` : undefined,
                          background: isCurrentUser ? colors.primary + '15' : undefined,
                          opacity: 0,
                          animation: `fadeInUp 0.3s ease forwards ${index * 30}ms`,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: `${spacing.md}px`,
                          }}
                        >
                          {/* Ранг */}
                          <div
                            style={{
                              width: '40px',
                              textAlign: 'center',
                            }}
                          >
                            {item.rank <= 3 ? (
                              <span style={{ fontSize: '24px' }}>{getRankIcon(item.rank)}</span>
                            ) : (
                              <span
                                style={{
                                  fontSize: '16px',
                                  fontWeight: 700,
                                  color: colors.textSecondary,
                                }}
                              >
                                #{item.rank}
                              </span>
                            )}
                          </div>

                          {/* Аватар */}
                          <Avatar
                            src={item.photo_url}
                            alt={item.first_name}
                            size="md"
                            fallback={item.first_name?.charAt(0)}
                          />

                          {/* Инфо */}
                          <div style={{ flex: 1 }}>
                            <h4
                              style={{
                                fontSize: '16px',
                                fontWeight: 600,
                                color: isCurrentUser ? colors.primary : colors.text,
                                marginBottom: '2px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.first_name} {item.last_name || ''}
                              {isCurrentUser && ' (Вы)'}
                            </h4>
                            <p style={{ fontSize: '13px', color: colors.textSecondary, margin: 0 }}>
                              @{item.username || 'user'}
                            </p>
                          </div>

                          {/* Очки */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Star size={16} color={colors.warning} weight="fill" />
                            <span style={{ fontSize: '16px', fontWeight: 700, color: colors.text }}>
                              {item.points}
                            </span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {leaderboard.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: `${spacing.xxl * 3}px ${spacing.xl}px`,
                }}
              >
                <Trophy size={64} color={colors.textLight} style={{ margin: '0 auto' }} />
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: colors.textSecondary,
                    marginTop: `${spacing.lg}px`,
                    marginBottom: `${spacing.xs}px`,
                  }}
                >
                  Пока нет участников
                </h3>
                <p style={{ fontSize: '14px', color: colors.textLight, lineHeight: '20px' }}>
                  Начните проходить квесты и станьте первым в рейтинге!
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
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