'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserPublicProfile } from '@/types/user.types';

interface AuthState {
  user:        UserPublicProfile | null;
  accessToken: string | null;
  isLoading:   boolean;

  setAuth:    (user: UserPublicProfile, token: string) => void;
  setToken:   (token: string) => void;
  clearAuth:  () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:        null,
      accessToken: null,
      isLoading:   false,

      setAuth:    (user, accessToken) => set({ user, accessToken }),
      setToken:   (accessToken) => set({ accessToken }),
      clearAuth:  () => set({ user: null, accessToken: null }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name:    'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
