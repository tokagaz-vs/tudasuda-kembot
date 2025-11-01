import { supabase } from './supabase';
import { LeaderboardEntry } from '@/types';

class LeaderboardService {
  /**
   * Получить топ 100 игроков
   */
  async getTopPlayers(limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(limit);

      if (error) throw error;
      return (data as LeaderboardEntry[]) || [];
    } catch (error) {
      console.error('Error getting top players:', error);
      return [];
    }
  }

  /**
   * Получить позицию пользователя в рейтинге
   */
  async getUserRank(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('rank')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.rank || 0;
    } catch (error) {
      console.error('Error getting user rank:', error);
      return 0;
    }
  }
}

export const leaderboardService = new LeaderboardService();