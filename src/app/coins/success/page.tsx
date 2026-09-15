'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppIcon from '@/components/AppIcon';
import { useCoin } from '@/context/CoinContext';


export default function CoinsSuccessPage() {
  const { translate, formatNumber } = useLanguage();
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
        <div className="ui-card">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-media bg-success-soft text-success"><AppIcon name="check" className="h-6 w-6" /></span>
          <h1 className="mb-2 text-foreground text-page-title">{translate("Thanh toán thành công!")}</h1>
          <p className="mb-6 text-body-md text-muted">
            {checking
              ? translate("Đang cập nhật số coin của bạn...")
              : translate("Coin của bạn đã được cộng vào tài khoản.")}
          </p>

          <p className="mb-6 flex flex-wrap items-center justify-center gap-2 text-metric tabular-nums text-accent"><AppIcon name="coin" className="h-6 w-6 shrink-0" />{balance === null ? '...' : formatNumber(balance)}</p>

          <Link
            href="/"
            className="ui-button ui-button-primary"
          >
            {translate("Về trang chủ")} </Link>
        </div>
      </main>
    </div>
  );
}
