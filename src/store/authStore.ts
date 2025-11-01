import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, TelegramUser } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (telegramUser: TelegramUser) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
  addExperience: (amount: number) => Promise<boolean>;
  addCurrency: (coins?: number, points?: number) => Promise<boolean>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      login: async (telegramUser: TelegramUser) => {
        set({ isLoading: true });
        try {
          const user = await authService.authenticateWithTelegram(telegramUser);
          if (user) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),

      updateUser: async (updates) => {
        const { user } = get();
        if (!user) return false;

        const updatedUser = await authService.updateProfile(user.id, updates);
        if (updatedUser) {
          set({ user: updatedUser });
          return true;
        }
        return false;
      },

      addExperience: async (amount) => {
        const { user } = get();
        if (!user) return false;

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
        if (!user) return false;

        const success = await authService.addCurrency(user.id, coins, points);
        if (success) {
          // Обновляем локально
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