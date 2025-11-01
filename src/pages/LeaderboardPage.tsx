import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { Card, Avatar, Skeleton } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { leaderboardService } from '@/services/leaderboard.service';
import { LeaderboardEntry } from '@/types';
import { useAuthStore } from '@/store/authStore';

export const LeaderboardPage: React.FC = () => {
  const { colors, spacing, typography, gradients } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    const data = await leaderboardService.getTopPlayers(100);
    setPlayers(data);
    setIsLoading(false);
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <Layout>
      <div style={{ padding: `${spacing.lg}px` }}>
        <h1 style={{ ...typography.h1, marginBottom: `${spacing.lg}px` }}>
          {t('leaderboard.title')} 🏆
        </h1>

        {/* Current User Rank */}
        {user && (
          <Card
            padding="md"
            style={{
              marginBottom: `${spacing.lg}px`,
              background: gradients.brand,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: `${spacing.md}px`,
                color: '#FFFFFF',
              }}
            >
              <Avatar
                src={user.photo_url}
                alt={user.first_name}
                size="md"
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{t('leaderboard.yourRank')}</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                  {user.first_name}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: 700 }}>
                  #{players.findIndex((p) => p.id === user.id) + 1 || '?'}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                  {user.points} pts
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Leaderboard List */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.sm}px` }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height="72px" />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.sm}px` }}>
            {players.map((player) => (
              <Card key={player.id} padding="md">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: `${spacing.md}px`,
                  }}
                >
                  {/* Rank */}
                  <div
                    style={{
                      width: '40px',
                      textAlign: 'center',
                      fontSize: player.rank <= 3 ? '24px' : '16px',
                      fontWeight: 700,
                      color: player.rank <= 3 ? colors.primary : colors.textSecondary,
                    }}
                  >
                    {getMedalEmoji(player.rank)}
                  </div>

                  {/* Avatar */}
                  <Avatar
                    src={player.photo_url}
                    alt={player.first_name}
                    size="md"
                    fallback={player.first_name.charAt(0)}
                  />

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{player.first_name}</div>
                    <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                      {player.username ? `@${player.username}` : `Level ${player.level}`}
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: colors.primary }}>
                      {player.points}
                    </div>
                    <div style={{ fontSize: '11px', color: colors.textSecondary }}>
                      {player.quests_completed} quests
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};