'use client';

import { getErrorMessage } from '@/lib/i18n';
import { useLanguage } from '@/context/LanguageContext';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
export default function LoginPage() {
  const { translate, language } = useLanguage();
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
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Đăng nhập thất bại, thử lại nhé'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse: any) {
    setError('');
    try {
      await loginWithGoogle(credentialResponse.credential);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Đăng nhập Google thất bại'));
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-var(--app-header-height))] items-center justify-center bg-background px-margin-mobile py-section">
      <div className="ui-card w-full max-w-md">
        <h1 className="mb-2 text-center text-foreground text-page-title">{translate("Chào mừng trở lại")}</h1>
        <p className="mb-6 text-center text-muted">{translate("Đăng nhập vào tài khoản")}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1 block text-foreground text-label-lg">{translate("Email")}</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="ui-input w-full"
              placeholder="ban@example.com"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="login-password" className="block text-foreground text-label-lg">{translate("Mật khẩu")}</label>
            </div>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="ui-input w-full"
              placeholder="••••••••"
            />
          </div>

          {error && <p role="alert" className="ui-feedback bg-danger-soft text-danger">{translate(error)}</p>}

          <button
            type="submit"
            disabled={loading}
            className="ui-button ui-button-primary w-full disabled:opacity-50"
          >
            {loading ? translate("Đang đăng nhập...") : translate("Đăng nhập")}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-surface-hover" />
          <span className="text-metadata text-muted">{translate("hoặc")}</span>
          <div className="h-px flex-1 bg-surface-hover" />
        </div>

        <div className="flex justify-center">
          <GoogleOAuthProvider key={language} clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string} locale={language}>
            <GoogleLogin
              width="240"
              key={resolvedTheme}
              theme={resolvedTheme === 'dark' ? 'filled_black' : 'outline'}
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Đăng nhập Google thất bại')}
            />
          </GoogleOAuthProvider>
        </div>

        <p className="mt-6 text-center text-body-md text-muted">
          {translate("Chưa có tài khoản?")}{' '}
          <Link href="/register" className="font-medium text-accent hover:underline">
            {translate("Đăng ký")} </Link>
        </p>
      </div>
    </div>
  );
}
