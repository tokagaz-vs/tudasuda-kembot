import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Star, Coin, Sparkle } from '@phosphor-icons/react';

interface CurrencyDisplayProps {
  coins: number;
  points: number;
  experience?: number;
  layout?: 'horizontal' | 'vertical' | 'grid';
  size?: 'small' | 'medium' | 'large';
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  coins,
  points,
  experience,
  layout = 'horizontal',
  size = 'medium',
}) => {
  const { colors, spacing } = useTheme();

  const fontSize = size === 'small' ? '13px' : size === 'medium' ? '15px' : '18px';
  const iconSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;

  const CurrencyItem = ({ icon: Icon, value, label, color }: any) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: `${spacing.xs}px`,
        padding: layout === 'grid' ? `${spacing.md}px` : '0',
        background: layout === 'grid' ? colors.surfaceAlt : 'transparent',
        borderRadius: layout === 'grid' ? '12px' : '0',
      }}
    >
      <div
        style={{
          width: `${iconSize + 8}px`,
          height: `${iconSize + 8}px`,
          borderRadius: '50%',
          background: `${color}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={iconSize} color={color} weight="fill" />
      </div>
      <div>
        {layout === 'grid' && (
          <div style={{ fontSize: '11px', color: colors.textSecondary, marginBottom: '2px' }}>
            {label}
          </div>
        )}
        <div style={{ fontSize, fontWeight: 700, color: colors.text }}>
          {value.toLocaleString()}
        </div>
      </div>
    </div>
  );

  const currencies = [
    { icon: Coin, value: coins, label: 'Монеты', color: '#F59E0B' },
    { icon: Star, value: points, label: 'Очки', color: '#8B5CF6' },
  ];

  if (experience !== undefined) {
    currencies.push({ icon: Sparkle, value: experience, label: 'Опыт', color: '#3B82F6' });
  }

  const containerStyle: React.CSSProperties = {
    display: layout === 'horizontal' ? 'flex' : 'grid',
    gap: layout === 'horizontal' ? `${spacing.lg}px` : `${spacing.md}px`,
    gridTemplateColumns: layout === 'grid' ? 'repeat(auto-fit, minmax(100px, 1fr))' : undefined,
    flexDirection: layout === 'vertical' ? 'column' : undefined,
  };

  return (
    <div style={containerStyle}>
      {currencies.map((currency, index) => (
        <CurrencyItem key={index} {...currency} />
      ))}
    </div>
  );
};