import { create } from 'zustand';
import type { User } from '@t/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  reauthOpen: boolean;
  reauthMessage: string | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (v: boolean) => void;
  openReauth: (message?: string) => void;
  closeReauth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  reauthOpen: false,
  reauthMessage: null,

  setUser: (user) =>
    set({ user, isAuthenticated: true, isLoading: false, reauthOpen: false, reauthMessage: null }),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      reauthOpen: false,
      reauthMessage: null,
    }),

  setLoading: (v) => set({ isLoading: v }),

  openReauth: (message) =>
    set({
      reauthOpen: true,
      reauthMessage: message ?? null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  closeReauth: () => set({ reauthOpen: false, reauthMessage: null }),
}));
