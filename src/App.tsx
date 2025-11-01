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

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const { user: telegramUser } = useTelegram();

  // Если есть Telegram пользователь, но нет авторизации в системе
  if (telegramUser && !isAuthenticated) {
    return <LoadingScreen message="Синхронизация профиля..." />;
  }

  // Если нет ни Telegram пользователя, ни авторизации
  if (!telegramUser && !isAuthenticated) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Ошибка доступа</h2>
        <p>Это приложение доступно только в Telegram</p>
      </div>
    );
  }

  return <>{children}</>;
};

// Loading Screen
const LoadingScreen: React.FC<{ message?: string }> = ({ message }) => {
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

// Main App
const App: React.FC = () => {
  const { user: telegramUser, isReady } = useTelegram();
  const { login, isLoading, isAuthenticated, user } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [authAttempted, setAuthAttempted] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      // Ждем готовности Telegram WebApp
      if (!isReady) return;

      // Если уже авторизованы и есть пользователь
      if (isAuthenticated && user) {
        console.log('✅ Пользователь уже авторизован:', user);
        setIsInitializing(false);
        return;
      }

      // Если есть Telegram пользователь и еще не пытались авторизоваться
      if (telegramUser && !authAttempted) {
        console.log('🔄 Авторизация через Telegram:', telegramUser);
        setAuthAttempted(true);
        
        try {
          const success = await login(telegramUser);
          
          if (success) {
            console.log('✅ Авторизация успешна');
          } else {
            console.error('❌ Ошибка авторизации');
          }
        } catch (error) {
          console.error('❌ Критическая ошибка авторизации:', error);
        }
      }

      setIsInitializing(false);
    };

    initializeApp();
  }, [isReady, telegramUser, login, isAuthenticated, user, authAttempted]);

  // Показываем загрузку пока инициализируется приложение
  if (!isReady || isInitializing || (isLoading && !user)) {
    return <LoadingScreen message="Инициализация приложения..." />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные роуты */}
        <Route path={ROUTES.home} element={<HomePage />} />
        
        {/* Защищенные роуты */}
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