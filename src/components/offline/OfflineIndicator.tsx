import React, { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { WifiSlash, WifiHigh } from '@phosphor-icons/react'; // ✅ Исправлено: Wifi → WifiHigh

export const OfflineIndicator: React.FC = () => {
  const { colors, spacing } = useTheme();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator) return null;

  return (
    <div style={{
      position: 'fixed',
      top: spacing.lg,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      padding: `${spacing.md}px ${spacing.lg}px`,
      borderRadius: '999px',
      background: isOnline ? colors.success : colors.error,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: spacing.sm,
      animation: 'slideInDown 0.3s ease',
    }}>
      {isOnline ? (
        <WifiHigh size={20} color="#FFFFFF" weight="bold" />
      ) : (
        <WifiSlash size={20} color="#FFFFFF" weight="bold" />
      )}
      <span style={{
        fontSize: '14px',
        fontWeight: 600,
        color: '#FFFFFF',
      }}>
        {isOnline ? 'Подключение восстановлено' : 'Нет подключения к сети'}
      </span>

      <style>
        {`
          @keyframes slideInDown {
            from {
              opacity: 0;
              transform: translate(-50%, -100%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
        `}
      </style>
    </div>
  );
};