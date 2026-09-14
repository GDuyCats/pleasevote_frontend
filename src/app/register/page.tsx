'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
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
      const result = await register(name, email, password);
      setSuccessMessage(result.message);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng ký thất bại, thử lại nhé');
    } finally {
      setLoading(false);
    }
  }

  if (successMessage) {
    return (
      <div className="flex min-h-[calc(100dvh-var(--app-header-height))] items-center justify-center bg-background px-margin-mobile py-section">
        <div className="w-full max-w-md rounded-panel border border-border bg-surface p-card text-center">
          <div className="mb-4 text-5xl">📬</div>
          <h1 className="mb-2 text-foreground text-page-title">Kiểm tra email của bạn!</h1>
          <p className="text-muted">{successMessage}</p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-card bg-primary px-6 py-2 text-on-primary hover:bg-primary-hover text-label-lg min-h-11"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-var(--app-header-height))] items-center justify-center bg-background px-margin-mobile py-section">
      <div className="w-full max-w-md rounded-panel border border-border bg-surface p-card">
        <h1 className="mb-2 text-center text-secondary text-page-title">Tạo tài khoản của bạn</h1>
        <p className="mb-6 text-center text-muted">Tạo tài khoản mới</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-card border border-border-strong px-4 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent text-control min-h-11"
              placeholder="Nguyễn Văn A"
            />
          </div>

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
            <label className="mb-1 block text-sm font-medium text-foreground">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-card border border-border-strong px-4 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent text-control min-h-11"
              placeholder="Ít nhất 6 ký tự"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-card bg-primary py-2 text-on-primary transition hover:bg-primary-hover disabled:opacity-50 text-label-lg min-h-11"
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
