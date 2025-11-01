import React from 'react';
import { useTheme } from '@/hooks/useTheme';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius,
  className,
}) => {
  const { colors, borderRadius: br } = useTheme();

  const styles: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: borderRadius || br.md,
    background: `linear-gradient(90deg, ${colors.surfaceAlt} 25%, ${colors.stateHover} 50%, ${colors.surfaceAlt} 75%)`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  };

  return <div style={styles} className={className} />;
};