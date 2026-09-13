'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Sticker, StickerPack } from '@/types/sticker';
import { useAuth } from '@/context/AuthContext';
import { useAuthPrompt } from '@/context/AuthPromptContext';
import { useCoin } from '@/context/CoinContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function StickerMarketplacePage() {
  const [tab, setTab] = useState<'stickers' | 'packs'>('stickers');
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [packs, setPacks] = useState<StickerPack[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const { openPrompt } = useAuthPrompt();
  const { balance, refreshBalance } = useCoin();

  useEffect(() => {
    fetchAll();
  }, [user]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [stickersRes, packsRes] = await Promise.all([
        api.get('/stickers'),
        api.get('/sticker-packs'),
      ]);
      setStickers(stickersRes.data);
      setPacks(packsRes.data);

      if (user) {
        const mineRes = await api.get('/stickers/mine');
        setOwnedIds(new Set(mineRes.data.map((s: Sticker) => s.id)));
      } else {
        setOwnedIds(new Set());
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleBuySticker(sticker: Sticker) {
    if (!user) {
      openPrompt('Đăng nhập để mua sticker và trang trí bình chọn của bạn.');
      return;
    }

    setError('');
    setPurchasingId(sticker.id);
    try {
      await api.post(`/stickers/${sticker.id}/purchase`);
      await refreshBalance();
      await fetchAll();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Mua sticker thất bại');
    } finally {
      setPurchasingId(null);
    }
  }

  async function handleBuyPack(pack: StickerPack) {
    if (!user) {
      openPrompt('Đăng nhập để mua sticker và trang trí bình chọn của bạn.');
      return;
    }

    setError('');
    setPurchasingId(pack.id);
    try {
      await api.post(`/sticker-packs/${pack.id}/purchase`);
      await refreshBalance();
      await fetchAll();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Mua pack thất bại');
    } finally {
      setPurchasingId(null);
    }
  }

  function renderOwnershipBadgeOrButton(sticker: Sticker) {
    if (sticker.price_coins === 0) {
      return <span className="text-xs font-semibold text-green-600">Miễn phí</span>;
    }
    if (user && sticker.creator_id === user.id) {
      return <span className="text-xs font-semibold text-purple-600">Của bạn</span>;
    }
    if (ownedIds.has(sticker.id)) {
      return <span className="text-xs font-semibold text-green-600">Đã sở hữu</span>;
    }
    return (
      <button
        onClick={() => handleBuySticker(sticker)}
        disabled={purchasingId === sticker.id}
        className="rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
      >
        {purchasingId === sticker.id ? '...' : `🪙 ${sticker.price_coins}`}
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Chợ Sticker</h1>
            <p className="text-sm text-gray-500">Mua sticker độc quyền từ cộng đồng để trang trí bình chọn</p>
          </div>
          {user && (
            <Link
              href="/stickers/create"
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
            >
              + Tạo sticker
            </Link>
          )}
        </div>

        <div className="mb-6 flex gap-1 border-b border-gray-200">
          <button
            onClick={() => setTab('stickers')}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === 'stickers' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500'
            }`}
          >
            Sticker lẻ
          </button>
          <button
            onClick={() => setTab('packs')}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === 'packs' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500'
            }`}
          >
            Pack
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-center text-gray-400">Đang tải...</p>
        ) : tab === 'stickers' ? (
          stickers.length === 0 ? (
            <p className="text-center text-gray-400">Chưa có sticker nào.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {stickers.map((sticker) => (
                <div
                  key={sticker.id}
                  className="flex flex-col items-center rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-gray-100"
                >
                  <img src={sticker.image_url} alt={sticker.name} className="h-20 w-20 object-contain" />
                  <p className="mt-2 line-clamp-1 text-xs font-semibold text-gray-800">{sticker.name}</p>
                  <p className="text-[11px] text-gray-400">bởi {sticker.creator.name}</p>
                  <div className="mt-2">{renderOwnershipBadgeOrButton(sticker)}</div>
                </div>
              ))}
            </div>
          )
        ) : packs.length === 0 ? (
          <p className="text-center text-gray-400">Chưa có pack nào.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {packs.map((pack) => (
              <div key={pack.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                <div className="mb-2 flex gap-1">
                  {pack.stickers.slice(0, 4).map((s) => (
                    <img key={s.id} src={s.image_url} alt={s.name} className="h-12 w-12 rounded-lg object-contain" />
                  ))}
                  {pack.stickers.length > 4 && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-500">
                      +{pack.stickers.length - 4}
                    </div>
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-800">{pack.name}</p>
                {pack.description && <p className="text-xs text-gray-500">{pack.description}</p>}
                <p className="mt-1 text-[11px] text-gray-400">
                  {pack.stickers.length} sticker · bởi {pack.creator.name}
                </p>

                <div className="mt-3">
                  {user && pack.creator_id === user.id ? (
                    <span className="text-xs font-semibold text-purple-600">Của bạn</span>
                  ) : (
                    <button
                      onClick={() => handleBuyPack(pack)}
                      disabled={purchasingId === pack.id}
                      className="w-full rounded-lg bg-purple-600 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                      {purchasingId === pack.id ? 'Đang xử lý...' : `Mua cả pack — 🪙 ${pack.price_coins}`}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}