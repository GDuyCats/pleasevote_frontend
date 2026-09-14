'use client';

import { getErrorMessage } from '@/lib/i18n';
import { useLanguage } from '@/context/LanguageContext';
import { useState } from 'react';
import Link from 'next/link';
import AppIcon from '@/components/AppIcon';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { translate } = useLanguage();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password);
      setSuccessMessage('Đã tạo tài khoản. Vui lòng kiểm tra email để xác thực.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Đăng ký thất bại, thử lại nhé'));
    } finally {
      setLoading(false);
    }
  }

  if (successMessage) {
    return (
      <div className="flex min-h-[calc(100dvh-var(--app-header-height))] items-center justify-center bg-background px-margin-mobile py-section">
        <div className="ui-card w-full max-w-md text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-media bg-accent-soft text-accent"><AppIcon name="mail" className="h-6 w-6" /></span>
          <h1 className="mb-2 text-foreground text-page-title">{translate("Kiểm tra email của bạn!")}</h1>
          <p className="text-muted">{translate(successMessage)}</p>
          <Link
            href="/login"
            className="ui-button ui-button-primary mt-6"
          >
            {translate("Quay lại đăng nhập")} </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-var(--app-header-height))] items-center justify-center bg-background px-margin-mobile py-section">
      <div className="ui-card w-full max-w-md">
        <h1 className="mb-2 text-center text-foreground text-page-title">{translate("Tạo tài khoản của bạn")}</h1>
        <p className="mb-6 text-center text-muted">{translate("Tạo tài khoản mới")}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="register-name" className="mb-1 block text-foreground text-label-lg">{translate("Tên")}</label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="ui-input w-full"
              placeholder={translate("Nguyễn Văn A")}
            />
          </div>

          <div>
            <label htmlFor="register-email" className="mb-1 block text-foreground text-label-lg">{translate("Email")}</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="ui-input w-full"
              placeholder="ban@example.com"
            />
          </div>

          <div>
            <label htmlFor="register-password" className="mb-1 block text-foreground text-label-lg">{translate("Mật khẩu")}</label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="ui-input w-full"
              placeholder={translate("Ít nhất 6 ký tự")}
            />
          </div>

          {error && <p role="alert" className="ui-feedback bg-danger-soft text-danger">{translate(error)}</p>}

          <button
            type="submit"
            disabled={loading}
            className="ui-button ui-button-primary w-full disabled:opacity-50"
          >
            {loading ? translate("Đang xử lý...") : translate("Đăng ký")}
          </button>
        </form>

        <p className="mt-6 text-center text-body-md text-muted">
          {translate("Đã có tài khoản?")}{' '}
          <Link href="/login" className="font-medium text-accent hover:underline">
            {translate("Đăng nhập")} </Link>
        </p>
      </div>
    </div>
  );
}
