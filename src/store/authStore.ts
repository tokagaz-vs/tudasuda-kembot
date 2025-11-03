import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, TelegramUser } from '@/types';
import { authService } from '@/services/auth.service';
import { rewardsService } from '@/services/rewards.service';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  login: (telegramUser: TelegramUser) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  addExperience: (amount: number) => Promise<boolean>;
  addCurrency: (coins?: number, points?: number) => Promise<boolean>;
  regenerateEnergy: () => Promise<void>; // ✅ НОВОЕ
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        }),

      login: async (telegramUser: TelegramUser) => {
        set({ isLoading: true, error: null });
        try {
          console.log('🔐 Начало авторизации для:', telegramUser.username || telegramUser.first_name);
          
          const user = await authService.authenticateWithTelegram(telegramUser);
          
          if (user) {
            console.log('✅ Пользователь авторизован:', user);
            
            // ✅ НОВОЕ: Восстанавливаем энергию при входе
            await rewardsService.regenerateEnergy(user.id);
            
            // Обновляем данные пользователя после регенерации
            const updatedUser = await authService.getCurrentUser(user.telegram_id);
            
            set({
              user: updatedUser || user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            console.error('❌ Не удалось авторизовать пользователя');
            set({ 
              isLoading: false,
              error: 'Не удалось авторизоваться. Попробуйте позже.',
            });
            return false;
          }
        } catch (error) {
          console.error('❌ Ошибка авторизации:', error);
          set({ 
            isLoading: false,
            error: error instanceof Error ? error.message : 'Произошла ошибка при авторизации',
          });
          return false;
        }
      },

      logout: () => {
        console.log('👋 Выход из системы');
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateUser: async (updates) => {
        const { user } = get();
        if (!user) {
          set({ error: 'Пользователь не авторизован' });
          return false;
        }

        set({ isLoading: true, error: null });
        try {
          console.log('📝 Обновление профиля:', updates);
          
          const updatedUser = await authService.updateProfile(user.id, updates);
          if (updatedUser) {
            console.log('✅ Профиль обновлен:', updatedUser);
            set({ 
              user: updatedUser,
              isLoading: false,
            });
            return true;
          }
          set({ 
            isLoading: false,
            error: 'Не удалось обновить профиль',
          });
          return false;
        } catch (error) {
          console.error('❌ Ошибка обновления профиля:', error);
          set({ 
            isLoading: false,
            error: error instanceof Error ? error.message : 'Ошибка обновления профиля',
          });
          return false;
        }
      },

      refreshUser: async () => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true });
        try {
          const updatedUser = await authService.getCurrentUser(user.telegram_id);
          if (updatedUser) {
            console.log('🔄 Пользователь обновлен из БД:', updatedUser);
            set({ user: updatedUser, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Refresh user error:', error);
          set({ isLoading: false });
        }
      },

      // ✅ НОВОЕ: Регенерация энергии
      regenerateEnergy: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const result = await rewardsService.regenerateEnergy(user.id);
          if (result.regenerated > 0) {
            // Обновляем пользователя после регенерации
            const updatedUser = await authService.getCurrentUser(user.telegram_id);
            if (updatedUser) {
              set({ user: updatedUser });
              console.log(`⚡ Энергия восстановлена: +${result.regenerated}`);
            }
          }
        } catch (error) {
          console.error('Regenerate energy error:', error);
        }
      },

      addExperience: async (amount) => {
        const { user } = get();
        if (!user) {
          set({ error: 'Пользователь не авторизован' });
          return false;
        }

        const success = await authService.addExperience(user.id, amount);
        if (success) {
          const updatedUser = await authService.getCurrentUser(user.telegram_id);
          if (updatedUser) {
            set({ user: updatedUser });
          }
        }
        return success;
      },

      addCurrency: async (coins = 0, points = 0) => {
        const { user } = get();
        if (!user) {
          set({ error: 'Пользователь не авторизован' });
          return false;
        }

        const success = await authService.addCurrency(user.id, coins, points);
        if (success) {
          set({
            user: {
              ...user,
              coins: user.coins + coins,
              points: user.points + points,
            },
          });
        }
        return success;
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'tudasuda-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);