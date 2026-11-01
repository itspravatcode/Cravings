import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponse, LoginCredentials, RegisterCredentials } from '@/types';
import { api } from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await api.login(credentials);
          set({ user, token, isAuthenticated: true, isLoading: false, error: null });
        } catch (err: any) {
          set({ isLoading: false, error: err.message || 'Login failed' });
          throw err;
        }
      },

      register: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await api.register(credentials);
          set({ user, token, isAuthenticated: true, isLoading: false, error: null });
        } catch (err: any) {
          set({ isLoading: false, error: err.message || 'Registration failed' });
          throw err;
        }
      },

      logout: async () => {
        // Demo token auth: call the backend to invalidate the token, then clear
        // client state regardless of outcome (token is cleared client-side per
        // the /auth/logout contract).
        try {
          await api.logout();
        } catch {
          // Swallow logout errors — local state is still cleared below.
        }
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      setUser: (user) => set({ user }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'cravings-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);