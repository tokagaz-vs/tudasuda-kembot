import React from 'react';
import { Card } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import type { Achievement } from '@/types';
import { Trophy, Star, Coin, LockKey } from '@phosphor-icons/react';

interface AchievementWithProgress extends Achievement {
  userProgress: number;
  isCompleted: boolean;
  completedAt?: string;
}

interface AchievementCardProps {
  achievement: AchievementWithProgress;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const { colors, spacing } = useTheme();
  const isLocked = !achievement.isCompleted && achievement.is_secret && achievement.userProgress === 0;

  return (
    <Card 
      variant="glass" 
      style={{
        opacity: isLocked ? 0.6 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Индикатор выполнения */}
      {achievement.isCompleted && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          padding: `${spacing.xs}px ${spacing.md}px`,
          background: colors.success,
          borderBottomLeftRadius: '8px',
        }}>
          <Trophy size={16} color="#FFFFFF" weight="fill" />
        </div>
      )}

      <div style={{ display: 'flex', gap: spacing.md }}>
        {/* Иконка */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '32px',
          background: achievement.isCompleted 
            ? `linear-gradient(135deg, ${colors.warning}, ${colors.warning}99)`
            : colors.surfaceAlt,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          flexShrink: 0,
        }}>
          {isLocked ? (
            <LockKey size={32} color={colors.textLight} />
          ) : (
            <span>{achievement.icon_url || '🏆'}</span>
          )}
        </div>

        {/* Информация */}
        <div style={{ flex: 1 }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: colors.text,
            marginBottom: spacing.xs,
          }}>
            {isLocked ? '???' : achievement.name}
          </h4>

          <p style={{
            fontSize: '14px',
            color: colors.textSecondary,
            lineHeight: '20px',
            marginBottom: spacing.sm,
          }}>
            {isLocked ? 'Секретное достижение' : achievement.description}
          </p>

          {/* Награда */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            marginBottom: spacing.sm,
          }}>
            {achievement.reward_points > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                <Star size={14} color={colors.warning} weight="fill" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>
                  +{achievement.reward_points}
                </span>
              </div>
            )}
            {achievement.reward_coins > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                <Coin size={14} color={colors.info} weight="fill" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>
                  +{achievement.reward_coins}
                </span>
              </div>
            )}
          </div>

          {/* Прогресс */}
          {!achievement.isCompleted && !isLocked && (
            <>
              <div style={{
                height: '6px',
                background: colors.border,
                borderRadius: '3px',
                overflow: 'hidden',
                marginBottom: spacing.xs,
              }}>
                <div style={{
                  height: '100%',
                  width: `${achievement.userProgress}%`,
                  background: `linear-gradient(90deg, ${colors.primary}, ${colors.primary}99)`,
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <span style={{ fontSize: '12px', color: colors.textSecondary }}>
                {Math.round(achievement.userProgress)}% выполнено
              </span>
            </>
          )}

          {/* Дата получения */}
          {achievement.isCompleted && achievement.completedAt && (
            <span style={{ fontSize: '12px', color: colors.textLight }}>
              Получено: {new Date(achievement.completedAt).toLocaleDateString('ru-RU')}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};