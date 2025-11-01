import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  const { colors, spacing, borderRadius, typography } = useTheme();

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: `${spacing.md}px ${spacing.base}px`,
    paddingLeft: leftIcon ? `${spacing.xl}px` : `${spacing.base}px`,
    paddingRight: rightIcon ? `${spacing.xl}px` : `${spacing.base}px`,
    background: colors.surfaceAlt,
    border: `1px solid ${error ? colors.error : colors.border}`,
    borderRadius: borderRadius.md,
    color: colors.text,
    fontSize: typography.body.fontSize,
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  return (
    <div className={clsx('input-wrapper', className)} style={{ width: '100%' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: `${spacing.sm}px`,
            fontSize: typography.sub.fontSize,
            fontWeight: typography.label.fontWeight,
            color: colors.textSecondary,
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {leftIcon && (
          <div
            style={{
              position: 'absolute',
              left: `${spacing.md}px`,
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.textTertiary,
            }}
          >
            {leftIcon}
          </div>
        )}
        <input
          style={inputStyles}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.primary;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? colors.error : colors.border;
          }}
          {...props}
        />
        {rightIcon && (
          <div
            style={{
              position: 'absolute',
              right: `${spacing.md}px`,
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.textTertiary,
            }}
          >
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <span
          style={{
            display: 'block',
            marginTop: `${spacing.xs}px`,
            fontSize: typography.caption.fontSize,
            color: colors.error,
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
};