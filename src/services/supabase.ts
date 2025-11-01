import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

// Создание клиента Supabase
export const supabase = createClient(env.supabase.url, env.supabase.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'tudasuda-tg-app',
    },
  },
});

// Типы для Database
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          telegram_id: number;
          username: string | null;
          first_name: string;
          last_name: string | null;
          photo_url: string | null;
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
          role: string;
          is_banned: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          last_login_at: string;
        };
        Insert: Partial<Database['public']['Tables']['users']['Row']>;
        Update: Partial<Database['public']['Tables']['users']['Row']>;
      };
    };
  };
};