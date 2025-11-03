// Базовые типы
export type QuestTaskType = 
  | 'quiz'
  | 'text' 
  | 'text_input'
  | 'multiple_choice'
  | 'photo'
  | 'selfie'
  | 'location';

export type QuestDifficulty = 'easy' | 'medium' | 'hard';

export type QuestStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned';

// Категория квеста
export interface QuestCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

// Точка квеста
export interface QuestPoint {
  id: string;
  quest_id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  points: number;
  order_index?: number;
  order_number?: number;
  task_type: QuestTaskType;
  task_data?: {
    question?: string;
    description?: string;
    instruction?: string;
    options?: string[];
    hint?: string;
    [key: string]: any;
  };
  correct_answer?: string | string[];
  hint?: string;
  excursion_text?: string;
  audio_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Квест
export interface Quest {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  category?: QuestCategory;
  difficulty: QuestDifficulty;
  // ✅ УДАЛЕНО: points_reward и reward_points
  estimated_duration?: number;
  total_distance?: number;
  is_active?: boolean;
  status?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Квест с деталями
export interface QuestWithDetails extends Quest {
  points: QuestPoint[];
  pointsCount: number;
  totalPoints: number;
}

// Прогресс пользователя
export interface UserProgress {
  id: string;
  user_id: string;
  quest_id: string;
  status: QuestStatus;
  current_point: number;
  current_task_index?: number;
  total_points: number;
  score?: number;
  started_at?: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Фильтры квестов
export interface QuestFilters {
  category_id?: string;
  difficulty?: QuestDifficulty;
  search?: string;
  status?: string;
  is_active?: boolean;
}

// Ответ пользователя
export interface UserAnswer {
  id?: string;
  user_id: string;
  point_id: string;
  progress_id: string;
  answer: any;
  photo_url?: string;
  is_correct: boolean;
  points_earned: number;
  created_at?: string;
}

// ✅ НОВОЕ: Награды за квест
export interface QuestReward {
  experience: number;
  coins: number;
  levelUpCoins?: number;
  totalCoins: number;
  points: number;
}

// ✅ НОВОЕ: Результат завершения квеста
export interface QuestCompletionResult {
  rewards: QuestReward;
  levelUp?: {
    newLevel: number;
    title?: string;
    rewards?: {
      coins: number;
      maxEnergy: number;
    };
  };
}