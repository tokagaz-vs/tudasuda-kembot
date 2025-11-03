import { useEffect, useMemo, useState } from 'react';
import { TelegramWebApp, TelegramUser } from '@/types';

interface UseTelegramReturn {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  isReady: boolean;
  isTelegram: boolean;
  isDebugMode: boolean;
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
  openTelegramLink: (url: string) => void;
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
        console.warn('⚠️ Telegram SDK timeout after', maxAttempts, 'attempts');
        resolve(false);
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
  
  // Debug режимы
  const isDebugMode = useMemo(() => {
    return (
      params.get('debug') === '1' ||
      params.get('mock') === '1' ||
      params.get('tma') === '1' ||
      (import.meta.env.DEV && params.get('debug') !== '0')
    );
  }, [params]);

  // Эвристики для определения Telegram окружения
  const isTelegramUA = useMemo(() => /Telegram/i.test(navigator.userAgent), []);
  
  const isTgParam = useMemo(() => {
    const search = window.location.search;
    const hash = window.location.hash;
    return (
      search.includes('tgWebAppData') || 
      search.includes('tgWebAppVersion') ||
      search.includes('tgWebAppPlatform') ||
      hash.includes('tgWebApp') || 
      hash.includes('tgWebAppData')
    );
  }, []);
  
  const isTgRef = useMemo(() => {
    const ref = document.referrer || '';
    return ref.includes('t.me') || ref.includes('telegram.org') || ref.includes('telegram.me');
  }, []);

  // Проверка iframe (Telegram часто открывает в iframe)
  const isInIframe = useMemo(() => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      console.log('[useTelegram] Starting initialization...', {
        isDebugMode,
        isTelegramUA,
        isTgParam,
        isTgRef,
        isInIframe,
        referrer: document.referrer,
        search: window.location.search,
        hash: window.location.hash,
      });

      try {
        // Ждем Telegram SDK
        const sdkReady = await waitForTelegram();
        
        if (cancelled) return;

        const app = window.Telegram?.WebApp || null;

        if (app) {
          try {
            // Инициализация WebApp
            app.ready();
            app.expand();
            
            // Устанавливаем тему
            try {
              app.headerColor = '#0F1115';
              app.backgroundColor = '#0F1115';
            } catch (e) {
              console.warn('Could not set colors:', e);
            }
            
            // Применяем класс темы
            if (app.colorScheme === 'dark') {
              document.body.classList.add('dark');
            } else {
              document.body.classList.remove('dark');
            }
            
            setWebApp(app);
            
            console.log('[useTelegram] ✅ WebApp initialized successfully', {
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
          console.warn('[useTelegram] ⚠️ WebApp not available');
        }

        // Debug информация
        window.__tgDebug = {
          sdk: {
            ready: sdkReady,
            hasWebApp: !!app,
            hasUser: !!app?.initDataUnsafe?.user,
            platform: app?.platform,
            version: app?.version,
            initData: app?.initData ? `${app.initData.length} chars` : 'empty',
          },
          hints: {
            isTelegramUA,
            isTgParam,
            isTgRef,
            isInIframe,
            isDebugMode,
          },
          env: {
            ua: navigator.userAgent,
            referrer: document.referrer,
            url: window.location.href,
          },
        };

        console.log('[useTelegram] Debug info available in window.__tgDebug');
        
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
  }, [isTelegramUA, isTgParam, isTgRef, isInIframe, isDebugMode]);

  // Получаем пользователя
  const user = useMemo(() => {
    if (webApp?.initDataUnsafe?.user) {
      return webApp.initDataUnsafe.user;
    }
    if (isDebugMode) {
      return MOCK_USER;
    }
    return null;
  }, [webApp, isDebugMode]);

  // Определение isTelegram - проверяем все признаки
  const isTelegram = useMemo(() => {
    // Если debug режим - считаем что мы в Telegram
    if (isDebugMode) {
      return true;
    }
    
    // Если есть WebApp - точно в Telegram
    if (webApp) {
      return true;
    }
    
    // Проверяем косвенные признаки
    const hints = isTelegramUA || isTgParam || isTgRef || isInIframe;
    
    // Если приложение еще не готово, но есть признаки - считаем что в Telegram
    if (!isReady && hints) {
      return true;
    }
    
    // Если готово, но нет WebApp и нет признаков - не в Telegram
    return false;
  }, [webApp, isDebugMode, isTelegramUA, isTgParam, isTgRef, isInIframe, isReady]);

  // API методы
  const showMainButton = (text: string, onClick: () => void) => {
    if (!webApp) return;
    webApp.MainButton.setText(text);
    webApp.MainButton.onClick(onClick);
    webApp.MainButton.show();
  };

  const openTelegramLink = (url: string) => {
    if (webApp) {
      webApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
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
      webApp?.HapticFeedback?.impactOccurred?.(style),
    notification: (type: 'error' | 'success' | 'warning') =>
      webApp?.HapticFeedback?.notificationOccurred?.(type),
    selection: () => webApp?.HapticFeedback?.selectionChanged?.(),
  };

  const expand = () => webApp?.expand();
  const close = () => webApp?.close();

  return {
    webApp,
    user,
    isReady,
    isTelegram,
    isDebugMode,
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
    openTelegramLink,
  };
};