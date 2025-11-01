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

// Main App Component
const App: React.FC = () => {
  const { user: telegramUser, isReady } = useTelegram();
  const { user, login, isLoading } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      // Ждем инициализации Telegram WebApp
      if (!isReady) return;

      // Если есть данные пользователя из Telegram
      if (telegramUser) {
        // Авторизуем пользователя через Supabase
        await login(telegramUser);
      }

      setIsInitializing(false);
    };

    initializeApp();
  }, [isReady, telegramUser, login]);

  // Показываем экран загрузки
  if (isInitializing || isLoading) {
    return <LoadingScreen />;
  }

  // Если нет пользователя после инициализации (не в Telegram)
  if (!user && !telegramUser) {
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
        }}
      >
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🚫</h1>
        <h2 style={{ marginBottom: '10px' }}>Доступ запрещен</h2>
        <p style={{ color: '#888' }}>
          Это приложение доступно только через Telegram Mini App
        </p>
        <p style={{ color: '#888', marginTop: '10px', fontSize: '14px' }}>
          Откройте приложение в Telegram
        </p>
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
    </BrowserRouter>
  );
};

export default App;