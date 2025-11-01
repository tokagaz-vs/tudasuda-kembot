import React from 'react';
import { useTheme } from '@/hooks/useTheme';

interface ButtonProps {
  title: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'glass' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onClick,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
}) => {
  const { colors, gradients, spacing } = useTheme();

  const getHeight = () => {
    switch (size) {
      case 'small':
        return 36;
      case 'large':
        return 56;
      default:
        return 48;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  const getBackground = () => {
    switch (variant) {
      case 'primary':
        return `linear-gradient(135deg, ${gradients.brand.colors[0]}, ${gradients.brand.colors[1]})`;
      case 'secondary':
        return `linear-gradient(135deg, ${gradients.accent.colors[0]}, ${gradients.accent.colors[1]})`;
      case 'glass':
        return colors.glass;
      case 'outline':
        return 'transparent';
      case 'ghost':
        return 'transparent';
      case 'danger':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return colors.primary;
      case 'glass':
        return colors.text;
      default:
        return '#FFFFFF';
    }
  };

  const getBorder = () => {
    if (variant === 'outline') {
      return `2px solid ${colors.primary}`;
    }
    if (variant === 'glass') {
      return `1px solid ${colors.border}`;
    }
    return 'none';
  };

  const buttonStyle: React.CSSProperties = {
    height: `${getHeight()}px`,
    padding: `0 ${spacing.lg}px`,
    borderRadius: '999px',
    border: getBorder(),
    background: getBackground(),
    color: getTextColor(),
    fontSize: `${getFontSize()}px`,
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${spacing.sm}px`,
    width: fullWidth ? '100%' : 'auto',
    transition: 'all 0.2s ease',
    boxShadow:
      variant === 'primary' || variant === 'secondary'
        ? '0 4px 12px rgba(0,0,0,0.15)'
        : 'none',
    backdropFilter: variant === 'glass' ? 'blur(12px)' : 'none',
    WebkitBackdropFilter: variant === 'glass' ? 'blur(12px)' : 'none',
    ...style,
  };

  return (
    <button
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'scale(0.98)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {loading ? (
        <div
          style={{
            width: '20px',
            height: '20px',
            border: `3px solid ${variant === 'primary' || variant === 'secondary' ? '#FFFFFF' : colors.primary}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <span>{title}</span>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </button>
  );
};