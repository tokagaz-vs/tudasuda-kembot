import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useTheme } from '@/hooks/useTheme';

export const NotificationBadge: React.FC = () => {
  const { unreadCount } = useNotifications();
  const { colors } = useTheme();

  if (unreadCount === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '-4px',
      right: '-4px',
      minWidth: '18px',
      height: '18px',
      borderRadius: '9px',
      background: colors.error,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 4px',
    }}>
      <span style={{
        fontSize: '11px',
        fontWeight: 700,
        color: '#FFFFFF',
      }}>
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    </div>
  );
};