'use client';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { LoginPayload, RegisterPayload } from '@/types/user.types';

const API_BASE = '/api';

export function useAuth() {
  const { user, accessToken, setAuth, clearAuth, setToken, setLoading } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);
  const router   = useRouter();

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  }), [accessToken]);

  const register = useCallback(async (payload: RegisterPayload) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Registration failed');
      setAuth(data.data.user, data.data.accessToken);
      addToast('Welcome to DesignCraft! 🎉', 'success');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      addToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setAuth, setLoading, addToast, router]);

  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Login failed');
      setAuth(data.data.user, data.data.accessToken);
      addToast(`Welcome back, ${data.data.user.username}!`, 'success');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      addToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setAuth, setLoading, addToast, router]);

  const logout = useCallback(async () => {
    await fetch(`${API_BASE}/auth/refresh`, { method: 'DELETE' });
    clearAuth();
    router.push('/login');
    addToast('Logged out successfully', 'info');
  }, [clearAuth, router, addToast]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const res  = await fetch(`${API_BASE}/auth/refresh`, { method: 'POST' });
      const data = await res.json();
      if (data.success) { setToken(data.data.accessToken); return true; }
      clearAuth(); return false;
    } catch { clearAuth(); return false; }
  }, [setToken, clearAuth]);

  return { user, accessToken, isLoading: useAuthStore((s) => s.isLoading), isAuthenticated: !!user, getHeaders, register, login, logout, refreshToken };
}
