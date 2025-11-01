import { useEffect, useState } from 'react';
import { TelegramWebApp, TelegramUser } from '@/types';

interface UseTelegramReturn {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  isReady: boolean;
  platform: string;
  colorScheme: 'light' | 'dark';
  showMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
  showBackButton: (onClick: () => void) => void;
  hideBackButton: () => void;
  showAlert: (message: string) => Promise<void>;
  showConfirm: (message: string) => Promise<boolean>;
  hapticFeedback: {
    impact: (style: 'light' | 'medium' | 'heavy') => void;
    notification: (type: 'error' | 'success' | 'warning') => void;
    selection: () => void;
  };
  expand: () => void;
  close: () => void;
}

const MOCK_USER: TelegramUser = {
  id: 123456789,
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser',
  language_code: 'ru',
  is_premium: false,
  photo_url: undefined,
};

export const useTelegram = (): UseTelegramReturn => {
  const [isReady, setIsReady] = useState(false);
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 100;
    
    const checkTelegram = () => {
      attempts++;
      
      const app = window.Telegram?.WebApp;

      if (app) {
        console.log('✅ Telegram WebApp found:', {
          version: app.version,
          platform: app.platform,
          colorScheme: app.colorScheme,
          hasUser: !!app.initDataUnsafe?.user
        });

        app.ready();
        app.expand();
        setWebApp(app);
        setIsReady(true);

        if (app.colorScheme === 'dark') {
          document.body.classList.add('dark');
        } else {
          document.body.classList.remove('dark');
        }
      } else if (attempts < maxAttempts) {
        console.log(`⏳ Waiting for Telegram WebApp... (${attempts}/${maxAttempts})`);
        setTimeout(checkTelegram, 100);
      } else {
        console.warn('⚠️ Telegram WebApp not available after', maxAttempts, 'attempts');
        console.log('Using development mode with mock data');
        setIsReady(true);
      }
    };

    checkTelegram();
  }, []);

  const showMainButton = (text: string, onClick: () => void) => {
    if (!webApp) return;
    webApp.MainButton.setText(text);
    webApp.MainButton.onClick(onClick);
    webApp.MainButton.show();
  };

  const hideMainButton = () => {
    if (!webApp) return;
    webApp.MainButton.hide();
  };

  const showBackButton = (onClick: () => void) => {
    if (!webApp) return;
    webApp.BackButton.onClick(onClick);
    webApp.BackButton.show();
  };

  const hideBackButton = () => {
    if (!webApp) return;
    webApp.BackButton.hide();
  };

  const showAlert = (message: string): Promise<void> => {
    return new Promise((resolve) => {
      if (webApp) {
        webApp.showAlert(message, () => resolve());
      } else {
        alert(message);
        resolve();
      }
    });
  };

  const showConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (webApp) {
        webApp.showConfirm(message, (confirmed) => resolve(confirmed));
      } else {
        resolve(confirm(message));
      }
    });
  };

  const hapticFeedback = {
    impact: (style: 'light' | 'medium' | 'heavy') => {
      webApp?.HapticFeedback.impactOccurred(style);
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      webApp?.HapticFeedback.notificationOccurred(type);
    },
    selection: () => {
      webApp?.HapticFeedback.selectionChanged();
    },
  };

  const expand = () => {
    webApp?.expand();
  };

  const close = () => {
    webApp?.close();
  };

  const user = webApp?.initDataUnsafe?.user || (import.meta.env.DEV ? MOCK_USER : null);

  return {
    webApp,
    user,
    isReady,
    platform: webApp?.platform || 'web',
    colorScheme: webApp?.colorScheme || 'dark',
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    showAlert,
    showConfirm,
    hapticFeedback,
    expand,
    close,
  };
};