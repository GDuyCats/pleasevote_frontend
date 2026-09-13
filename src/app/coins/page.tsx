'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CoinPackage } from '@/types/coin';
import { useAuth } from '@/context/AuthContext';
import { useAuthPrompt } from '@/context/AuthPromptContext';
import Navbar from '@/components/Navbar';

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-1 text-xl font-bold text-gray-900">Nạp Coin</h1>
        <p className="mb-6 text-sm text-gray-500">Dùng coin để mua sticker độc quyền từ cộng đồng.</p>

        {loading ? (
          <p className="text-center text-gray-400">Đang tải...</p>
        ) : packages.length === 0 ? (
          <p className="text-center text-gray-400">Chưa có gói coin nào.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-gray-100"
              >
                <span className="text-3xl">🪙</span>
                <p className="mt-2 text-lg font-bold text-gray-900">{pkg.coin_amount}</p>
                <p className="text-xs text-gray-400">{pkg.name}</p>
                <p className="mt-2 text-sm font-semibold text-purple-600">
                  {formatPrice(pkg.price_cents, pkg.currency)}
                </p>
                <button
                  onClick={() => handleBuy(pkg.id)}
                  disabled={purchasingId === pkg.id}
                  className="mt-4 w-full rounded-lg bg-purple-600 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
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