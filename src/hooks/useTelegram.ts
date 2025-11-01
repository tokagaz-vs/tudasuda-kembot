import { useEffect, useMemo, useState } from 'react';
import { TelegramWebApp, TelegramUser } from '@/types';

interface UseTelegramReturn {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  isReady: boolean;
  isTelegram: boolean;
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

declare global {
  interface Window {
    __tgBoot?: {
      ready: boolean;
      platform?: string;
      version?: string;
      initData?: string;
      hasUser?: boolean;
      attempts?: number;
      error?: string;
      loadTime?: number;
      ua?: string;
      referrer?: string;
      search?: string;
      hash?: string;
    };
    __tgDebug?: any;
    Telegram?: { WebApp: TelegramWebApp };
  }
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

const waitForTelegram = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Проверяем сразу
    if (window.Telegram?.WebApp) {
      resolve(true);
      return;
    }

    let attempts = 0;
    const maxAttempts = 150; // Для iOS нужно больше времени
    
    const tick = () => {
      attempts++;
      
      if (window.Telegram?.WebApp) {
        console.log(`✅ Telegram SDK ready after ${attempts} attempts`);
        resolve(true);
      } else if (attempts >= maxAttempts) {
        console.warn('⚠️ Telegram SDK timeout, continuing anyway');
        resolve(false); // Не блокируем приложение
      } else {
        setTimeout(tick, 100);
      }
    };
    
    tick();
  });
};

export const useTelegram = (): UseTelegramReturn => {
  const [isReady, setIsReady] = useState(false);
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const forceTg = params.get('force_tg') === '1';
  const mock = params.get('mock') === '1' || import.meta.env.DEV;

  // Эвристики для определения Telegram окружения
  const isTelegramUA = useMemo(() => /Telegram/i.test(navigator.userAgent), []);
  const isTgParam = useMemo(() => {
    const search = window.location.search;
    const hash = window.location.hash;
    return search.includes('tgWebApp') || hash.includes('tgWebApp') || hash.includes('tgWebAppData');
  }, []);
  const isTgRef = useMemo(() => {
    const ref = document.referrer || '';
    return ref.includes('t.me') || ref.includes('telegram.org');
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      console.log('[useTelegram] Initializing...', {
        bootReady: window.__tgBoot?.ready,
        hasWebApp: !!window.Telegram?.WebApp,
        ua: isTelegramUA,
        param: isTgParam,
        ref: isTgRef,
      });

      try {
        // Ждем Telegram SDK
        const sdkReady = await waitForTelegram();
        
        if (cancelled) return;

        const app = window.Telegram?.WebApp || null;

        if (app) {
          try {
            app.ready();
            app.expand();
            
            // Устанавливаем тему
            if (app.colorScheme === 'dark') {
              document.body.classList.add('dark');
            } else {
              document.body.classList.remove('dark');
            }
            
            setWebApp(app);
            
            console.log('[useTelegram] ✅ WebApp initialized', {
              platform: app.platform,
              version: app.version,
              colorScheme: app.colorScheme,
              hasUser: !!app.initDataUnsafe?.user,
              initDataLength: app.initData?.length || 0,
            });
          } catch (e) {
            console.error('[useTelegram] Error initializing WebApp:', e);
          }
        } else {
          console.warn('[useTelegram] ⚠️ WebApp not available, using fallback mode');
        }

        // Debug info
        window.__tgDebug = {
          sdk: {
            ready: sdkReady,
            hasWebApp: !!app,
            hasUser: !!app?.initDataUnsafe?.user,
            platform: app?.platform,
            version: app?.version,
            initData: app?.initData ? `${app.initData.length} chars` : 'empty',
          },
          boot: window.__tgBoot,
          hints: {
            isTelegramUA,
            isTgParam,
            isTgRef,
            forceTg,
          },
          env: {
            ua: navigator.userAgent,
            referrer: document.referrer,
            url: window.location.href,
          },
        };

        console.log('[useTelegram] Debug info:', window.__tgDebug);
        
      } catch (error) {
        console.error('[useTelegram] Initialization error:', error);
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [isTelegramUA, isTgParam, isTgRef, forceTg]);

  const user = webApp?.initDataUnsafe?.user || (mock ? MOCK_USER : null);

  // ✅ Определение isTelegram - максимально толерантно для iOS
  const isTelegram =
    !!webApp ||
    forceTg ||
    isTelegramUA ||
    isTgParam ||
    isTgRef ||
    window.__tgBoot?.ready === true;

  const showMainButton = (text: string, onClick: () => void) => {
    if (!webApp) return;
    webApp.MainButton.setText(text);
    webApp.MainButton.onClick(onClick);
    webApp.MainButton.show();
  };

  const hideMainButton = () => webApp?.MainButton.hide();

  const showBackButton = (onClick: () => void) => {
    if (!webApp) return;
    webApp.BackButton.onClick(onClick);
    webApp.BackButton.show();
  };

  const hideBackButton = () => webApp?.BackButton.hide();

  const showAlert = (message: string): Promise<void> =>
    new Promise((resolve) => {
      if (webApp) {
        webApp.showAlert(message, () => resolve());
      } else {
        alert(message);
        resolve();
      }
    });

  const showConfirm = (message: string): Promise<boolean> =>
    new Promise((resolve) => {
      if (webApp) {
        webApp.showConfirm(message, (confirmed) => resolve(confirmed));
      } else {
        resolve(confirm(message));
      }
    });

  const hapticFeedback = {
    impact: (style: 'light' | 'medium' | 'heavy') =>
      webApp?.HapticFeedback.impactOccurred(style),
    notification: (type: 'error' | 'success' | 'warning') =>
      webApp?.HapticFeedback.notificationOccurred(type),
    selection: () => webApp?.HapticFeedback.selectionChanged(),
  };

  const expand = () => webApp?.expand();
  const close = () => webApp?.close();

  return {
    webApp,
    user,
    isReady,
    isTelegram,
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