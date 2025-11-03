import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { rewardsService } from '@/services/rewards.service';
import { Star, TrendUp } from '@phosphor-icons/react';

interface LevelProgressProps {
  level: number;
  experience: number;
  showDetails?: boolean;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({
  level,
  experience,
  showDetails = true,
}) => {
  const { colors, spacing, gradients } = useTheme();

  const levelInfo = rewardsService.getLevelInfo(level);
  const progress = rewardsService.getLevelProgress(experience, level);
  const nextLevelInfo = rewardsService.getLevelInfo(level + 1);

  const percentage = Math.round(progress.percentage);

  return (
    <div>
      {/* Заголовок уровня */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: `${spacing.sm}px`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: `${spacing.xs}px` }}>
          <Star size={20} color={colors.warning} weight="fill" />
          <span style={{ fontSize: '14px', fontWeight: 600, color: colors.text }}>
            Уровень {level} • {levelInfo.title}
          </span>
        </div>

        {!progress.isMaxLevel && (
          <span style={{ fontSize: '13px', fontWeight: 600, color: colors.primary }}>
            {percentage}%
          </span>
        )}
      </div>

      {/* Прогресс бар */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        style={{
          height: '8px',
          background: colors.surfaceAlt,
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: showDetails ? `${spacing.sm}px` : 0,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${gradients.brand.colors[0]}, ${gradients.brand.colors[1]})`,
            transition: 'width 0.3s ease',
            position: 'relative',
          }}
        >
          {/* Блеск эффект */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'shine 2s infinite',
            }}
          />
        </div>
      </div>

      {/* Детали прогресса */}
      {showDetails && !progress.isMaxLevel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: colors.textSecondary }}>
            {Math.max(0, Math.floor(progress.current)).toLocaleString()} / {Math.max(0, Math.floor(progress.required)).toLocaleString()} XP
          </span>
          {nextLevelInfo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendUp size={12} color={colors.success} weight="bold" />
              <span style={{ fontSize: '11px', color: colors.success, fontWeight: 600 }}>
                {nextLevelInfo.title}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Максимальный уровень */}
      {showDetails && progress.isMaxLevel && (
        <div style={{ textAlign: 'center', padding: `${spacing.xs}px 0` }}>
          <span style={{ fontSize: '12px', color: colors.warning, fontWeight: 600 }}>
            🏆 Максимальный уровень достигнут!
          </span>
        </div>
      )}

      <style>
        {`
          @keyframes shine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </div>
  );
};