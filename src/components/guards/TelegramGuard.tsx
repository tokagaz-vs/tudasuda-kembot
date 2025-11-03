import React from 'react';
import { useTelegram } from '@/hooks/useTelegram';

interface TelegramGuardProps {
  children: React.ReactNode;
}

export const TelegramGuard: React.FC<TelegramGuardProps> = ({ children }) => {
  const { isReady, isTelegram, isDebugMode } = useTelegram();

  // Показываем загрузку пока не готово
  if (!isReady) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F1115',
        color: '#F5F7FA',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48,
            height: 48,
            border: '3px solid rgba(245, 247, 250, 0.1)',
            borderTopColor: '#F5F7FA',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <style>
            {`@keyframes spin { to { transform: rotate(360deg); } }`}
          </style>
          <p style={{ fontSize: 16, opacity: 0.8 }}>Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если не в Telegram и не debug режим - показываем заглушку
  if (!isTelegram && !isDebugMode) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 20,
      }}>
        <div style={{
          maxWidth: 400,
          width: '100%',
          background: 'white',
          borderRadius: 20,
          padding: 32,
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <div style={{
            width: 80,
            height: 80,
            margin: '0 auto 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
          </div>

          <h1 style={{
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 12,
            color: '#1a202c',
          }}>
            Требуется Telegram
          </h1>

          <p style={{
            fontSize: 16,
            color: '#718096',
            marginBottom: 32,
            lineHeight: 1.5,
          }}>
            Это приложение работает только внутри Telegram.
            Откройте его через бота для доступа ко всем функциям.
          </p>

          <a
            href="https://t.me/tudasuda_kembot/app"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '14px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 12,
              textDecoration: 'none',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 8 }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.56c-.21 2.27-1.13 7.75-1.6 10.28-.2 1.07-.59 1.43-.97 1.46-.82.07-1.45-.54-2.24-1.06-1.24-.82-1.95-1.33-3.15-2.13-1.39-.93-.49-1.44.3-2.27.21-.22 3.85-3.52 3.92-3.82.01-.04.01-.17-.06-.25-.08-.07-.19-.05-.27-.03-.12.02-1.96 1.25-5.54 3.66-.52.36-1.0.54-1.42.52-.47-.02-1.37-.26-2.04-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.48.98-.74 3.84-1.67 6.4-2.77 7.68-3.3 3.66-1.52 4.42-1.79 4.92-1.8.11 0 .35.02.51.12.13.08.17.19.19.31-.01.06.01.24 0 .38z"/>
            </svg>
            Открыть в Telegram
          </a>

          {import.meta.env.DEV && (
            <div style={{
              marginTop: 24,
              paddingTop: 24,
              borderTop: '1px solid #e2e8f0',
            }}>
              <p style={{
                fontSize: 12,
                color: '#a0aec0',
                marginBottom: 8,
              }}>
                Режим разработки
              </p>
              <a
                href="?debug=1"
                style={{
                  fontSize: 14,
                  color: '#667eea',
                  textDecoration: 'underline',
                }}
              >
                Включить режим отладки
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Debug режим - показываем баннер
  if (isDebugMode) {
    return (
      <>
        <div style={{
          background: '#fef3c7',
          borderBottom: '1px solid #fcd34d',
          padding: '8px 16px',
          fontSize: 14,
          textAlign: 'center',
          color: '#92400e',
        }}>
          🛠 Режим отладки активен • 
          <button
            onClick={() => window.location.href = window.location.pathname}
            style={{
              marginLeft: 8,
              color: '#7c3aed',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Выключить
          </button>
        </div>
        {children}
      </>
    );
  }

  // Все проверки пройдены - показываем приложение
  return <>{children}</>;
};