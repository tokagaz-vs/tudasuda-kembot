import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  padding = 'md',
  hover = false,
  style,
}) => {
  const { colors, spacing, borderRadius, shadows, animation } = useTheme();

  const paddingStyles: Record<string, string> = {
    none: '0',
    sm: `${spacing.sm}px`,
    md: `${spacing.base}px`,
    lg: `${spacing.lg}px`,
  };

  const baseStyles: React.CSSProperties = {
    background: colors.surface,
    borderRadius: borderRadius.lg,
    padding: paddingStyles[padding],
    boxShadow: shadows.sm,
    border: `1px solid ${colors.border}`,
    transition: `all ${animation.duration.normal} ${animation.easing.standard}`,
    cursor: onClick ? 'pointer' : 'default',
    ...style, // Добавляем кастомные стили
  };

  return (
    <div
      style={baseStyles}
      className={clsx('card', className)}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = shadows.lg;
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = shadows.sm;
        }
      }}
    >
      {children}
    </div>
  );
};