import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, TelegramUser } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  login: (telegramUser: TelegramUser) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
  addExperience: (amount: number) => Promise<boolean>;
  addCurrency: (coins?: number, points?: number) => Promise<boolean>;
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
            set({
              user,
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
          const updatedUser = await authService.updateProfile(user.id, updates);
          if (updatedUser) {
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
          set({ 
            isLoading: false,
            error: error instanceof Error ? error.message : 'Ошибка обновления профиля',
          });
          return false;
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
          // Обновляем пользователя
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
          // Обновляем локально для быстрого отклика
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