// =====================================================
// TELEGRAM TYPES
// =====================================================

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

interface TelegramBackButton {
  isVisible: boolean;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
}

interface TelegramMainButtonParams {
  text?: string;
  color?: string;
  text_color?: string;
  is_active?: boolean;
  is_visible?: boolean;
}

interface TelegramMainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  setText(text: string): void;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
  enable(): void;
  disable(): void;
  showProgress(leaveActive?: boolean): void;
  hideProgress(): void;
  setParams(params: TelegramMainButtonParams): void;
}

interface TelegramHapticFeedback {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
  notificationOccurred(type: 'error' | 'success' | 'warning'): void;
  selectionChanged(): void;
}

interface TelegramPopupButton {
  id?: string;
  type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
  text?: string;
}

interface TelegramPopupParams {
  title?: string;
  message: string;
  buttons?: TelegramPopupButton[];
}

interface TelegramInitDataUnsafe {
  user?: TelegramUser;
  query_id?: string;
  auth_date?: number;
  hash?: string;
  start_param?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: TelegramInitDataUnsafe;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: TelegramThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  BackButton: TelegramBackButton;
  MainButton: TelegramMainButton;
  HapticFeedback: TelegramHapticFeedback;
  ready(): void;
  expand(): void;
  close(): void;
  sendData(data: string): void;
  openLink(url: string): void;
  openTelegramLink(url: string): void;
  showPopup(params: TelegramPopupParams, callback?: (buttonId: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// =====================================================
// USER TYPES
// =====================================================

export type UserRole = 'user' | 'moderator' | 'admin';

export interface User {
  id: string;
  telegram_id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  photo_url?: string;
  language_code: string;
  is_premium: boolean;
  points: number;
  level: number;
  experience: number;
  coins: number;
  energy: number;
  max_energy: number;
  quests_completed: number;
  total_distance: number;
  total_time_played: number;
  role: UserRole;
  is_banned: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string;
}

// =====================================================
// QUEST TYPES
// =====================================================

export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type QuestCategory = 'exploration' | 'photo' | 'challenge' | 'social' | 'educational';
export type QuestStatus = 'not_started' | 'in_progress' | 'completed' | 'failed' | 'abandoned';

export type TaskType = 'photo' | 'selfie' | 'text' | 'choice' | 'location' | 'qr';

export interface BaseTask {
  type: TaskType;
  title: string;
  description?: string;
  points: number;
}

export interface PhotoTask extends BaseTask {
  type: 'photo';
  min_photos?: number;
  max_photos?: number;
}

export interface SelfieTask extends BaseTask {
  type: 'selfie';
  with_landmark?: boolean;
}

export interface TextTask extends BaseTask {
  type: 'text';
  answer?: string;
  case_sensitive?: boolean;
}

export interface ChoiceTask extends BaseTask {
  type: 'choice';
  options: string[];
  correct: number;
  multiple?: boolean;
}

export interface LocationTask extends BaseTask {
  type: 'location';
  latitude: number;
  longitude: number;
  radius: number;
}

export interface QRTask extends BaseTask {
  type: 'qr';
  qr_code: string;
}

export type Task = PhotoTask | SelfieTask | TextTask | ChoiceTask | LocationTask | QRTask;

export interface Quest {
  id: string;
  title: string;
  description: string;
  short_description: string;
  difficulty: QuestDifficulty;
  category: QuestCategory;
  reward_points: number;
  reward_coins: number;
  reward_experience: number;
  latitude?: number;
  longitude?: number;
  radius: number;
  address?: string;
  city?: string;
  required_level: number;
  required_items?: string[];
  max_participants?: number;
  tasks: Task[];
  is_active: boolean;
  is_featured: boolean;
  starts_at?: string;
  ends_at?: string;
  completion_count: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface TaskProgress {
  task_index: number;
  completed: boolean;
  data?: Record<string, unknown>;
  score?: number;
}

export interface UserQuest {
  id: string;
  user_id: string;
  quest_id: string;
  status: QuestStatus;
  progress: Record<string, unknown>;
  current_task_index: number;
  completed_tasks: TaskProgress[];
  score: number;
  rating?: number;
  completion_time?: number;
  started_at?: string;
  completed_at?: string;
  updated_at: string;
}

// =====================================================
// EVENT TYPES
// =====================================================

export type EventType = 'competition' | 'festival' | 'meetup' | 'challenge';
export type EventParticipantStatus = 'registered' | 'confirmed' | 'attended' | 'cancelled';

export interface EventPrize {
  position: number;
  description: string;
  points?: number;
  coins?: number;
  items?: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  event_type: EventType;
  latitude?: number;
  longitude?: number;
  address?: string;
  venue?: string;
  starts_at: string;
  ends_at: string;
  registration_deadline?: string;
  max_participants?: number;
  current_participants: number;
  min_level: number;
  entry_fee: number;
  prizes: EventPrize[];
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: EventParticipantStatus;
  position?: number;
  score: number;
  registered_at: string;
}

// =====================================================
// SHOP TYPES
// =====================================================

export type ShopItemCategory = 'powerup' | 'cosmetic' | 'booster' | 'special';

export interface ItemEffect {
  type: string;
  value: string | number | boolean;
  duration?: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  category: ShopItemCategory;
  price_coins: number;
  price_points: number;
  effects: Record<string, unknown>;
  duration?: number;
  is_available: boolean;
  is_limited: boolean;
  stock_quantity?: number;
  required_level: number;
  created_at: string;
  updated_at: string;
}

export interface UserInventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  is_equipped: boolean;
  expires_at?: string;
  acquired_at: string;
  item?: ShopItem;
}

// =====================================================
// TRANSACTION TYPES
// =====================================================

export type TransactionType = 'quest_reward' | 'shop_purchase' | 'event_prize' | 'admin_grant' | 'transfer';

export interface TransactionMetadata {
  quest_id?: string;
  item_id?: string;
  event_id?: string;
  reason?: string;
  [key: string]: unknown;
}

export interface Transaction {
  id: string;
  user_id: string;
  transaction_type: TransactionType;
  coins_change: number;
  points_change: number;
  description?: string;
  metadata: TransactionMetadata;
  created_at: string;
}

// =====================================================
// COMPANION TYPES
// =====================================================

export type CompanionRequestStatus = 'open' | 'matched' | 'closed' | 'expired';
export type CompanionMatchStatus = 'pending' | 'accepted' | 'rejected';

export interface CompanionRequest {
  id: string;
  user_id: string;
  quest_id: string;
  message?: string;
  max_companions: number;
  preferred_language?: string;
  latitude?: number;
  longitude?: number;
  status: CompanionRequestStatus;
  expires_at: string;
  created_at: string;
  updated_at: string;
  user?: User;
  quest?: Quest;
}

export interface CompanionMatch {
  id: string;
  request_id: string;
  user_id: string;
  status: CompanionMatchStatus;
  message?: string;
  created_at: string;
  user?: User;
}

// =====================================================
// ACHIEVEMENT TYPES
// =====================================================

export interface AchievementCondition {
  type: string;
  value: number | string;
  [key: string]: unknown;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  category: string;
  condition_type: string;
  condition_value: AchievementCondition;
  reward_points: number;
  reward_coins: number;
  is_secret: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  achievement?: Achievement;
}

// =====================================================
// LEADERBOARD TYPES
// =====================================================

export interface LeaderboardEntry {
  id: string;
  telegram_id: number;
  username?: string;
  first_name: string;
  photo_url?: string;
  points: number;
  level: number;
  quests_completed: number;
  rank: number;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// =====================================================
// LOCATION TYPES
// =====================================================

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData extends Coordinates {
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}