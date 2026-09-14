'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { SlotStatus } from '@/types/sticker';
import { useAuth } from '@/context/AuthContext';
import { useCoin } from '@/context/CoinContext';

export default function CreateStickerPage() {
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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Mua thêm slot thất bại');
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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Tạo sticker thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || loadingStatus || !slotStatus) {
    return <p className="mt-10 text-center text-muted">Đang tải...</p>;
  }

  const slotsFull = slotStatus.used >= slotStatus.limit;
  const canAffordSlots = (balance ?? 0) >= slotStatus.slotPackPriceCoins;

  return (
    <main className="page-shell max-w-lg">
      <h1 className="mb-1 text-foreground text-page-title">Tạo Sticker</h1>
      <p className="mb-6 text-sm text-muted">Tạo sticker của riêng bạn và bán cho cộng đồng.</p>

      {/* Slot usage */}
      <div className="mb-6 rounded-card bg-surface p-4 ring-1 ring-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Slot sticker: {slotStatus.used} / {slotStatus.limit}
            </p>
            <p className="text-xs text-muted">
              Mỗi lần mở khoá thêm {slotStatus.slotPackSize} slot với 🪙 {slotStatus.slotPackPriceCoins}
            </p>
          </div>
          <button
            onClick={handleBuySlots}
            disabled={buyingSlots || !canAffordSlots}
            className="min-h-11 rounded-card bg-warning-soft px-3 py-2 text-xs font-semibold text-warning hover:bg-warning-muted disabled:opacity-50"
          >
            {buyingSlots ? 'Đang mua...' : `+${slotStatus.slotPackSize} slot`}
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
          <p className="mt-2 text-xs text-danger">
            Bạn không đủ coin để mở khoá thêm slot. Số dư hiện tại: 🪙 {balance ?? 0}
          </p>
        )}
      </div>

      {slotsFull ? (
        <div className="rounded-card bg-warning-soft p-6 text-center">
          <p className="text-sm font-semibold text-warning">Bạn đã dùng hết slot sticker.</p>
          <p className="mt-1 text-xs text-warning">Mua thêm slot ở trên để tiếp tục tạo sticker mới.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-card bg-surface p-card ring-1 ring-border">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Tên sticker</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mèo cười"
              className="w-full rounded-card border border-border-strong px-4 py-2 text-control focus:border-accent focus:outline-none min-h-11"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Giá (coin) — để 0 nếu muốn miễn phí
            </label>
            <input
              type="number"
              min={0}
              value={priceCoins}
              onChange={(e) => setPriceCoins(e.target.value)}
              className="w-full rounded-card border border-border-strong px-4 py-2 text-control focus:border-accent focus:outline-none min-h-11"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Ảnh sticker</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-control text-muted file:mr-3 file:rounded-card file:border-0 file:bg-accent-soft file:px-3 file:py-2 file:text-sm file:font-semibold file:text-accent hover:file:bg-accent-muted min-h-11"
            />
            {imagePreview && (
              <img src={imagePreview} alt="preview" className="mt-3 h-24 w-24 rounded-card object-contain" />
            )}
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}
          {success && <p className="text-sm text-success">{success}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-card bg-primary py-2 text-on-primary hover:bg-primary-hover disabled:opacity-50 text-label-lg min-h-11"
          >
            {submitting ? 'Đang tạo...' : 'Tạo sticker'}
          </button>
        </form>
      )}
    </main>
  );
}
