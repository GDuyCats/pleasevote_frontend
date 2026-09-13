'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCoin } from '@/context/CoinContext';
import Navbar from '@/components/Navbar';

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="mb-4 text-5xl">🎉</div>
          <h1 className="mb-2 text-xl font-bold text-gray-900">Thanh toán thành công!</h1>
          <p className="mb-6 text-sm text-gray-500">
            {checking
              ? 'Đang cập nhật số coin của bạn...'
              : 'Coin của bạn đã được cộng vào tài khoản.'}
          </p>

          <p className="mb-6 text-3xl font-bold text-yellow-600">🪙 {balance ?? '...'}</p>

          <Link
            href="/"
            className="inline-block rounded-lg bg-purple-600 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-700"
          >
            Về trang chủ
          </Link>
        </div>
      </main>
    </div>
  );
}