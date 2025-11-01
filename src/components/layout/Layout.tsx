import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { BottomNavigation } from './BottomNavigation';

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showNavigation = true }) => {
  const { colors } = useTheme();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.background,
        color: colors.text,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Main Content */}
      <main
        style={{
          flex: 1,
          paddingBottom: showNavigation ? '80px' : '0',
          overflowY: 'auto',
        }}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      {showNavigation && <BottomNavigation />}
    </div>
  );
};