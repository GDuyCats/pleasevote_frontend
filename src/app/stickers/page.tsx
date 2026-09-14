'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Sticker, StickerPack } from '@/types/sticker';
import { useAuth } from '@/context/AuthContext';
import { useAuthPrompt } from '@/context/AuthPromptContext';
import { useCoin } from '@/context/CoinContext';

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
      return <span className="text-xs font-semibold text-success">Miễn phí</span>;
    }
    if (user && sticker.creator_id === user.id) {
      return <span className="text-xs font-semibold text-accent">Của bạn</span>;
    }
    if (ownedIds.has(sticker.id)) {
      return <span className="text-xs font-semibold text-success">Đã sở hữu</span>;
    }
    return (
      <button
        onClick={() => handleBuySticker(sticker)}
        disabled={purchasingId === sticker.id}
        className="rounded-control bg-primary px-3 py-1 text-on-primary hover:bg-primary-hover disabled:opacity-50 text-label-lg min-h-11"
      >
        {purchasingId === sticker.id ? '...' : `🪙 ${sticker.price_coins}`}
      </button>
    );
  }

  return (
    <div className="bg-background">


      <main className="page-shell max-w-3xl">
        <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-foreground text-page-title">Chợ Sticker</h1>
            <p className="text-sm text-muted">Mua sticker độc quyền từ cộng đồng để trang trí bình chọn</p>
          </div>
          {user && (
            <Link
              href="/stickers/create"
              className="rounded-card bg-primary px-4 py-2 text-on-primary hover:bg-primary-hover text-label-lg min-h-11"
            >
              + Tạo sticker
            </Link>
          )}
        </div>

        <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
          <button
            onClick={() => setTab('stickers')}
            className={`min-h-11 border-b-2 px-4 py-2 text-sm font-medium ${
              tab === 'stickers' ? 'border-accent text-accent' : 'border-transparent text-muted'
            }`}
          >
            Sticker lẻ
          </button>
          <button
            onClick={() => setTab('packs')}
            className={`min-h-11 border-b-2 px-4 py-2 text-sm font-medium ${
              tab === 'packs' ? 'border-accent text-accent' : 'border-transparent text-muted'
            }`}
          >
            Pack
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-danger">{error}</p>}

        {loading ? (
          <p className="text-center text-muted">Đang tải...</p>
        ) : tab === 'stickers' ? (
          stickers.length === 0 ? (
            <p className="text-center text-muted">Chưa có sticker nào.</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,9rem),1fr))] gap-3">
              {stickers.map((sticker) => (
                <div
                  key={sticker.id}
                  className="flex min-w-0 flex-col items-center rounded-card bg-surface p-3 text-center ring-1 ring-border"
                >
                  <img src={sticker.image_url} alt={sticker.name} className="h-20 w-20 object-contain" />
                  <p className="mt-2 line-clamp-1 text-xs font-semibold text-foreground">{sticker.name}</p>
                  <p className="text-body-sm text-muted [overflow-wrap:anywhere]">bởi {sticker.creator.name}</p>
                  <div className="mt-2">{renderOwnershipBadgeOrButton(sticker)}</div>
                </div>
              ))}
            </div>
          )
        ) : packs.length === 0 ? (
          <p className="text-center text-muted">Chưa có pack nào.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-3">
            {packs.map((pack) => (
              <div key={pack.id} className="min-w-0 rounded-card bg-surface p-card ring-1 ring-border">
                <div className="mb-2 flex flex-wrap gap-1">
                  {pack.stickers.slice(0, 4).map((s) => (
                    <img key={s.id} src={s.image_url} alt={s.name} className="h-12 w-12 rounded-card object-contain" />
                  ))}
                  {pack.stickers.length > 4 && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-card bg-surface-muted text-xs font-semibold text-muted">
                      +{pack.stickers.length - 4}
                    </div>
                  )}
                </div>
                <p className="text-label-lg text-secondary [overflow-wrap:anywhere]">{pack.name}</p>
                {pack.description && <p className="text-body-sm text-muted [overflow-wrap:anywhere]">{pack.description}</p>}
                <p className="mt-1 text-body-sm text-muted [overflow-wrap:anywhere]">
                  {pack.stickers.length} sticker · bởi {pack.creator.name}
                </p>

                <div className="mt-3">
                  {user && pack.creator_id === user.id ? (
                    <span className="text-xs font-semibold text-accent">Của bạn</span>
                  ) : (
                    <button
                      onClick={() => handleBuyPack(pack)}
                      disabled={purchasingId === pack.id}
                      className="w-full rounded-card bg-primary py-1.5 text-on-primary hover:bg-primary-hover disabled:opacity-50 text-label-lg min-h-11"
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
