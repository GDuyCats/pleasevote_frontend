'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = Cookies.get('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });

    Cookies.set('accessToken', data.accessToken, { expires: 1 / 96 });
    Cookies.set('refreshToken', data.refreshToken, { expires: 30 });
    Cookies.set('user', JSON.stringify(data.user), { expires: 30 });

    setUser(data.user);
    router.push('/');
  }

  async function loginWithGoogle(idToken: string) {
    const { data } = await api.post('/auth/google', { idToken });

    Cookies.set('accessToken', data.accessToken, { expires: 1 / 96 });
    Cookies.set('refreshToken', data.refreshToken, { expires: 30 });
    Cookies.set('user', JSON.stringify(data.user), { expires: 30 });

    setUser(data.user);
    router.push('/');
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await api.post('/auth/register', { name, email, password });
    return { message: data.message };
  }

  async function logout() {
    const refreshToken = Cookies.get('refreshToken');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch {
        // Even if the server call fails, still clear local state
      }
    }

    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('user');
    setUser(null);
    router.push('/login');
  }

  function updateUser(updates: Partial<User>) {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      Cookies.set('user', JSON.stringify(updated), { expires: 30 });
      return updated;
    });
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithGoogle, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}