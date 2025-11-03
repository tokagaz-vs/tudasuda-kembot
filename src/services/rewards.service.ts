import { supabase } from './supabase';
import type { User, Achievement, QuestDifficulty } from '@/types';

interface LevelConfig {
  level: number;
  requiredXP: number;
  title: string;
  rewards: {
    coins: number;
    maxEnergy: number;
  };
}

interface QuestReward {
  experience: number;
  coins: number;
  energy_cost: number;
}

class RewardsService {
  // ✅ Конфигурация уровней с наградами
  private readonly LEVELS: LevelConfig[] = [
    { level: 1, requiredXP: 0, title: 'Новичок', rewards: { coins: 0, maxEnergy: 100 } },
    { level: 2, requiredXP: 100, title: 'Путешественник', rewards: { coins: 50, maxEnergy: 110 } },
    { level: 3, requiredXP: 300, title: 'Исследователь', rewards: { coins: 100, maxEnergy: 120 } },
    { level: 4, requiredXP: 600, title: 'Следопыт', rewards: { coins: 150, maxEnergy: 130 } },
    { level: 5, requiredXP: 1000, title: 'Искатель', rewards: { coins: 200, maxEnergy: 150 } },
    { level: 6, requiredXP: 1500, title: 'Мастер', rewards: { coins: 300, maxEnergy: 170 } },
    { level: 7, requiredXP: 2200, title: 'Эксперт', rewards: { coins: 400, maxEnergy: 200 } },
    { level: 8, requiredXP: 3200, title: 'Гуру', rewards: { coins: 500, maxEnergy: 250 } },
    { level: 9, requiredXP: 4500, title: 'Легенда', rewards: { coins: 750, maxEnergy: 300 } },
    { level: 10, requiredXP: 6500, title: 'Титан', rewards: { coins: 1000, maxEnergy: 400 } },
    { level: 11, requiredXP: 9000, title: 'Божество', rewards: { coins: 1500, maxEnergy: 500 } },
  ];

  // ✅ Награды за квесты в зависимости от сложности
  private readonly QUEST_REWARDS: Record<QuestDifficulty, QuestReward> = {
    easy: {
      experience: 50,      // XP за легкий квест
      coins: 30,           // Монет за легкий квест
      energy_cost: 30,     // Стоимость в энергии
    },
    medium: {
      experience: 100,
      coins: 60,
      energy_cost: 50,
    },
    hard: {
      experience: 200,
      coins: 120,
      energy_cost: 80,
    },
  };

  // ✅ Скорость восстановления энергии (1 энергия каждые X минут)
  private readonly ENERGY_REGEN_RATE = 10; // минут на 1 энергию

  /**
   * Получить награду за квест по сложности
   */
  getQuestReward(difficulty: QuestDifficulty): QuestReward {
    return this.QUEST_REWARDS[difficulty];
  }

  /**
   * Проверить, хватает ли энергии для квеста
   */
  async canStartQuest(userId: string, difficulty: QuestDifficulty): Promise<{
    canStart: boolean;
    currentEnergy: number;
    requiredEnergy: number;
    message?: string;
  }> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('energy, max_energy')
        .eq('id', userId)
        .single();

      if (!user) {
        return {
          canStart: false,
          currentEnergy: 0,
          requiredEnergy: 0,
          message: 'Пользователь не найден',
        };
      }

      const requiredEnergy = this.QUEST_REWARDS[difficulty].energy_cost;
      const canStart = user.energy >= requiredEnergy;

