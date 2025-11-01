import React from 'react';
import { useTheme } from '@/hooks/useTheme';

type CardVariant = 'default' | 'glass' | 'gradient' | 'outlined';

type CardProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onPress?: () => void;
  variant?: CardVariant;
  gradient?: readonly [string, string, ...string[]];
  elevated?: boolean;
  padding?: number; // Только number, без string
  borderRadius?: number;
};

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  gradient,
  elevated = true,
  padding,
  borderRadius,
}) => {
  const { colors, spacing, borderRadius: themeBorderRadius } = useTheme();

  const getPadding = () => {
    if (typeof padding === 'number') return `${padding}px`;
    return `${spacing.base}px`;
  };

  const getBackground = () => {
    switch (variant) {
      case 'glass':
        return colors.glass;
      case 'gradient':
        const grad = gradient || ['#FF6A00', '#FF2D55'];
        return `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`;
      case 'outlined':
        return colors.surface;
      default:
        return colors.surface;
    }
  };

  const getBorder = () => {
    if (variant === 'glass' || variant === 'outlined') {
      return `1px solid ${colors.border}`;
    }
    return 'none';
  };

  const getShadow = () => {
    if (!elevated) return 'none';
    switch (variant) {
      case 'glass':
        return '0 2px 8px rgba(0,0,0,0.08)';
      case 'gradient':
        return '0 4px 12px rgba(0,0,0,0.12)';
      default:
        return '0 2px 8px rgba(0,0,0,0.08)';
    }
  };

  const cardStyle: React.CSSProperties = {
    background: getBackground(),
    border: getBorder(),
    borderRadius: `${borderRadius ?? themeBorderRadius.lg}px`,
    padding: getPadding(),
    boxShadow: getShadow(),
    backdropFilter: variant === 'glass' ? 'blur(12px)' : 'none',
    WebkitBackdropFilter: variant === 'glass' ? 'blur(12px)' : 'none',
    cursor: onPress ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    ...style,
  };

  return (
    <div
      style={cardStyle}
      onClick={onPress}
      onMouseEnter={(e) => {
        if (onPress) {
          e.currentTarget.style.transform = 'scale(0.98)';
        }
      }}
      onMouseLeave={(e) => {
        if (onPress) {
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      {children}
    </div>
  );
};