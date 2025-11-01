import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import clsx from 'clsx';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  fallback,
  className,
  style,
}) => {
  const { colors, borderRadius, shadows } = useTheme();

  const sizeMap = {
    sm: '32px',
    md: '48px',
    lg: '64px',
    xl: '96px',
  };

  const styles: React.CSSProperties = {
    width: sizeMap[size],
    height: sizeMap[size],
    borderRadius: borderRadius.round,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.surfaceAlt,
    border: `2px solid ${colors.border}`,
    boxShadow: shadows.sm,
    fontSize: size === 'sm' ? '14px' : size === 'md' ? '18px' : size === 'lg' ? '24px' : '32px',
    fontWeight: 600,
    color: colors.textSecondary,
    flexShrink: 0,
    ...style,
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        style={styles}
        className={clsx('avatar', className)}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div style={styles} className={clsx('avatar', className)}>
      {fallback || alt.charAt(0).toUpperCase()}
    </div>
  );
};