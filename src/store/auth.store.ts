import { create } from 'zustand';
import type { User } from '@t/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean; // true only during the initial /me boot check
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

  clearUser: () => set({ user: null, isAuthenticated: false, isLoading: false }),

  setLoading: (v) => set({ isLoading: v }),
}));
