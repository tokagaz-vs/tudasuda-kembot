import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, DEFAULT_LANGUAGE } from '@/i18n';

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'tudasuda-language',
    }
  )
);