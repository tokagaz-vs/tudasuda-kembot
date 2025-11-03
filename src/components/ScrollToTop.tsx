import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Прокручиваем вверх при каждом изменении маршрута
    window.scrollTo(0, 0);
    
    // Дополнительная проверка для Telegram WebApp
    if (window.Telegram?.WebApp) {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [pathname]);

  return null;
};