'use client';

import { getErrorMessage } from '@/lib/i18n';
import { useLanguage } from '@/context/LanguageContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { SlotStatus } from '@/types/sticker';
import { useAuth } from '@/context/AuthContext';
import { useCoin } from '@/context/CoinContext';

export default function CreateStickerPage() {
  const { translate, formatNumber } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { balance, refreshBalance } = useCoin();
  const router = useRouter();

  const [slotStatus, setSlotStatus] = useState<SlotStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [buyingSlots, setBuyingSlots] = useState(false);

  const [name, setName] = useState('');
  const [priceCoins, setPriceCoins] = useState('0');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchSlotStatus();
    }
  }, [user, authLoading]);

  async function fetchSlotStatus() {
    setLoadingStatus(true);
    try {
      const { data } = await api.get('/stickers/slots/status');
      setSlotStatus(data);
    } finally {
      setLoadingStatus(false);
    }
  }

  async function handleBuySlots() {
    setError('');
    setBuyingSlots(true);
    try {
      await api.post('/stickers/slots/purchase');
      await fetchSlotStatus();
      await refreshBalance();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Mua thêm slot thất bại'));
    } finally {
      setBuyingSlots(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Nhập tên sticker');
      return;
    }
    if (!imageFile) {
      setError('Chọn ảnh sticker');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price_coins', priceCoins || '0');
      formData.append('image', imageFile);

      await api.post('/stickers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Tạo sticker thành công!');
      setName('');
      setPriceCoins('0');
      setImageFile(null);
      setImagePreview(null);
      await fetchSlotStatus();

      setTimeout(() => router.push('/stickers'), 1200);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Tạo sticker thất bại'));
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || loadingStatus || !slotStatus) {
    return <p className="mt-10 text-center text-muted">{translate("Đang tải...")}</p>;
  }

  const slotsFull = slotStatus.used >= slotStatus.limit;
  const canAffordSlots = (balance ?? 0) >= slotStatus.slotPackPriceCoins;

  return (
    <main className="page-shell">
      <h1 className="mb-1 text-foreground text-page-title">{translate("Tạo Sticker")}</h1>
      <p className="mb-6 text-body-md text-muted">{translate("Tạo sticker của riêng bạn và bán cho cộng đồng.")}</p>

      {/* Slot usage */}
      <div className="ui-card mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-body-md font-semibold text-foreground">
              {translate("Slot sticker:")} {formatNumber(slotStatus.used)} / {formatNumber(slotStatus.limit)}
            </p>
            <p className="text-metadata text-muted">
              {translate('slotPurchase', { count: slotStatus.slotPackSize, price: slotStatus.slotPackPriceCoins })}
            </p>
          </div>
          <button
            onClick={handleBuySlots}
            disabled={buyingSlots || !canAffordSlots}
            className="ui-button bg-warning-soft text-warning hover:bg-warning-muted disabled:opacity-50"
          >
            {buyingSlots ? translate("Đang mua...") : translate('stickerSlots', { count: slotStatus.slotPackSize })}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${Math.min(100, (slotStatus.used / slotStatus.limit) * 100)}%` }}
          />
        </div>

        {!canAffordSlots && slotsFull && (
          <p role="alert" className="ui-feedback bg-danger-soft mt-2 text-danger">
            {translate('slotBalance', { count: balance ?? 0 })}
          </p>
        )}
      </div>

      {slotsFull ? (
        <div className="rounded-card bg-warning-soft p-6 text-center">
          <p className="text-body-md font-semibold text-warning">{translate("Bạn đã dùng hết slot sticker.")}</p>
          <p className="mt-1 text-metadata text-warning">{translate("Mua thêm slot ở trên để tiếp tục tạo sticker mới.")}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="ui-card max-w-2xl space-y-4">
          <div>
            <label htmlFor="sticker-name" className="mb-1 block text-foreground text-label-lg">{translate("Tên sticker")}</label>
            <input
              id="sticker-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={translate("Mèo cười")}
              className="ui-input w-full"
            />
          </div>

          <div>
            <label htmlFor="sticker-price" className="mb-1 block text-foreground text-label-lg">
              {translate("Giá (coin) — để 0 nếu muốn miễn phí")} </label>
            <input
              id="sticker-price"
              type="number"
              min={0}
              value={priceCoins}
              onChange={(e) => setPriceCoins(e.target.value)}
              className="ui-input w-full"
            />
          </div>

          <div>
            <label htmlFor="sticker-image" className="mb-1 block text-foreground text-label-lg">{translate("Ảnh sticker")}</label>
            <input
              id="sticker-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-control text-muted file:mr-3 file:rounded-control file:border-0 file:bg-accent-soft file:px-3 file:py-3 file:text-body-md file:font-semibold file:text-accent hover:file:bg-accent-muted min-h-11"
            />
            {imagePreview && (
              <img src={imagePreview} alt={translate("preview")} className="mt-3 h-24 w-24 rounded-media object-contain" />
            )}
          </div>

          {error && <p role="alert" className="ui-feedback bg-danger-soft text-danger">{translate(error)}</p>}
          {success && <p role="status" className="ui-feedback bg-success-soft text-success">{translate(success)}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="ui-button ui-button-primary w-full disabled:opacity-50"
          >
            {submitting ? translate("Đang tạo...") : translate("Tạo sticker")}
          </button>
        </form>
      )}
    </main>
  );
}
