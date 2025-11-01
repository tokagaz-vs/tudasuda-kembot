import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}) => {
  const { colors, spacing, borderRadius, typography, shadows, animation } = useTheme();

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${spacing.sm}px`,
    border: 'none',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    fontWeight: typography.button.fontWeight,
    fontSize: typography.button.fontSize,
    lineHeight: typography.button.lineHeight,
    letterSpacing: typography.button.letterSpacing,
    transition: `all ${animation.duration.normal} ${animation.easing.standard}`,
    opacity: disabled || isLoading ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    textDecoration: 'none',
    userSelect: 'none',
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: `${spacing.sm}px ${spacing.base}px`,
      borderRadius: borderRadius.sm,
      fontSize: '14px',
    },
    md: {
      padding: `${spacing.md}px ${spacing.lg}px`,
      borderRadius: borderRadius.md,
    },
    lg: {
      padding: `${spacing.base}px ${spacing.xl}px`,
      borderRadius: borderRadius.lg,
      fontSize: '18px',
    },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: colors.primary,
      color: '#FFFFFF',
      boxShadow: shadows.md,
    },
    secondary: {
      background: colors.secondary,
      color: '#FFFFFF',
      boxShadow: shadows.md,
    },
    outline: {
      background: 'transparent',
      color: colors.primary,
      border: `2px solid ${colors.primary}`,
    },
    ghost: {
      background: 'transparent',
      color: colors.text,
    },
    danger: {
      background: colors.error,
      color: '#FFFFFF',
      boxShadow: shadows.md,
    },
  };

  const hoverStyles: Record<string, string> = {
    primary: colors.primaryDark,
    secondary: colors.secondaryDark,
    outline: colors.stateHover,
    ghost: colors.stateHover,
    danger: colors.errorLight,
  };

  return (
    <button
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
      }}
      className={clsx('button', className)}
      disabled={disabled || isLoading}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading && variant !== 'outline' && variant !== 'ghost') {
          e.currentTarget.style.background = hoverStyles[variant];
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.background =
            variant === 'outline' || variant === 'ghost'
              ? 'transparent'
              : variantStyles[variant].background as string;
        }
      }}
      {...props}
    >
      {isLoading && (
        <div
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      )}
      {!isLoading && leftIcon && <span>{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span>{rightIcon}</span>}
    </button>
  );
};