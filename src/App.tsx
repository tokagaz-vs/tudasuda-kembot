import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTelegram } from '@/hooks/useTelegram';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/constants';

// Pages
import {
  HomePage,
  ProfilePage,
  QuestsPage,
  MapPage,
  LeaderboardPage,
} from '@/pages';

// Loading Screen Component
const LoadingScreen: React.FC = () => {
  const { colors, spacing } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: colors.background,
        color: colors.text,
        padding: `${spacing.xl}px`,
      }}
    >
      <div
        style={{
          width: '60px',
          height: '60px',
          border: `4px solid ${colors.surfaceAlt}`,
          borderTopColor: colors.primary,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: `${spacing.lg}px`,
        }}
      />
      <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Загрузка...</h2>
      <p style={{ color: colors.textSecondary, marginTop: `${spacing.sm}px` }}>
        Инициализация приложения
      </p>
    </div>
  );
};

// Debug Info Component (только для разработки)
const DebugInfo: React.FC<{ info: any }> = ({ info }) => {
  if (import.meta.env.PROD) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.9)',
        color: '#0f0',
        padding: '10px',
        fontSize: '10px',
        borderRadius: '8px',
        maxHeight: '200px',
        overflow: 'auto',
        zIndex: 9999,
        fontFamily: 'monospace',
      }}
    >
      <pre>{JSON.stringify(info, null, 2)}</pre>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const { user: telegramUser, isReady } = useTelegram();
  const { user, login, isLoading } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const initializeApp = async () => {
      // Отладочная информация
      const debug = {
        isReady,
        hasTelegramWebApp: !!window.Telegram?.WebApp,
        hasUser: !!telegramUser,
        webAppVersion: window.Telegram?.WebApp?.version,
        platform: window.Telegram?.WebApp?.platform,
        initData: window.Telegram?.WebApp?.initData,
        isDev: import.meta.env.DEV,
      };
      
      setDebugInfo(debug);
      console.log('🔍 Debug Info:', debug);

      // Ждем инициализации Telegram WebApp
      if (!isReady) {
        console.log('⏳ Waiting for Telegram WebApp to be ready...');
        return;
      }

      // Если есть данные пользователя из Telegram
      if (telegramUser) {
        console.log('👤 Telegram user found:', telegramUser);
        await login(telegramUser);
      } else {
        console.warn('⚠️ No Telegram user data');
      }

      setIsInitializing(false);
    };

    initializeApp();
  }, [isReady, telegramUser, login]);

  // Показываем экран загрузки
  if (isInitializing || isLoading) {
    return (
      <>
        <LoadingScreen />
        <DebugInfo info={debugInfo} />
      </>
    );
  }

  // ВРЕМЕННО ОТКЛЮЧАЕМ ПРОВЕРКУ для отладки
  // Проверяем только в production и если точно нет Telegram
  const isTelegramEnvironment = 
    !!window.Telegram?.WebApp || 
    import.meta.env.DEV || 
    window.location.search.includes('tgWebAppData');

  if (!isTelegramEnvironment && import.meta.env.PROD) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          background: '#0F1115',
          color: '#F5F7FA',
        }}
      >
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🚫</h1>
        <h2 style={{ marginBottom: '10px' }}>Доступ запрещен</h2>
        <p style={{ color: '#888', marginBottom: '20px' }}>
          Это приложение доступно только через Telegram Mini App
        </p>
        <p style={{ color: '#888', fontSize: '14px' }}>
          Откройте приложение в Telegram
        </p>
        
        {/* Debug info */}
        <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
          <details>
            <summary>Debug Info</summary>
            <pre style={{ textAlign: 'left', marginTop: '10px' }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.profile} element={<ProfilePage />} />
        <Route path={ROUTES.quests} element={<QuestsPage />} />
        <Route path={ROUTES.map} element={<MapPage />} />
        <Route path={ROUTES.leaderboard} element={<LeaderboardPage />} />
        
        {/* Redirect to home for unknown routes */}
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
      
      {/* Debug panel в dev режиме */}
      <DebugInfo info={{ ...debugInfo, currentUser: user }} />
    </BrowserRouter>
  );
};

export default App;