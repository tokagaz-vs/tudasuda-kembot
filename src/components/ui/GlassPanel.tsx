import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import clsx from 'clsx';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;
  style?: React.CSSProperties;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className,
  blur = 'md',
  opacity = 0.1,
  style,
}) => {
  const { colors, spacing, borderRadius, blur: blurValues } = useTheme();

  const styles: React.CSSProperties = {
    background: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: `blur(${blurValues[blur]})`,
    WebkitBackdropFilter: `blur(${blurValues[blur]})`,
    border: `1px solid ${colors.borderLight}`,
    borderRadius: borderRadius.lg,
    padding: `${spacing.base}px`,
    ...style, // Добавляем кастомные стили
  };

  return (
    <div style={styles} className={clsx('glass-panel', className)}>
      {children}
    </div>
  );
};