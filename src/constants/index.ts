export const APP_CONFIG = {
  name: 'TudaSuda',
  version: '1.0.0',
  description: 'Real-world quest game',
  
  // Игровые константы
  energyRegenRate: 1, // энергия в минуту
  maxEnergyDefault: 100,
  experiencePerLevel: 100, // опыт для следующего уровня = level * 100
  
  // Лимиты
  maxQuestDistance: 50000, // метры (50 км)
  maxCompanions: 5,
  maxInventorySize: 100,
  
  // Пагинация
  defaultPageSize: 20,
  maxPageSize: 100,
  
  // Кэш
  cacheTimeout: 5 * 60 * 1000, // 5 минут
} as const;

export const DIFFICULTY_CONFIG = {
  easy: {
    color: '#22C55E',
    emoji: '🟢',
    minLevel: 1,
  },
  medium: {
    color: '#F59E0B',
    emoji: '🟡',
    minLevel: 5,
  },
  hard: {
    color: '#EF4444',
    emoji: '🔴',
    minLevel: 10,
  },
  expert: {
    color: '#8B5CF6',
    emoji: '🟣',
    minLevel: 20,
  },
} as const;

export const CATEGORY_CONFIG = {
  exploration: {
    icon: '🗺️',
    color: '#6366F1',
  },
  photo: {
    icon: '📸',
    color: '#EC4899',
  },
  challenge: {
    icon: '🏆',
    color: '#F59E0B',
  },
  social: {
    icon: '👥',
    color: '#8B5CF6',
  },
  educational: {
    icon: '📚',
    color: '#10B981',
  },
} as const;

export const ROUTES = {
  home: '/',
  profile: '/profile',
  quests: '/quests',
  questDetail: (id: string) => `/quests/${id}`,
  questPlay: (id: string) => `/quests/${id}/play`,
  map: '/map',
  leaderboard: '/leaderboard',
  events: '/events',
  eventDetail: (id: string) => `/events/${id}`,
  shop: '/shop',
  companion: '/companion',
  companionSearch: '/companion/search',
} as const;

export const STORAGE_KEYS = {
  user: 'tudasuda_user',
  token: 'tudasuda_token',
  theme: 'tudasuda-theme',
  language: 'tudasuda-language',
} as const;