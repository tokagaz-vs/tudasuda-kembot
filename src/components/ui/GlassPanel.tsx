import React from 'react';
import { useTheme } from '@/hooks/useTheme';

interface GlassPanelProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  intensity?: 'light' | 'medium' | 'heavy';
  borderRadius?: number;
  padding?: number;
  withBorder?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  style,
  intensity = 'medium',
  borderRadius,
  padding,
  withBorder = true,
}) => {
  const { colors, spacing, borderRadius: themeBorderRadius } = useTheme();

  const getBlur = () => {
    switch (intensity) {
      case 'light':
        return '8px';
      case 'heavy':
        return '24px';
      default:
        return '12px';
    }
  };

  const panelStyle: React.CSSProperties = {
    background: colors.glass,
    backdropFilter: `blur(${getBlur()})`,
    WebkitBackdropFilter: `blur(${getBlur()})`,
    border: withBorder ? `1px solid ${colors.border}` : 'none',
    borderRadius: `${borderRadius ?? themeBorderRadius.lg}px`,
    padding: `${padding ?? spacing.base}px`,
    ...style,
  };

  return <div style={panelStyle}>{children}</div>;
};