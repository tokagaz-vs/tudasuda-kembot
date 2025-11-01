import { supabase } from './supabase';
import { QuestFilters } from '@/types';

class QuestService {
  /**
   * Получить квесты с фильтрами
   */
  async getQuests(filters?: QuestFilters) {
    try {
      let query = supabase
        .from('quests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get quests error:', error);
      return { data: null, error };
    }
  }

  /**
   * Получить квест по ID с точками
   */
  async getQuestById(questId: string) {
    try {
      const { data: quest, error: questError } = await supabase
        .from('quests')
        .select('*')
        .eq('id', questId)
        .single();

      if (questError) throw questError;

      // Загружаем точки маршрута
      const { data: points, error: pointsError } = await supabase
        .from('quest_points')
        .select('*')
        .eq('quest_id', questId)
        .order('order_number', { ascending: true });

      if (pointsError) throw pointsError;

      const totalPoints = points?.reduce((sum, p) => sum + (p.points || 0), 0) || 0;

      return {
        data: {
          ...quest,
          points: points || [],
          totalPoints,
          pointsCount: points?.length || 0,
        },
        error: null,
      };
    } catch (error: any) {
      console.error('Get quest by ID error:', error);
      return { data: null, error };
    }
  }

  /**
   * Получить популярные квесты
   */
  async getPopularQuests(limit: number = 5) {
    try {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get popular quests error:', error);
      return { data: null, error };
    }
  }

  /**
   * Получить категории
   */
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('quest_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get categories error:', error);
      return { data: null, error };
    }
  }

  /**
   * Начать квест
   */
  async startQuest(userId: string, questId: string) {
    try {
      // Проверяем, не начат ли уже
      const { data: existing } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_id', userId)
        .eq('quest_id', questId)
        .eq('status', 'in_progress')
        .maybeSingle();

      if (existing) {
        return { data: existing, error: null };
      }

      // Создаем новый прогресс
      const { data, error } = await supabase
        .from('user_quests')
        .insert({
          user_id: userId,
          quest_id: questId,
          current_task_index: 0,
          status: 'in_progress',
          score: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Start quest error:', error);
      return { data: null, error };
    }
  }

  /**
   * Получить прогресс пользователя
   */
  async getUserProgress(userId: string, questId: string) {
    try {
      const { data, error } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_id', userId)
        .eq('quest_id', questId)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Преобразуем в формат UserProgress
      if (data) {
        return {
          data: {
            id: data.id,
            user_id: data.user_id,
            quest_id: data.quest_id,
            current_point: data.current_task_index || 0,
            status: data.status,
            started_at: data.started_at,
            completed_at: data.completed_at,
            total_points: data.score || 0,
          },
          error: null,
        };
      }

      return { data: null, error: null };
    } catch (error: any) {
      console.error('Get user progress error:', error);
      return { data: null, error };
    }
  }

  /**
   * Отправить ответ
   */
  async submitAnswer(
  userId: string,
  questPointId: string,
  progressId: string,
  answer: any,
  photoUrl?: string
) {
  try {
    // Получаем точку для проверки ответа
    const { data: point } = await supabase
      .from('quest_points')
      .select('*')
      .eq('id', questPointId)
      .single();

    if (!point) throw new Error('Quest point not found');

    // Проверяем ответ
    const isCorrect = this.checkAnswer(point, answer);
    const pointsEarned = isCorrect ? point.points : 0;

    // Логируем для дебага
    console.log('Answer submitted:', { userId, progressId, photoUrl, isCorrect });

    return {
      data: {
        isCorrect,
        pointsEarned,
      },
      error: null,
    };
  } catch (error: any) {
    console.error('Submit answer error:', error);
    return { data: null, error };
  }
}

  /**
   * Обновить прогресс
   */
  async updateProgress(
    progressId: string,
    currentPoint: number,
    totalPoints: number,
    status?: 'in_progress' | 'completed' | 'abandoned'
  ) {
    try {
      const updateData: any = {
        current_task_index: currentPoint,
        score: totalPoints,
      };

      if (status) {
        updateData.status = status;
        if (status === 'completed') {
          updateData.completed_at = new Date().toISOString();
        }
      }

      const { data, error } = await supabase
        .from('user_quests')
        .update(updateData)
        .eq('id', progressId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Update progress error:', error);
      return { data: null, error };
    }
  }

  /**
   * Проверка ответа
   */
  private checkAnswer(point: any, userAnswer: any): boolean {
    if (!point.correct_answer) return true;

    switch (point.task_type) {
      case 'multiple_choice':
        return userAnswer === point.correct_answer;
      case 'text_input':
        return userAnswer.toLowerCase().trim() === point.correct_answer.toLowerCase().trim();
      case 'photo':
      case 'selfie':
        return true;
      default:
        return false;
    }
  }
}

export const questService = new QuestService();