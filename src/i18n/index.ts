import { ru } from './locales/ru';
import { en } from './locales/en';
import { zh } from './locales/zh';

export type Language = 'ru' | 'en' | 'zh';

// Используем более гибкую типизацию
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export interface TranslationStructure {
  common: Record<string, string>;
  navigation: Record<string, string>;
  home: Record<string, string>;
  profile: Record<string, unknown>;
  quests: Record<string, unknown>;
  map: Record<string, string>;
  leaderboard: Record<string, string>;
  events: Record<string, unknown>;
  shop: Record<string, unknown>;
  companion: Record<string, unknown>;
  errors: Record<string, string>;
  notifications: Record<string, string>;
}

export const translations: Record<Language, DeepPartial<TranslationStructure>> = {
  ru: ru as DeepPartial<TranslationStructure>,
  en: en as DeepPartial<TranslationStructure>,
  zh: zh as DeepPartial<TranslationStructure>,
};

export const LANGUAGES = [
  { code: 'ru' as Language, name: 'Русский', flag: '🇷🇺' },
  { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
  { code: 'zh' as Language, name: '中文', flag: '🇨🇳' },
];

export const DEFAULT_LANGUAGE: Language = 'ru';