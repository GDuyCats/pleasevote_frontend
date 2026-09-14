'use client';

import { getErrorMessage } from '@/lib/i18n';
import { useLanguage } from '@/context/LanguageContext';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

import AdminGuard from '@/components/AdminGuard';
import AdminNav from '@/components/AdminNav';

interface AdminCoinPackage {
  id: number;
  name: string;
  coin_amount: number;
  price_cents: number;
  currency: string;
  is_active: boolean;
}

export default function AdminCoinPackagesPage() {
  const { translate, locale, formatNumber } = useLanguage();
  const [packages, setPackages] = useState<AdminCoinPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [coinAmount, setCoinAmount] = useState('');
  const [priceCents, setPriceCents] = useState('');
  const [currency, setCurrency] = useState('usd');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<'active' | 'all'>('active');
  // Editing state — only one package can be in "edit mode" at a time
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editCoinAmount, setEditCoinAmount] = useState('');
  const [editPriceCents, setEditPriceCents] = useState('');
  const [editCurrency, setEditCurrency] = useState('usd');
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  async function fetchPackages() {
    setLoading(true);
    try {
      const { data } = await api.get('/coin-packages/all');
      setPackages(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !coinAmount || !priceCents) {
      setError('Điền đầy đủ thông tin');
      return;
    }

    setCreating(true);
    try {
      await api.post('/coin-packages', {
        name,
        coin_amount: Number(coinAmount),
        price_cents: Number(priceCents),
        currency,
      });
      setName('');
      setCoinAmount('');
      setPriceCents('');
      await fetchPackages();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Tạo gói thất bại'));
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleActive(pkg: AdminCoinPackage) {
    if (pkg.is_active) {
      await api.delete(`/coin-packages/${pkg.id}`);
    } else {
      await api.put(`/coin-packages/${pkg.id}`, { is_active: true });
    }
    await fetchPackages();
  }

  function startEdit(pkg: AdminCoinPackage) {
    setEditingId(pkg.id);
    setEditName(pkg.name);
    setEditCoinAmount(String(pkg.coin_amount));
    setEditPriceCents(String(pkg.price_cents));
    setEditCurrency(pkg.currency);
    setEditError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError('');
  }

  async function handleSaveEdit(pkgId: number) {
    setEditError('');

    if (!editName.trim() || !editCoinAmount || !editPriceCents) {
      setEditError('Điền đầy đủ thông tin');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/coin-packages/${pkgId}`, {
        name: editName,
        coin_amount: Number(editCoinAmount),
        price_cents: Number(editPriceCents),
        currency: editCurrency,
      });
      setEditingId(null);
      await fetchPackages();
    } catch (err: unknown) {
      setEditError(getErrorMessage(err, 'Cập nhật thất bại'));
    } finally {
      setSaving(false);
    }
  }

  function formatPrice(cents: number, curr: string) {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: curr.toUpperCase() }).format(
      cents / 100
    );
  }

  const filteredPackages = filter === 'active' ? packages.filter((p) => p.is_active) : packages;
  const hiddenCount = packages.filter((p) => !p.is_active).length;
  return (
    <AdminGuard>
      <div className="bg-background">


        <main className="page-shell">
          <h1 className="mb-1 text-foreground text-page-title">{translate("Quản lý gói Coin")}</h1>
          <p className="mb-4 text-body-md text-muted">{translate("Chỉ Admin mới truy cập được trang này.")}</p>

          <AdminNav />

          {/* Create form */}
          <form onSubmit={handleCreate} className="ui-card mb-8">
            <h2 className="mb-3 text-foreground text-section-title">{translate("Tạo gói mới")}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label htmlFor="package-name" className="mb-1 block text-muted text-label-lg">{translate("Tên gói")}</label>
                <input
                  id="package-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={translate("Gói nhỏ")}
                  className="ui-input w-full"
                />
              </div>
              <div>
                <label htmlFor="package-amount" className="mb-1 block text-muted text-label-lg">{translate("Số coin")}</label>
                <input
                  id="package-amount"
                  type="number"
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  placeholder="100"
                  className="ui-input w-full"
                />
              </div>
              <div>
                <label htmlFor="package-price" className="mb-1 block text-muted text-label-lg">{translate("Giá (cent)")}</label>
                <input
                  id="package-price"
                  type="number"
                  value={priceCents}
                  onChange={(e) => setPriceCents(e.target.value)}
                  placeholder="200 = $2.00"
                  className="ui-input w-full"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="package-currency" className="mb-1 block text-muted text-label-lg">{translate("Loại tiền")}</label>
                <select
                  id="package-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="ui-input w-full"
                >
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                </select>
              </div>
            </div>

            {error && <p role="alert" className="ui-feedback bg-danger-soft mt-2 text-danger">{translate(error)}</p>}

            <button
              type="submit"
              disabled={creating}
              className="ui-button ui-button-primary mt-4 w-full disabled:opacity-50"
            >
              {creating ? translate("Đang tạo...") : translate("Tạo gói")}
            </button>
          </form>

          {/* Package list */}
          {/* Package list */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-foreground text-section-title">{translate("Danh sách gói")}</h2>
            <div role="group" aria-label={translate("Lọc gói coin")} className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('active')}
                aria-pressed={filter === 'active'}
                className="ui-filter"
              >
                {translate("Đang bán")} </button>
              <button
                onClick={() => setFilter('all')}
                aria-pressed={filter === 'all'}
                className="ui-filter"
              >
                {translate("Tất cả")} {hiddenCount > 0 && translate('hiddenPackages', { count: hiddenCount })}
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-muted">{translate("Đang tải...")}</p>
          ) : packages.length === 0 ? (
            <p className="text-center text-muted">{translate("Chưa có gói nào.")}</p>
          ) : (
            <div className="space-y-2">
              {packages.map((pkg) =>
                editingId === pkg.id ? (
                  // Edit mode
                  <div key={pkg.id} className="ui-card border-accent">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="sm:col-span-2">
                        <label htmlFor="edit-package-name" className="mb-1 block text-muted text-label-lg">{translate("Tên gói")}</label>
                        <input
                          id="edit-package-name"
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="ui-input w-full"
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-package-amount" className="mb-1 block text-muted text-label-lg">{translate("Số coin")}</label>
                        <input
                          id="edit-package-amount"
                          type="number"
                          value={editCoinAmount}
                          onChange={(e) => setEditCoinAmount(e.target.value)}
                          className="ui-input w-full"
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-package-price" className="mb-1 block text-muted text-label-lg">{translate("Giá (cent)")}</label>
                        <input
                          id="edit-package-price"
                          type="number"
                          value={editPriceCents}
                          onChange={(e) => setEditPriceCents(e.target.value)}
                          className="ui-input w-full"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="edit-package-currency" className="mb-1 block text-muted text-label-lg">{translate("Loại tiền")}</label>
                        <select
                          id="edit-package-currency"
                          value={editCurrency}
                          onChange={(e) => setEditCurrency(e.target.value)}
                          className="ui-input w-full"
                        >
                          <option value="usd">USD</option>
                          <option value="eur">EUR</option>
                        </select>
                      </div>
                    </div>

                    {editError && <p role="alert" className="ui-feedback bg-danger-soft mt-2 text-danger">{translate(editError)}</p>}

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(pkg.id)}
                        disabled={saving}
                        className="ui-button ui-button-primary flex-1 disabled:opacity-50"
                      >
                        {saving ? translate("Đang lưu...") : translate("Lưu")}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="ui-button ui-button-secondary flex-1 text-foreground"
                      >
                        {translate("Huỷ")} </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div
                    key={pkg.id}
                    className="ui-card flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-body-md font-semibold text-foreground">
                        🪙 {formatNumber(pkg.coin_amount)} — {pkg.name}
                      </p>
                      <p className="text-metadata text-muted">
                        {formatPrice(pkg.price_cents, pkg.currency)} ·{' '}
                        <span className={pkg.is_active ? 'text-success' : 'text-muted'}>
                          {pkg.is_active ? translate("Đang bán") : translate("Đã ẩn")}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(pkg)}
                        className="ui-button ui-button-ghost bg-accent-soft text-accent hover:bg-accent-muted"
                      >
                        {translate("Sửa")} </button>
                      <button
                        onClick={() => handleToggleActive(pkg)}
                        className={`min-h-11 rounded-control px-3 py-1.5 text-label-lg ${pkg.is_active
                          ? 'bg-danger-soft text-danger hover:bg-danger-muted'
                          : 'bg-success-soft text-success hover:bg-success-muted'
                          }`}
                      >
                        {pkg.is_active ? translate("Ẩn gói") : translate("Mở bán lại")}
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  );
}
