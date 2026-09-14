'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CoinPackage } from '@/types/coin';
import { useAuth } from '@/context/AuthContext';
import { useAuthPrompt } from '@/context/AuthPromptContext';


export default function CoinsPage() {
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<number | null>(null);
  const { user } = useAuth();
  const { openPrompt } = useAuthPrompt();

  useEffect(() => {
    fetchPackages();
  }, []);

  async function fetchPackages() {
    setLoading(true);
    try {
      const { data } = await api.get('/coin-packages');
      setPackages(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleBuy(packageId: number) {
    if (!user) {
      openPrompt('Đăng nhập để nạp coin và mở khoá sticker đặc biệt.');
      return;
    }

    setPurchasingId(packageId);
    try {
      const { data } = await api.post('/coins/checkout', { coin_package_id: packageId });
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error('Checkout failed', err);
      setPurchasingId(null);
    }
  }

  function formatPrice(cents: number, currency: string) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(
      cents / 100
    );
  }

  return (
    <div className="bg-background">


      <main className="page-shell max-w-2xl">
        <h1 className="mb-1 text-foreground text-page-title">Nạp Coin</h1>
        <p className="mb-6 text-sm text-muted">Dùng coin để mua sticker độc quyền từ cộng đồng.</p>

        {loading ? (
          <p className="text-center text-muted">Đang tải...</p>
        ) : packages.length === 0 ? (
          <p className="text-center text-muted">Chưa có gói coin nào.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,11rem),1fr))] gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="flex min-w-0 flex-col items-center rounded-card bg-surface p-card text-center ring-1 ring-border"
              >
                <span className="text-3xl">🪙</span>
                <p className="mt-2 max-w-full text-metric tabular-nums [overflow-wrap:anywhere] text-foreground">{pkg.coin_amount}</p>
                <p className="max-w-full text-body-sm text-muted [overflow-wrap:anywhere]">{pkg.name}</p>
                <p className="mt-2 max-w-full text-section-title [overflow-wrap:anywhere] text-accent">
                  {formatPrice(pkg.price_cents, pkg.currency)}
                </p>
                <button
                  onClick={() => handleBuy(pkg.id)}
                  disabled={purchasingId === pkg.id}
                  className="mt-4 w-full rounded-card bg-primary py-2 text-on-primary hover:bg-primary-hover disabled:opacity-50 text-label-lg min-h-11"
                >
                  {purchasingId === pkg.id ? 'Đang chuyển...' : 'Mua ngay'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
