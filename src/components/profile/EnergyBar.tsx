import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Lightning, Clock } from '@phosphor-icons/react';

interface EnergyBarProps {
  current: number;
  max: number;
  showDetails?: boolean;
  compact?: boolean;
}

export const EnergyBar: React.FC<EnergyBarProps> = ({
  current,
  max,
  showDetails = true,
  compact = false,
}) => {
  const { colors, spacing } = useTheme();

  const percentage = Math.min(100, (current / max) * 100);
  const isLow = percentage < 30;
  const isMedium = percentage >= 30 && percentage < 70;

  const getEnergyColor = () => {
    if (isLow) return '#EF4444'; // Красный
    if (isMedium) return '#F59E0B'; // Оранжевый
    return '#10B981'; // Зеленый
  };

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Lightning size={16} color={getEnergyColor()} weight="fill" />
        <span style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>
          {current}/{max}
        </span>
      </div>
    );
  }

  return (
    <div>
      {/* Заголовок */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: `${spacing.sm}px`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: `${spacing.xs}px` }}>
          <Lightning size={20} color={getEnergyColor()} weight="fill" />
          <span style={{ fontSize: '14px', fontWeight: 600, color: colors.text }}>
            Энергия
          </span>
        </div>
        
        <span style={{ fontSize: '15px', fontWeight: 700, color: getEnergyColor() }}>
          {current} / {max}
        </span>
      </div>

      {/* Прогресс бар энергии */}
      <div
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
            background: getEnergyColor(),
            transition: 'all 0.3s ease',
            position: 'relative',
          }}
        >
          {/* Пульсация при низкой энергии */}
          {isLow && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255,255,255,0.3)',
                animation: 'pulse 1.5s infinite',
              }}
            />
          )}
        </div>
      </div>

      {/* Детали */}
      {showDetails && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} color={colors.textSecondary} />
          <span style={{ fontSize: '11px', color: colors.textSecondary }}>
            Восстанавливается автоматически
          </span>
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
        `}
      </style>
    </div>
  );
};