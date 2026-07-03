'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError, setUnauthorizedHandler } from '@/lib/api';
import { clearAuth, getToken, getUser, setAuth } from '@/lib/auth';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  useEffect(() => {
    setUnauthorizedHandler(() => logout());
    return () => setUnauthorizedHandler(() => {});
  }, [logout]);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await api.login(email, password);
      setAuth(data.token, data.user);
      setToken(data.token);
      setUser(data.user);
      router.push('/dashboard');
    },
    [router]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await api.register(name, email, password);
      setAuth(data.token, data.user);
      setToken(data.token);
      setUser(data.user);
      router.push('/dashboard');
    },
    [router]
  );

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function getAuthErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}
