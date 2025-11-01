import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTelegram } from '@/hooks/useTelegram';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/constants';

import {
  HomePage,
  ProfilePage,
  QuestsPage,
  MapPage,
  LeaderboardPage,
} from '@/pages';

const LoadingScreen: React.FC<{ message?: string }> = ({ message }) => {
  const theme = useTheme();
  const colors = theme?.colors || {
    background: '#0F1115',
    text: '#F5F7FA',
    surfaceAlt: '#1C1F2A',
    primary: '#FF6A00',
    textSecondary: '#B4BDCC',
  };
  const spacing = theme?.spacing || { xl: 24, lg: 20, xs: 8 };

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
        gap: `${spacing.lg}px`,
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
        }}
      />
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: `${spacing.xs}px` }}>
          {message || 'Загрузка...'}
        </h2>
        <p style={{ color: colors.textSecondary, fontSize: '14px' }}>
          Подождите немного
        </p>
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isReady } = useTelegram();
  const { isLoading } = useAuthStore();
  
  if (!isReady) return <LoadingScreen message="Инициализация Telegram..." />;
  if (isLoading) return <LoadingScreen message="Загрузка профиля..." />;
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const { user: telegramUser, isReady, isTelegram, webApp } = useTelegram();
  const { login, isLoading: _isLoading, isAuthenticated, user } = useAuthStore();
  const [authAttempted, setAuthAttempted] = useState(false);

  useEffect(() => {
    const attemptAuth = async () => {
      console.log('[App] State:', {
        isReady,
        isTelegram,
        hasTelegramUser: !!telegramUser,
        isAuthenticated,
        hasUser: !!user,
        authAttempted,
        platform: webApp?.platform,
      });

      if (!isReady) {
        console.log('[App] Waiting for Telegram SDK...');
        return;
      }

      if (isAuthenticated && user) {
        console.log('[App] Already authenticated');
        return;
      }

      if (telegramUser && !authAttempted) {
        setAuthAttempted(true);
        console.log('[App] Attempting login...', telegramUser);
        
        try {
          const success = await login(telegramUser);
          console.log('[App] Login result:', success);
        } catch (error) {
          console.error('[App] Login error:', error);
        }
      } else if (!telegramUser && isReady) {
        console.warn('[App] ⚠️ No Telegram user available');
        // Показываем debug info
        console.log('Debug info:', window.__tgDebug);
      }
    };

    attemptAuth();
  }, [isReady, isTelegram, telegramUser, isAuthenticated, user, login, authAttempted, webApp]);

  // Показываем лоадер только пока не готов Telegram SDK
  if (!isReady) {
    return <LoadingScreen message="Подключение к Telegram..." />;
  }

  // ✅ ВАЖНО: НЕ блокируем доступ, даже если нет user
  // Это позволит увидеть что происходит
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route
          path={ROUTES.profile}
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.quests}
          element={
            <ProtectedRoute>
              <QuestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.map}
          element={
            <ProtectedRoute>
              <MapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.leaderboard}
          element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;