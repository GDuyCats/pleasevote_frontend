'use client';

import { getErrorMessage } from '@/lib/i18n';
import { useLanguage } from '@/context/LanguageContext';
import { useEffect, useState } from 'react';
import { stickerService } from '@/services/sticker.service';
import { Sticker, StickerPack } from '@/types/sticker';
import { useAuth } from '@/context/AuthContext';
import { useAuthPrompt } from '@/context/AuthPromptContext';
import { useCoin } from '@/context/CoinContext';

import Link from 'next/link';

export default function StickerMarketplacePage() {
  const { translate } = useLanguage();
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
      const [stickerList, packList] = await Promise.all([
        stickerService.list(),
        stickerService.listPacks(),
      ]);
      setStickers(stickerList);
      setPacks(packList);

      if (user) {
        const ownedStickers = await stickerService.listMine();
        setOwnedIds(new Set(ownedStickers.map((s: Sticker) => s.id)));
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
      await stickerService.purchase(sticker.id);
      await refreshBalance();
      await fetchAll();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Mua sticker thất bại'));
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
      await stickerService.purchasePack(pack.id);
      await refreshBalance();
      await fetchAll();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Mua pack thất bại'));
    } finally {
      setPurchasingId(null);
    }
  }

  function renderOwnershipBadgeOrButton(sticker: Sticker) {
    if (sticker.price_coins === 0) {
      return <span className="text-metadata font-semibold text-success">{translate("Miễn phí")}</span>;
    }
    if (user && sticker.creator_id === user.id) {
      return <span className="text-metadata font-semibold text-accent">{translate("Của bạn")}</span>;
    }
    if (ownedIds.has(sticker.id)) {
      return <span className="text-metadata font-semibold text-success">{translate("Đã sở hữu")}</span>;
    }
    return (
      <button
        onClick={() => handleBuySticker(sticker)}
        disabled={purchasingId === sticker.id}
        className="ui-button ui-button-primary disabled:opacity-50"
      >
        {purchasingId === sticker.id ? '...' : translate('coinPrice', { count: sticker.price_coins })}
      </button>
    );
  }

  return (
    <div className="bg-background">


      <main className="page-shell">
        <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-foreground text-page-title">{translate("Chợ Sticker")}</h1>
            <p className="text-body-md text-muted">{translate("Mua sticker độc quyền từ cộng đồng để trang trí bình chọn")}</p>
          </div>
          {user && (
            <Link
              href="/stickers/create"
              className="ui-button ui-button-primary"
            >
              {translate("+ Tạo sticker")} </Link>
          )}
        </div>

        <div role="group" aria-label={translate("Loại sticker")} className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setTab('stickers')}
            aria-pressed={tab === 'stickers'}
            className="ui-filter"
          >
            {translate("Sticker lẻ")} </button>
          <button
            onClick={() => setTab('packs')}
            aria-pressed={tab === 'packs'}
            className="ui-filter"
          >
            {translate("Pack")} </button>
        </div>

        {error && <p role="alert" className="ui-feedback bg-danger-soft mb-4 text-danger">{translate(error)}</p>}

        {loading ? (
          <p className="text-center text-muted">{translate("Đang tải...")}</p>
        ) : tab === 'stickers' ? (
          stickers.length === 0 ? (
            <p className="text-center text-muted">{translate("Chưa có sticker nào.")}</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,9rem),1fr))] gap-3">
              {stickers.map((sticker) => (
                <div
                  key={sticker.id}
                  className="ui-card flex min-w-0 flex-col items-center text-center"
                >
                  <img src={sticker.image_url} alt={sticker.name} className="h-20 w-20 object-contain" />
                  <p className="mt-2 line-clamp-1 text-metadata font-semibold text-foreground">{sticker.name}</p>
                  <p className="text-body-sm text-muted [overflow-wrap:anywhere]">{translate("bởi")} {sticker.creator.name}</p>
                  <div className="mt-2">{renderOwnershipBadgeOrButton(sticker)}</div>
                </div>
              ))}
            </div>
          )
        ) : packs.length === 0 ? (
          <p className="text-center text-muted">{translate("Chưa có pack nào.")}</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-3">
            {packs.map((pack) => (
              <div key={pack.id} className="ui-card min-w-0">
                <div className="mb-2 flex flex-wrap gap-1">
                  {pack.stickers.slice(0, 4).map((s) => (
                    <img key={s.id} src={s.image_url} alt={s.name} className="h-12 w-12 rounded-card object-contain" />
                  ))}
                  {pack.stickers.length > 4 && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-card bg-surface-muted text-metadata font-semibold text-muted">
                      +{pack.stickers.length - 4}
                    </div>
                  )}
                </div>
                <p className="text-label-lg text-foreground [overflow-wrap:anywhere]">{pack.name}</p>
                {pack.description && <p className="text-body-sm text-muted [overflow-wrap:anywhere]">{pack.description}</p>}
                <p className="mt-1 text-body-sm text-muted [overflow-wrap:anywhere]">
                  {translate('stickersBy', { count: pack.stickers.length, author: pack.creator.name })}
                </p>

                <div className="mt-3">
                  {user && pack.creator_id === user.id ? (
                    <span className="text-metadata font-semibold text-accent">{translate("Của bạn")}</span>
                  ) : (
                    <button
                      onClick={() => handleBuyPack(pack)}
                      disabled={purchasingId === pack.id}
                      className="ui-button ui-button-primary w-full disabled:opacity-50"
                    >
                      {purchasingId === pack.id ? translate("Đang xử lý...") : translate('packPrice', { count: pack.price_coins })}
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
