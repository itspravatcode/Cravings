import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';
import type { Me } from './types';

const TOKEN_KEY = 'cravings.token';
const USER_KEY = 'cravings.user';

// SecureStore has no web implementation; the web build falls back to localStorage (dev only).
const storage = {
  get: (k: string) => (Platform.OS === 'web' ? Promise.resolve(globalThis.localStorage?.getItem(k) ?? null) : SecureStore.getItemAsync(k)),
  set: (k: string, v: string) => (Platform.OS === 'web' ? Promise.resolve(globalThis.localStorage?.setItem(k, v)) : SecureStore.setItemAsync(k, v)),
  remove: (k: string) => (Platform.OS === 'web' ? Promise.resolve(globalThis.localStorage?.removeItem(k)) : SecureStore.deleteItemAsync(k)),
};

type SessionState = {
  token: string | null;
  user: Me | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  signIn: (token: string, user: Me) => Promise<void>;
  setUser: (user: Me) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useSession = create<SessionState>((set) => ({
  token: null,
  user: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const [token, user] = await Promise.all([storage.get(TOKEN_KEY), storage.get(USER_KEY)]);
      set({ token, user: user ? (JSON.parse(user) as Me) : null, hydrated: true });
    } catch {
      set({ token: null, user: null, hydrated: true });
    }
  },

  signIn: async (token, user) => {
    await Promise.all([storage.set(TOKEN_KEY, token), storage.set(USER_KEY, JSON.stringify(user))]);
    set({ token, user });
  },

  setUser: async (user) => {
    await storage.set(USER_KEY, JSON.stringify(user));
    set({ user });
  },

  signOut: async () => {
    await Promise.all([storage.remove(TOKEN_KEY), storage.remove(USER_KEY)]);
    set({ token: null, user: null });
  },
}));
