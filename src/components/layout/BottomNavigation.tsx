import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/constants';
import { 
  House, 
  MapTrifold, 
  Crosshair, 
  ChartBar, 
  User 
} from '@phosphor-icons/react';

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  // Проверка на случай если theme undefined
  const colors = theme?.colors || {
    background: '#0F1115',
    surface: '#151821',
    primary: '#FF6A00',
    text: '#F5F7FA',
    textSecondary: '#B4BDCC',
  };
  
  const spacing = theme?.spacing || {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
  };

  const tabs = [
    { path: ROUTES.home, icon: House, label: 'Главная' },
    { path: ROUTES.map, icon: MapTrifold, label: 'Карта' },
    { path: ROUTES.quests, icon: Crosshair, label: 'Квесты' },
    { path: ROUTES.leaderboard, icon: ChartBar, label: 'Рейтинг' },
    { path: ROUTES.profile, icon: User, label: 'Профиль' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: colors.surface,
        borderTop: `1px solid ${colors.surface}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: `${spacing.sm}px ${spacing.xs}px`,
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);

          return (
            <div
              key={tab.path}
              onClick={() => navigate(tab.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: `${spacing.xs}px ${spacing.sm}px`,
                cursor: 'pointer',
                flex: 1,
                transition: 'all 0.2s ease',
                opacity: active ? 1 : 0.6,
              }}
            >
              <Icon
                size={24}
                color={active ? colors.primary : colors.text}
                weight={active ? 'fill' : 'regular'}
              />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: active ? 600 : 400,
                  color: active ? colors.primary : colors.textSecondary,
                }}
              >
                {tab.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};