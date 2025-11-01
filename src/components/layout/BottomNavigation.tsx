import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants';

interface NavItem {
  path: string;
  icon: string;
  labelKey: string;
}

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { colors, spacing, shadows, zIndex } = useTheme();
  const { t } = useTranslation();

  const navItems: NavItem[] = [
    { path: ROUTES.home, icon: '🏠', labelKey: 'navigation.home' },
    { path: ROUTES.quests, icon: '🎯', labelKey: 'navigation.quests' },
    { path: ROUTES.map, icon: '🗺️', labelKey: 'navigation.map' },
    { path: ROUTES.leaderboard, icon: '🏆', labelKey: 'navigation.leaderboard' },
    { path: ROUTES.profile, icon: '👤', labelKey: 'navigation.profile' },
  ];

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: colors.surface,
    borderTop: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: `${spacing.sm}px 0`,
    boxShadow: shadows.lg,
    zIndex: zIndex.sticky,
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={containerStyle}>
      {navItems.map((item) => {
        const active = isActive(item.path);
        
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: `${spacing.xs}px`,
              padding: `${spacing.xs}px ${spacing.sm}px`,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: active ? colors.primary : colors.textSecondary,
              transition: 'all 0.2s ease',
              minWidth: '60px',
            }}
          >
            <span style={{ fontSize: '24px' }}>{item.icon}</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: active ? 600 : 400,
              }}
            >
              {t(item.labelKey)}
            </span>
          </button>
        );
      })}
    </nav>
  );
};