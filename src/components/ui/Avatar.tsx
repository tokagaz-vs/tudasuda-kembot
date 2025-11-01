import React from 'react';
import { User, Crown } from '@phosphor-icons/react';
import { useTheme } from '@/hooks/useTheme';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  variant?: 'default' | 'gradient' | 'premium';
  showBorder?: boolean;
  borderColor?: string;
}

const SIZES = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 100,
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  fallback,
  variant = 'default',
  showBorder = false,
  borderColor,
}) => {
  const { colors, gradients } = useTheme();
  const sizeValue = SIZES[size];

  const getBackground = () => {
    if (variant === 'gradient') {
      return `linear-gradient(135deg, ${gradients.brand.colors[0]}, ${gradients.brand.colors[1]})`;
    }
    if (variant === 'premium') {
      return 'linear-gradient(135deg, #FFD700, #FFA500)';
    }
    return colors.surfaceAlt;
  };

  const containerStyle: React.CSSProperties = {
    width: `${sizeValue}px`,
    height: `${sizeValue}px`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    background: src ? 'transparent' : getBackground(),
    border: showBorder ? `3px solid ${borderColor || colors.border}` : 'none',
    flexShrink: 0,
  };

  return (
    <div style={containerStyle}>
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : fallback ? (
        <span
          style={{
            fontSize: `${sizeValue * 0.4}px`,
            fontWeight: 600,
            color: '#FFFFFF',
          }}
        >
          {fallback}
        </span>
      ) : (
        <User size={sizeValue * 0.5} color={colors.textLight} weight="bold" />
      )}

      {variant === 'premium' && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: `${sizeValue * 0.3}px`,
            height: `${sizeValue * 0.3}px`,
            borderRadius: '50%',
            background: colors.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #FFFFFF',
          }}
        >
          <Crown size={sizeValue * 0.15} color="#FFFFFF" weight="fill" />
        </div>
      )}
    </div>
  );
};