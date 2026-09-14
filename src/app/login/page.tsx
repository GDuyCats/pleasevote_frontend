'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { GoogleLogin } from '@react-oauth/google';
export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const { resolvedTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại, thử lại nhé');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse: any) {
    setError('');
    try {
      await loginWithGoogle(credentialResponse.credential);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng nhập Google thất bại');
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-var(--app-header-height))] items-center justify-center bg-background px-margin-mobile py-section">
      <div className="w-full max-w-md rounded-panel border border-border bg-surface p-card">
        <h1 className="mb-2 text-center text-secondary text-page-title">Chào mừng trở lại</h1>
        <p className="mb-6 text-center text-muted">Đăng nhập vào tài khoản</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-card border border-border-strong px-4 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent text-control min-h-11"
              placeholder="ban@example.com"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium text-foreground">Mật khẩu</label>
              <Link href="/forgot-password" className="text-xs text-accent hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-card border border-border-strong px-4 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent text-control min-h-11"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-card bg-primary py-2 text-on-primary transition hover:bg-primary-hover disabled:opacity-50 text-label-lg min-h-11"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-surface-hover" />
          <span className="text-xs text-muted">hoặc</span>
          <div className="h-px flex-1 bg-surface-hover" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            width="240"
            key={resolvedTheme}
            theme={resolvedTheme === 'dark' ? 'filled_black' : 'outline'}
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Đăng nhập Google thất bại')}
          />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-medium text-accent hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}
