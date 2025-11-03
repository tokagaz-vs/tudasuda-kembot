import React from 'react';
import { BottomNavigation } from './BottomNavigation';
import { useTheme } from '@/hooks/useTheme';
import { TelegramGuard } from '@/components/guards/TelegramGuard';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const colors = theme?.colors || { background: '#0F1115', text: '#F5F7FA' };

  return (
    <TelegramGuard>
      <div style={{ 
        minHeight: '100vh', 
        background: colors.background, 
        color: colors.text, 
        paddingBottom: 0
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {children}
        </div>
        <BottomNavigation />
      </div>
    </TelegramGuard>
  );
};