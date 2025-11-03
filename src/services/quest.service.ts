import { supabase } from './supabase';
import { rewardsService } from './rewards.service';
import type { 
  QuestWithDetails,
  QuestPoint,
  UserProgress,
  QuestFilters,
  QuestTaskType,
  QuestDifficulty
} from '@/types';

class QuestService {
  /**
   * Получить категории квестов
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
   * Получить квесты с фильтрами
   */
  async getQuests(filters?: QuestFilters) {
    try {
      let query = supabase
        .from('quests')
        .select(`
          *,
          category:quest_categories(*)
        `)
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

      if (filters?.status !== undefined) {
        query = query.eq('status', filters.status);
      }

      if (filters?.is_active !== false) {
        query = query.eq('is_active', true);
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
  async getQuestById(questId: string): Promise<{ data: QuestWithDetails | null; error: any }> {
    try {
      const { data: quest, error: questError } = await supabase
        .from('quests')
        .select(`
          *,
          category:quest_categories(*)
        `)
        .eq('id', questId)
        .single();

      if (questError) throw questError;

      const { data: points, error: pointsError } = await supabase
        .from('quest_points')
        .select('*')
        .eq('quest_id', questId)
        .order('order_index', { ascending: true });

      if (pointsError && pointsError.code !== 'PGRST116') {
        const { data: pointsAlt, error: pointsAltError } = await supabase
          .from('quest_points')
          .select('*')
          .eq('quest_id', questId)
          .order('order_number', { ascending: true });

        if (pointsAltError) throw pointsAltError;
        
        const questWithDetails: QuestWithDetails = {
          ...quest,
          points: pointsAlt || [],
          pointsCount: pointsAlt?.length || 0,
          totalPoints: pointsAlt?.reduce((sum, p) => sum + (p.points || 0), 0) || 0
        };

        return { data: questWithDetails, error: null };
      }

      const questWithDetails: QuestWithDetails = {
        ...quest,
        points: points || [],
        pointsCount: points?.length || 0,
        totalPoints: points?.reduce((sum, p) => sum + (p.points || 0), 0) || 0
      };

      return { data: questWithDetails, error: null };
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
        .select(`
          *,
          category:quest_categories(*)
        `)
        .eq('is_active', true)
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
   * Получить прогресс пользователя по квесту
   */
  async getUserProgress(userId: string, questId: string): Promise<{ data: UserProgress | null; error: any }> {
    try {
      let { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('quest_id', questId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!data && !error) {
        const { data: questData, error: questError } = await supabase
          .from('user_quests')
          .select('*')
          .eq('user_id', userId)
          .eq('quest_id', questId)
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (questError && questError.code !== 'PGRST116') throw questError;

        if (questData) {
          const progress: UserProgress = {
            id: questData.id,
            user_id: questData.user_id,
            quest_id: questData.quest_id,
            status: questData.status || 'in_progress',
            current_point: questData.current_task_index || 0,
            total_points: questData.score || 0,
            started_at: questData.started_at,
            completed_at: questData.completed_at,
            created_at: questData.created_at,
            updated_at: questData.updated_at
          };
          return { data: progress, error: null };
        }
      }

      return { data: data as UserProgress, error };
    } catch (error: any) {
      console.error('Get user progress error:', error);
      return { data: null, error };
    }
  }

  /**
   * ✅ ОБНОВЛЕНО: Начать квест с проверкой энергии
   */
  async startQuest(userId: string, questId: string) {
    try {
      console.log('🎮 Попытка начать квест:', { userId, questId });

      // Проверяем существующий прогресс
      const { data: existing } = await this.getUserProgress(userId, questId);

      if (existing && existing.status === 'in_progress') {
        console.log('▶️ Квест уже начат, продолжаем');
        return { data: existing, error: null };
      }

      // Получаем информацию о квесте для проверки сложности
      const { data: quest } = await this.getQuestById(questId);
      if (!quest) {
        return { data: null, error: 'Quest not found' };
      }

      const difficulty: QuestDifficulty = quest.difficulty || 'easy';

      // ✅ Проверяем энергию
      const energyCheck = await rewardsService.canStartQuest(userId, difficulty);
      
      if (!energyCheck.canStart) {
        console.warn('⚠️ Недостаточно энергии:', energyCheck.message);
        return { 
          data: null, 
          error: energyCheck.message || 'Недостаточно энергии',
          energyRequired: energyCheck.requiredEnergy,
          energyCurrent: energyCheck.currentEnergy,
        };
      }

      // ✅ Списываем энергию
      const energyResult = await rewardsService.consumeEnergy(userId, difficulty);
      
      if (!energyResult.success) {
        console.error('❌ Ошибка списания энергии:', energyResult.error);
        return { data: null, error: energyResult.error || 'Не удалось списать энергию' };
      }

      console.log('⚡ Энергия списана, создаем прогресс квеста');

      // Создаем прогресс квеста
      const progressData = {
        user_id: userId,
        quest_id: questId,
        status: 'in_progress' as const,
        current_point: 0,
        total_points: 0,
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      let { data, error } = await supabase
        .from('user_progress')
        .insert(progressData)
        .select()
        .single();

      if (error) {
        const questData = {
          user_id: userId,
          quest_id: questId,
          status: 'in_progress',
          current_task_index: 0,
          score: 0,
          started_at: new Date().toISOString()
        };

        const { data: questResult, error: questError } = await supabase
          .from('user_quests')
          .insert(questData)
          .select()
          .single();

        if (questError) throw questError;

        const progress: UserProgress = {
          id: questResult.id,
          user_id: questResult.user_id,
          quest_id: questResult.quest_id,
          status: 'in_progress',
          current_point: 0,
          total_points: 0,
          started_at: questResult.started_at,
          created_at: questResult.created_at
        };

        return { data: progress, error: null, energySpent: energyResult.newEnergy };
      }

      console.log('✅ Квест успешно начат');
      return { data: data as UserProgress, error: null, energySpent: energyResult.newEnergy };
    } catch (error: any) {
      console.error('Start quest error:', error);
      return { data: null, error };
    }
  }

  /**
   * ✅ ОБНОВЛЕНО: Обновить прогресс с начислением наград при завершении
   */
  async updateProgress(
    progressId: string,
    currentPoint: number,
    totalPoints: number,
    status?: 'in_progress' | 'completed' | 'abandoned'
  ) {
    try {
      console.log('📊 Обновление прогресса:', { progressId, currentPoint, totalPoints, status });

      const updateData = {
        current_point: currentPoint,
        total_points: totalPoints,
        status: status || 'in_progress',
        updated_at: new Date().toISOString(),
        ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {})
      };

      let { data, error } = await supabase
        .from('user_progress')
        .update(updateData)
        .eq('id', progressId)
        .select()
        .single();

      if (error) {
        const questUpdateData = {
          current_task_index: currentPoint,
          score: totalPoints,
          status: status || 'in_progress',
          updated_at: new Date().toISOString(),
          ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {})
        };

        const { data: questData, error: questError } = await supabase
          .from('user_quests')
          .update(questUpdateData)
          .eq('id', progressId)
          .select()
          .single();

        if (questError) throw questError;
        data = questData;
      }

      // ✅ Если квест завершен, начисляем награды
      if (status === 'completed' && data) {
        console.log('🎁 Квест завершен! Начисляем награды...');
        
        // Получаем информацию о квесте
        const { data: quest } = await this.getQuestById(data.quest_id);
        
        if (quest) {
          const difficulty: QuestDifficulty = quest.difficulty || 'easy';
          
          // Начисляем награды через rewards service
          const rewardResult = await rewardsService.awardQuestCompletion(
            data.user_id,
            data.quest_id,
            difficulty,
            totalPoints
          );

          if (rewardResult.data) {
            console.log('✅ Награды начислены:', rewardResult.data.rewards);
            return { 
              data, 
              error: null,
              rewards: rewardResult.data.rewards,
              levelUp: rewardResult.data.levelUp,
            };
          }
        }
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Update progress error:', error);
      return { data: null, error };
    }
  }

  /**
   * Отправить ответ на задание
   */
  async submitAnswer(
    userId: string,
    pointId: string,
    progressId: string,
    answer: any,
    photoUrl?: string
  ) {
    try {
      const { data: point } = await supabase
        .from('quest_points')
        .select('*')
        .eq('id', pointId)
        .single();

      if (!point) throw new Error('Quest point not found');

      const isCorrect = this.checkAnswer(point, answer);
      const pointsEarned = isCorrect ? (point.points || 0) : 0;

      try {
        await supabase
          .from('user_answers')
          .insert({
            user_id: userId,
            point_id: pointId,
            progress_id: progressId,
            answer: answer,
            photo_url: photoUrl,
            is_correct: isCorrect,
            points_earned: pointsEarned,
            created_at: new Date().toISOString()
          });
      } catch (e) {
        console.warn('Could not save answer to DB:', e);
      }

      return {
        data: {
          isCorrect,
          pointsEarned
        },
        error: null
      };
    } catch (error: any) {
      console.error('Submit answer error:', error);
      return { data: null, error };
    }
  }

  /**
   * Проверка ответа
   */
  private checkAnswer(point: QuestPoint, userAnswer: any): boolean {
    if (!point.correct_answer) return true;

    const taskType: QuestTaskType = point.task_type;

    switch (taskType) {
      case 'quiz':
      case 'text':
      case 'text_input':
        return userAnswer?.toLowerCase()?.trim() === 
               String(point.correct_answer)?.toLowerCase()?.trim();
      
      case 'multiple_choice':
        if (Array.isArray(userAnswer) && Array.isArray(point.correct_answer)) {
          return JSON.stringify(userAnswer.sort()) === 
                 JSON.stringify(point.correct_answer.sort());
        }
        return userAnswer === point.correct_answer;
      
      case 'photo':
      case 'selfie':
      case 'location':
        return true;
      
      default:
        return false;
    }
  }

  /**
   * ✅ НОВОЕ: Получить информацию о наградах за квест
   */
  getQuestRewardInfo(difficulty: QuestDifficulty) {
    return rewardsService.getQuestReward(difficulty);
  }
}

export const questService = new QuestService();