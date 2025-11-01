import React, { useState } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { useTheme } from '@/hooks/useTheme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  containerStyle?: React.CSSProperties;
  isPassword?: boolean;
  variant?: 'outlined' | 'filled';
  inputSize?: 'small' | 'medium' | 'large';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconClick,
  containerStyle,
  isPassword = false,
  variant = 'outlined',
  inputSize = 'medium',
  style,
  ...props
}) => {
  const { colors, spacing, borderRadius } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const getHeight = () => {
    switch (inputSize) {
      case 'small':
        return 40;
      case 'large':
        return 56;
      default:
        return 48;
    }
  };

  const containerWrapperStyle: React.CSSProperties = {
    marginBottom: `${spacing.md}px`,
    ...containerStyle,
  };

  const inputContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: `${spacing.sm}px`,
    height: `${getHeight()}px`,
    padding: `0 ${spacing.md}px`,
    background: variant === 'filled' ? colors.surfaceAlt : 'transparent',
    border: variant === 'outlined' ? `1px solid ${error ? colors.error : isFocused ? colors.primary : colors.border}` : 'none',
    borderRadius: `${borderRadius.md}px`,
    transition: 'all 0.2s ease',
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: colors.text,
    fontSize: '16px',
    fontFamily: 'inherit',
    ...style,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: colors.text,
    marginBottom: `${spacing.xs}px`,
  };

  const errorStyle: React.CSSProperties = {
    fontSize: '12px',
    color: colors.error,
    marginTop: `${spacing.xs}px`,
  };

  const helperStyle: React.CSSProperties = {
    fontSize: '12px',
    color: colors.textSecondary,
    marginTop: `${spacing.xs}px`,
  };

  return (
    <div style={containerWrapperStyle}>
      {label && <label style={labelStyle}>{label}</label>}

      <div style={inputContainerStyle}>
        {leftIcon && <div style={{ display: 'flex', color: error ? colors.error : colors.textSecondary }}>{leftIcon}</div>}

        <input
          {...props}
          type={isPassword && !showPassword ? 'password' : 'text'}
          style={inputStyle}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              padding: 0,
              color: colors.textSecondary,
            }}
          >
            {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
          </button>
        )}

        {rightIcon && !isPassword && (
          <button
            type="button"
            onClick={onRightIconClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: onRightIconClick ? 'pointer' : 'default',
              display: 'flex',
              padding: 0,
              color: colors.textSecondary,
            }}
            disabled={!onRightIconClick}
          >
            {rightIcon}
          </button>
        )}
      </div>

      {error && <div style={errorStyle}>{error}</div>}
      {helperText && !error && <div style={helperStyle}>{helperText}</div>}
    </div>
  );
};