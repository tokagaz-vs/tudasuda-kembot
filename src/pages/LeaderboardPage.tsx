import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { Card, Avatar, Skeleton } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/authStore';
import { leaderboardService } from '@/services/leaderboard.service';
import { LeaderboardEntry } from '@/types';

export const LeaderboardPage: React.FC = () => {
  const { colors, spacing, typography, gradients, borderRadius } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    const data = await leaderboardService.getTopPlayers(100);
    setPlayers(data);
    
    if (user) {
      const rank = data.findIndex((p) => p.telegram_id === user.telegram_id) + 1;
      setUserRank(rank || null);
    }
    
    setIsLoading(false);
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return colors.border;
  };

  const TopThree = () => {
    const top3 = players.slice(0, 3);
    if (top3.length === 0) return null;

    const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
    const heights = ['120px', '160px', '100px'];

    return (
      <div style={{ background: colors.surface, padding: `${spacing.xl}px ${spacing.lg}px`, marginBottom: `${spacing.lg}px` }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: `${spacing.xl}px` }}>
          Топ игроков 🏆
        </h2>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: `${spacing.md}px` }}>
          {podiumOrder.map((player, index) => {
            if (!player) return null;

            const actualRank = player.rank;
            const height = heights[index];
            const rankColor = getRankColor(actualRank);

            return (
              <div key={player.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Аватар */}
                <div style={{ position: 'relative', marginBottom: `${spacing.sm}px` }}>
                  <Avatar
                    src={player.photo_url}
                    alt={player.first_name}
                    size="lg"
                    style={{ border: `3px solid ${rankColor}` }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-5px',
                      right: '-5px',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: rankColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${colors.surface}`,
                      fontSize: '16px',
                    }}
                  >
                    {getMedalEmoji(actualRank)}
                  </div>
                </div>

                {/* Имя */}
                <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: `${spacing.xs}px`, textAlign: 'center' }}>
                  {player.first_name}
                </p>

                {/* Очки */}
                <div style={{ display: 'flex', alignItems: 'center', gap: `${spacing.xs}px`, marginBottom: `${spacing.sm}px` }}>
                  <span style={{ fontSize: '14px' }}>⭐</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: colors.textSecondary }}>
                    {player.points}
                  </span>
                </div>

                {/* Постамент */}
                <div
                  style={{
                    width: '100%',
                    height,
                    background: `linear-gradient(to bottom, ${rankColor}, ${rankColor}80)`,
                    borderTopLeftRadius: borderRadius.md,
                    borderTopRightRadius: borderRadius.md,
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

  const UserRankCard = () => {
    if (!user || !userRank) return null;

    return (
      <div
        style={{
          background: gradients.brand,
          margin: `0 ${spacing.lg}px ${spacing.lg}px`,
          padding: `${spacing.lg}px`,
          borderRadius: borderRadius.lg,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#FFFFFF' }}>
          <div>
            <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: `${spacing.xs}px` }}>
              Ваша позиция
            </p>
            <p style={{ fontSize: '28px', fontWeight: 700 }}>#{userRank}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: `${spacing.xs}px` }}>
            <span style={{ fontSize: '20px' }}>⭐</span>
            <span style={{ fontSize: '16px', fontWeight: 700 }}>{user.points} pts</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div>
        {/* Топ 3 */}
        {!isLoading && <TopThree />}

        {/* Позиция пользователя */}
        <UserRankCard />

        {/* Остальные игроки */}
        <div style={{ padding: `0 ${spacing.lg}px` }}>
          {players.length > 3 && (
            <h3 style={{ ...typography.h4, margin: `${spacing.md}px 0` }}>
              Остальные игроки
            </h3>
          )}

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.sm}px` }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height="72px" />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.sm}px`, marginBottom: `${spacing.xxl}px` }}>
              {players.slice(3).map((player) => {
                const isCurrentUser = user?.telegram_id === player.telegram_id;

                return (
                  <Card
                    key={player.id}
                    style={{
                      borderWidth: isCurrentUser ? '2px' : '0',
                      borderColor: isCurrentUser ? colors.primary : 'transparent',
                      borderStyle: 'solid',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: `${spacing.md}px` }}>
                      {/* Ранг */}
                      <div style={{ width: '40px', textAlign: 'center' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: colors.textSecondary }}>
                          #{player.rank}
                        </span>
                      </div>

                      {/* Аватар */}
                      <Avatar
                        src={player.photo_url}
                        alt={player.first_name}
                        size="md"
                      />

                      {/* Инфо */}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '16px', fontWeight: 600, color: isCurrentUser ? colors.primary : colors.text }}>
                          {player.first_name} {isCurrentUser && '(Вы)'}
                        </p>
                        <p style={{ fontSize: '13px', color: colors.textSecondary }}>
                          {player.username ? `@${player.username}` : `Level ${player.level}`}
                        </p>
                      </div>

                      {/* Очки */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: `${spacing.xs}px` }}>
                        <span>⭐</span>
                        <span style={{ fontSize: '16px', fontWeight: 700 }}>{player.points}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {!isLoading && players.length === 0 && (
            <Card>
              <div style={{ textAlign: 'center', padding: `${spacing.xxl}px` }}>
                <div style={{ fontSize: '64px', marginBottom: `${spacing.md}px` }}>🏆</div>
                <p style={{ color: colors.textSecondary, marginBottom: `${spacing.xs}px` }}>
                  Пока нет участников
                </p>
                <p style={{ fontSize: '14px', color: colors.textLight }}>
                  Начните проходить квесты и станьте первым в рейтинге!
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};