      return {
        canStart,
        currentEnergy: user.energy,
        requiredEnergy,
        message: canStart ? undefined : `Недостаточно энергии. Нужно: ${requiredEnergy}, есть: ${user.energy}`,
      };
    } catch (error) {
      console.error('Check energy error:', error);
      return {
        canStart: false,
        currentEnergy: 0,
        requiredEnergy: 0,
        message: 'Ошибка проверки энергии',
      };
    }
  }

  /**
   * Списать энергию при старте квеста
   */
  async consumeEnergy(userId: string, difficulty: QuestDifficulty): Promise<{
    success: boolean;
    newEnergy: number;
    error?: string;
  }> {
    try {
      const energyCost = this.QUEST_REWARDS[difficulty].energy_cost;

      const { data: user } = await supabase
        .from('users')
        .select('energy')
        .eq('id', userId)
        .single();

      if (!user) {
        return { success: false, newEnergy: 0, error: 'Пользователь не найден' };
      }

      if (user.energy < energyCost) {
        return { success: false, newEnergy: user.energy, error: 'Недостаточно энергии' };
      }

      const newEnergy = user.energy - energyCost;

      const { error } = await supabase
        .from('users')
        .update({
          energy: newEnergy,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      console.log(`⚡ Энергия списана: -${energyCost}. Осталось: ${newEnergy}`);
      return { success: true, newEnergy };
    } catch (error: any) {
      console.error('Consume energy error:', error);
      return { success: false, newEnergy: 0, error: error.message };
    }
  }

  /**
   * Начисление наград за завершение квеста
   */
  async awardQuestCompletion(
    userId: string,
    questId: string,
    difficulty: QuestDifficulty,
    pointsEarned: number = 0
  ) {
    try {
      console.log('🎁 Начисление наград за квест:', { userId, questId, difficulty, pointsEarned });

      // Получаем текущего пользователя
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) throw new Error('User not found');

      // Получаем награды за сложность
      const reward = this.getQuestReward(difficulty);

      const newExperience = user.experience + reward.experience;
      const newCoins = user.coins + reward.coins;
      const newPoints = user.points + pointsEarned; // Points для рейтинга
      const newQuestsCompleted = user.quests_completed + 1;

      // Проверяем повышение уровня
      const levelUpResult = this.checkLevelUp(user.level, newExperience);
      const newLevel = levelUpResult ? levelUpResult.newLevel : user.level;

      // Формируем данные для обновления
      const updateData: any = {
        experience: newExperience,
        coins: newCoins,
        points: newPoints,
        level: newLevel,
        quests_completed: newQuestsCompleted,
        updated_at: new Date().toISOString(),
      };

      // Если повысился уровень, добавляем награды
      let levelUpCoins = 0;
      if (levelUpResult) {
        const levelConfig = this.LEVELS.find(l => l.level === newLevel);
        if (levelConfig) {
          levelUpCoins = levelConfig.rewards.coins;
          updateData.coins = newCoins + levelUpCoins;
          updateData.max_energy = levelConfig.rewards.maxEnergy;
          updateData.energy = levelConfig.rewards.maxEnergy; // Полностью восстанавливаем при lvl up
          
          console.log('🎉 ПОВЫШЕНИЕ УРОВНЯ!', {
            newLevel,
            title: levelConfig.title,
            bonusCoins: levelUpCoins,
            newMaxEnergy: levelConfig.rewards.maxEnergy,
          });
        }
      }

      // Обновляем пользователя
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Записываем транзакцию
      await supabase.from('transactions').insert({
        user_id: userId,
        transaction_type: 'quest_reward',
        points_change: pointsEarned,
        coins_change: reward.coins + levelUpCoins,
        description: `Квест завершен (${difficulty})`,
        metadata: {
          quest_id: questId,
          difficulty,
          experience_gained: reward.experience,
          coins_gained: reward.coins,
          points_gained: pointsEarned,
          level_up: !!levelUpResult,
          new_level: newLevel,
          level_up_bonus_coins: levelUpCoins,
        },
        created_at: new Date().toISOString(),
      });

      // Проверяем достижения
      await this.checkAchievements(userId, updatedUser);

      console.log('✅ Награды начислены:', {
        experience: `+${reward.experience}`,
        coins: `+${reward.coins + levelUpCoins}`,
        points: `+${pointsEarned}`,
        newLevel,
      });

      return {
        data: {
          user: updatedUser,
          rewards: {
            experience: reward.experience,
            coins: reward.coins,
            levelUpCoins,
            totalCoins: reward.coins + levelUpCoins,
            points: pointsEarned,
          },
          levelUp: levelUpResult,
        },
        error: null,
      };
    } catch (error: any) {
      console.error('Award quest completion error:', error);
      return { data: null, error };
    }
  }

  /**
   * Проверка повышения уровня
   */
  private checkLevelUp(currentLevel: number, newExperience: number) {
    // Ищем все уровни, которых достиг пользователь
    let highestLevel = currentLevel;
    
    for (const levelConfig of this.LEVELS) {
      if (levelConfig.level > currentLevel && newExperience >= levelConfig.requiredXP) {
        highestLevel = levelConfig.level;
      }
    }

    if (highestLevel > currentLevel) {
      const levelConfig = this.LEVELS.find(l => l.level === highestLevel);
      return {
        newLevel: highestLevel,
        levelConfig: levelConfig!,
        rewards: levelConfig!.rewards,
      };
    }

    return null;
  }

  /**
   * Получить информацию об уровне
   */
  getLevelInfo(level: number) {
    return this.LEVELS.find((l) => l.level === level) || this.LEVELS[0];
  }

  /**
   * Получить прогресс до следующего уровня
   */
  getLevelProgress(experience: number, currentLevel: number) {
    const currentLevelConfig = this.getLevelInfo(currentLevel);
    const nextLevelConfig = this.getLevelInfo(currentLevel + 1);

    if (!nextLevelConfig || currentLevel >= this.LEVELS[this.LEVELS.length - 1].level) {
      return {
        current: experience,
        required: currentLevelConfig.requiredXP,
        percentage: 100,
        isMaxLevel: true,
        nextLevelXP: 0,
      };
    }

    const progressInLevel = experience - currentLevelConfig.requiredXP;
    const requiredForNext = nextLevelConfig.requiredXP - currentLevelConfig.requiredXP;
    const percentage = Math.min(100, Math.max(0, (progressInLevel / requiredForNext) * 100));

    return {
      current: progressInLevel,
      required: requiredForNext,
      percentage,
      isMaxLevel: false,
      nextLevelXP: nextLevelConfig.requiredXP,
    };
  }

  /**
   * Восстановление энергии
   */
  async regenerateEnergy(userId: string): Promise<{
    success: boolean;
    newEnergy: number;
    regenerated: number;
  }> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('energy, max_energy, updated_at')
        .eq('id', userId)
        .single();

      if (!user) {
        return { success: false, newEnergy: 0, regenerated: 0 };
      }

      // Если энергия уже полная, не регенерируем
      if (user.energy >= user.max_energy) {
        return { success: true, newEnergy: user.max_energy, regenerated: 0 };
      }

      // Вычисляем сколько времени прошло
      const lastUpdate = new Date(user.updated_at);
      const now = new Date();
      const minutesPassed = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60));

      // Вычисляем сколько энергии восстановилось
      const energyToRegen = Math.floor(minutesPassed / this.ENERGY_REGEN_RATE);

      if (energyToRegen > 0) {
        const newEnergy = Math.min(user.max_energy, user.energy + energyToRegen);

        await supabase
          .from('users')
          .update({
            energy: newEnergy,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        console.log(`⚡ Энергия восстановлена: +${energyToRegen}. Теперь: ${newEnergy}/${user.max_energy}`);
        return { success: true, newEnergy, regenerated: energyToRegen };
      }

      return { success: true, newEnergy: user.energy, regenerated: 0 };
    } catch (error) {
      console.error('Regenerate energy error:', error);
      return { success: false, newEnergy: 0, regenerated: 0 };
    }
  }

  /**
   * Купить энергию (из магазина)
   */
  async purchaseEnergy(userId: string, amount: number, cost: number): Promise<boolean> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('energy, max_energy, coins')
        .eq('id', userId)
        .single();

      if (!user) return false;
      if (user.coins < cost) return false;

      const newEnergy = Math.min(user.max_energy, user.energy + amount);
      const newCoins = user.coins - cost;

      await supabase
        .from('users')
        .update({
          energy: newEnergy,
          coins: newCoins,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      // Транзакция покупки
      await supabase.from('transactions').insert({
        user_id: userId,
        transaction_type: 'shop_purchase',
        coins_change: -cost,
        description: `Куплено энергии: ${amount}`,
        metadata: { energy_amount: amount },
        created_at: new Date().toISOString(),
      });

      console.log(`💰 Куплено энергии: +${amount} за ${cost} монет`);
      return true;
    } catch (error) {
      console.error('Purchase energy error:', error);
      return false;
    }
  }

  /**
   * Проверка достижений
   */
  private async checkAchievements(userId: string, user: User) {
    try {
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*');

      if (!achievements) return;

      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);

      const completedIds = new Set(
        userAchievements?.filter(ua => ua.is_completed).map(ua => ua.achievement_id) || []
      );

      for (const achievement of achievements) {
        if (completedIds.has(achievement.id)) continue;

        const progress = this.calculateAchievementProgress(achievement, user);
        const isCompleted = progress >= 100;

        const existingProgress = userAchievements?.find(
          ua => ua.achievement_id === achievement.id
        );

        if (existingProgress) {
          if (isCompleted && !existingProgress.is_completed) {
            await supabase
              .from('user_achievements')
              .update({
                progress,
                is_completed: true,
                completed_at: new Date().toISOString(),
              })
              .eq('id', existingProgress.id);

            await this.awardAchievementReward(userId, achievement);
          } else if (existingProgress.progress < progress) {
            await supabase
              .from('user_achievements')
              .update({ progress })
              .eq('id', existingProgress.id);
          }
        } else {
          await supabase.from('user_achievements').insert({
            user_id: userId,
            achievement_id: achievement.id,
            progress,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
            created_at: new Date().toISOString(),
          });

          if (isCompleted) {
            await this.awardAchievementReward(userId, achievement);
          }
        }
      }
    } catch (error) {
      console.error('Check achievements error:', error);
    }
  }

  /**
   * Расчет прогресса достижения
   */
  private calculateAchievementProgress(achievement: Achievement, user: User): number {
    const condition = achievement.condition_value;

    switch (achievement.condition_type) {
      case 'quests_completed':
        return Math.min(100, (user.quests_completed / (condition.value as number)) * 100);
      case 'total_points':
        return Math.min(100, (user.points / (condition.value as number)) * 100);
      case 'level_reached':
        return user.level >= (condition.value as number) ? 100 : 0;
      case 'distance_traveled':
        return Math.min(100, (user.total_distance / (condition.value as number)) * 100);
      default:
        return 0;
    }
  }

  /**
   * Начисление награды за достижение
   */
  private async awardAchievementReward(userId: string, achievement: Achievement) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('points, coins')
        .eq('id', userId)
        .single();

      if (!user) return;

      await supabase
        .from('users')
        .update({
          points: user.points + achievement.reward_points,
          coins: user.coins + achievement.reward_coins,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      await supabase.from('transactions').insert({
        user_id: userId,
        transaction_type: 'achievement',
        points_change: achievement.reward_points,
        coins_change: achievement.reward_coins,
        description: `Достижение: ${achievement.name}`,
        metadata: { achievement_id: achievement.id },
        created_at: new Date().toISOString(),
      });

      console.log(`🏆 Достижение получено: ${achievement.name}`);
    } catch (error) {
      console.error('Award achievement reward error:', error);
    }
  }

  /**
   * Получить достижения пользователя
   */
  async getUserAchievements(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get user achievements error:', error);
      return { data: null, error };
    }
  }

  /**
   * Получить все достижения с прогрессом пользователя
   */
  async getAllAchievementsWithProgress(userId: string) {
    try {
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true });

      if (achievementsError) throw achievementsError;

      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);

      const achievementsWithProgress = achievements?.map((achievement) => {
        const userProgress = userAchievements?.find(
          (ua) => ua.achievement_id === achievement.id
        );

        return {
          ...achievement,
          userProgress: userProgress?.progress || 0,
          isCompleted: userProgress?.is_completed || false,
          completedAt: userProgress?.completed_at,
        };
      });

      return { data: achievementsWithProgress, error: null };
    } catch (error: any) {
      console.error('Get all achievements with progress error:', error);
      return { data: null, error };
    }
  }
}

export const rewardsService = new RewardsService();