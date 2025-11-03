export const GEOLOCATION_RADIUS = 100; // метров

export const DIFFICULTY_LEVELS = {
  easy: { 
    label: 'Легко', 
    color: '#10B981',
    points: 1,
    icon: '⭐'
  },
  medium: { 
    label: 'Средне', 
    color: '#F59E0B',
    points: 2,
    icon: '⭐⭐'
  },
  hard: { 
    label: 'Сложно', 
    color: '#EF4444',
    points: 3,
    icon: '⭐⭐⭐'
  },
} as const;

export const TASK_TYPES = {
  quiz: { label: 'Викторина', icon: '❓' },
  photo: { label: 'Фото', icon: '📷' },
  text: { label: 'Текст', icon: '✏️' },
  multi_choice: { label: 'Выбор', icon: '☑️' },
  location: { label: 'Локация', icon: '📍' },
} as const;