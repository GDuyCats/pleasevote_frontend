'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCoin } from '@/context/CoinContext';


export default function CoinsSuccessPage() {
  const { balance, refreshBalance } = useCoin();
  const [checking, setChecking] = useState(true);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // The webhook that credits coins runs asynchronously on the backend, so
    // there can be a short delay after Stripe redirects back here. We poll
    // a few times to catch the balance update instead of showing a stale
    // number immediately.
    const interval = setInterval(async () => {
      await refreshBalance();
      setAttempts((prev) => prev + 1);
    }, 1500);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setChecking(false);
    }, 9000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="bg-background">


      <main className="page-shell max-w-md text-center">
        <div className="rounded-card bg-surface p-8 ring-1 ring-border">
          <div className="mb-4 text-5xl">🎉</div>
          <h1 className="mb-2 text-foreground text-page-title">Thanh toán thành công!</h1>
          <p className="mb-6 text-sm text-muted">
            {checking
              ? 'Đang cập nhật số coin của bạn...'
              : 'Coin của bạn đã được cộng vào tài khoản.'}
          </p>

          <p className="mb-6 text-3xl font-bold text-warning">🪙 {balance ?? '...'}</p>

          <Link
            href="/"
            className="inline-block rounded-card bg-primary px-6 py-2 text-on-primary hover:bg-primary-hover text-label-lg min-h-11"
          >
            Về trang chủ
          </Link>
        </div>
      </main>
    </div>
  );
}
