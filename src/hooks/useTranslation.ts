import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/i18n';

export const useTranslation = () => {
  const { language, setLanguage } = useLanguageStore();

  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = (path || '').split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = translations[language];

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        if (import.meta.env.DEV) {
          console.warn(`Translation key not found: ${path}`);
        }
        return String(path);
      }
    }

    if (typeof value !== 'string') {
      if (import.meta.env.DEV) {
        console.warn(`Translation value is not a string: ${path}`);
      }
      return String(path);
    }

    // Замена параметров в строке (например: "Hello {{name}}")
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (_: string, key: string) => {
        return params[key]?.toString() || '';
      });
    }

    return value;
  };

  return {
    t,
    language,
    setLanguage,
  };
};