import { supabase } from './supabase';
import { Quest, UserQuest, QuestStatus } from '@/types';

class QuestService {
  /**
   * Получить все активные квесты
   */
  async getActiveQuests(limit: number = 20, offset: number = 0): Promise<Quest[]> {
    try {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return (data as Quest[]) || [];
    } catch (error) {
      console.error('Error getting active quests:', error);
      return [];
    }
  }

  /**
   * Получить избранные квесты
   */
  async getFeaturedQuests(): Promise<Quest[]> {
    try {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return (data as Quest[]) || [];
    } catch (error) {
      console.error('Error getting featured quests:', error);
      return [];
    }
  }

  /**
   * Получить квесты рядом с пользователем
   */
  async getNearbyQuests(
    latitude: number,
    longitude: number,
    radiusMeters: number = 5000
  ): Promise<Quest[]> {
    try {
      const { data, error } = await supabase.rpc('get_nearby_quests', {
        lat: latitude,
        lng: longitude,
        radius: radiusMeters,
      });

      if (error) throw error;
      return (data as Quest[]) || [];
    } catch (error) {
      console.error('Error getting nearby quests:', error);
      return [];
    }
  }

  /**
   * Получить квест по ID
   */
  async getQuestById(questId: string): Promise<Quest | null> {
    try {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('id', questId)
        .single();

      if (error) throw error;
      return data as Quest;
    } catch (error) {
      console.error('Error getting quest by ID:', error);
      return null;
    }
  }

  /**
   * Начать квест
   */
  async startQuest(userId: string, questId: string): Promise<UserQuest | null> {
    try {
      const { data, error } = await supabase
        .from('user_quests')
        .insert({
          user_id: userId,
          quest_id: questId,
          status: 'in_progress' as QuestStatus,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as UserQuest;
    } catch (error) {
      console.error('Error starting quest:', error);
      return null;
    }
  }

  /**
   * Обновить прогресс квеста
   */
  async updateQuestProgress(
    userQuestId: string,
    updates: Partial<UserQuest>
  ): Promise<UserQuest | null> {
    try {
      const { data, error } = await supabase
        .from('user_quests')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userQuestId)
        .select()
        .single();

      if (error) throw error;
      return data as UserQuest;
    } catch (error) {
      console.error('Error updating quest progress:', error);
      return null;
    }
  }

  /**
   * Завершить квест
   */
  async completeQuest(
    userQuestId: string,
    score: number,
    rating?: number
  ): Promise<UserQuest | null> {
    try {
      const { data, error } = await supabase
        .from('user_quests')
        .update({
          status: 'completed' as QuestStatus,
          score,
          rating,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userQuestId)
        .select()
        .single();

      if (error) throw error;
      return data as UserQuest;
    } catch (error) {
      console.error('Error completing quest:', error);
      return null;
    }
  }

  /**
   * Получить квесты пользователя
   */
  async getUserQuests(userId: string, status?: QuestStatus): Promise<UserQuest[]> {
    try {
      let query = supabase
        .from('user_quests')
        .select('*, quest:quests(*)')
        .eq('user_id', userId);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) throw error;
      return (data as UserQuest[]) || [];
    } catch (error) {
      console.error('Error getting user quests:', error);
      return [];
    }
  }
}

export const questService = new QuestService();