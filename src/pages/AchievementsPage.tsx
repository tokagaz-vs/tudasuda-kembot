import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { rewardsService } from '@/services/rewards.service';
import { AchievementCard } from '@/components/achievements/AchievementCard';
import { Trophy, Sparkle } from '@phosphor-icons/react';

interface AchievementWithProgress {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  category: string;
  condition_type: string;
  condition_value: any;
  reward_points: number;
  reward_coins: number;
  is_secret: boolean;
  created_at: string;
  userProgress: number;
  isCompleted: boolean;
  completedAt?: string;
}

export const AchievementsPage: React.FC = () => {
  const { colors, spacing } = useTheme();
  const { user } = useAuthStore();
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress'>('all');

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;

    const { data } = await rewardsService.getAllAchievementsWithProgress(user.id);
    if (data) {
      setAchievements(data);
    }
    setIsLoading(false);
  };

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'completed') return a.isCompleted;
    if (filter === 'in_progress') return !a.isCompleted && a.userProgress > 0;
    return true;
  });

  const completedCount = achievements.filter((a) => a.isCompleted).length;
  const totalCount = achievements.length;

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
            alignItems: 'center',
            gap: spacing.md,
            marginBottom: spacing.md,
          }}>
            <Trophy size={32} color="#FFFFFF" weight="fill" />
            <h1 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: 0,
            }}>
              Достижения
            </h1>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>
              {completedCount} из {totalCount} получено
            </span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
              {Math.round((completedCount / totalCount) * 100)}%
            </span>
          </div>

          <div style={{
            height: '6px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '3px',
            overflow: 'hidden',
            marginTop: spacing.sm,
          }}>
            <div style={{
              height: '100%',
              width: `${(completedCount / totalCount) * 100}%`,
              background: '#FFFFFF',
              borderRadius: '3px',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        {/* Фильтры */}
        <div style={{
          display: 'flex',
          gap: spacing.sm,
          padding: `${spacing.lg}px`,
          overflowX: 'auto',
        }}>
          {[
            { key: 'all' as const, label: 'Все', count: totalCount },
            { key: 'completed' as const, label: 'Получены', count: completedCount },
            { key: 'in_progress' as const, label: 'В процессе', count: achievements.filter(a => !a.isCompleted && a.userProgress > 0).length },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: `${spacing.sm}px ${spacing.md}px`,
                borderRadius: '999px',
                border: filter === f.key ? 'none' : `2px solid ${colors.border}`,
                background: filter === f.key ? colors.primary : colors.surface,
                color: filter === f.key ? '#FFFFFF' : colors.text,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Список достижений */}
        <div style={{ padding: `0 ${spacing.lg}px` }}>
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
          ) : filteredAchievements.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              {filteredAchievements.map((achievement, index) => (
                <div
                  key={achievement.id}
                  style={{
                    opacity: 0,
                    animation: `fadeInUp 0.5s ease forwards ${index * 50}ms`,
                  }}
                >
                  <AchievementCard achievement={achievement} />
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
                Нет достижений в этой категории
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