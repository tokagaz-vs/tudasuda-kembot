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

// Loading Screen
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
          Загрузка...
        </h2>
        <p style={{ color: colors.textSecondary, fontSize: '14px' }}>
          Синхронизация данных из Telegram
        </p>
      </div>
    </div>
  );
};

// Main App
const App: React.FC = () => {
  const { user: telegramUser, isReady } = useTelegram();
  const { login, isLoading } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      if (!isReady) return;

      if (telegramUser) {
        console.log('🔄 Синхронизация профиля из Telegram:', telegramUser);
        const success = await login(telegramUser);
        
        if (success) {
          console.log('✅ Профиль синхронизирован');
        } else {
          console.error('❌ Ошибка синхронизации профиля');
        }
      }

      setIsInitializing(false);
    };

    initializeApp();
  }, [isReady, telegramUser, login]);

  if (isInitializing || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.profile} element={<ProfilePage />} />
        <Route path={ROUTES.quests} element={<QuestsPage />} />
        <Route path={ROUTES.map} element={<MapPage />} />
        <Route path={ROUTES.leaderboard} element={<LeaderboardPage />} />
        
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;