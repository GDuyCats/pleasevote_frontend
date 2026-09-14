'use client';

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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Tạo gói thất bại');
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
    } catch (err: any) {
      setEditError(err.response?.data?.error || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  }

  function formatPrice(cents: number, curr: string) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr.toUpperCase() }).format(
      cents / 100
    );
  }

  const filteredPackages = filter === 'active' ? packages.filter((p) => p.is_active) : packages;
  const hiddenCount = packages.filter((p) => !p.is_active).length;
  return (
    <AdminGuard>
      <div className="bg-background">


        <main className="page-shell max-w-2xl">
          <h1 className="mb-1 text-foreground text-page-title">Quản lý gói Coin</h1>
          <p className="mb-4 text-sm text-muted">Chỉ Admin mới truy cập được trang này.</p>

          <AdminNav />

          {/* Create form */}
          <form onSubmit={handleCreate} className="mb-8 rounded-card bg-surface p-card ring-1 ring-border">
            <h2 className="mb-3 text-foreground text-section-title">Tạo gói mới</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted">Tên gói</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Gói nhỏ"
                  className="w-full rounded-card border border-border-strong px-3 py-2 text-control focus:border-accent focus:outline-none min-h-11"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Số coin</label>
                <input
                  type="number"
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  placeholder="100"
                  className="w-full rounded-card border border-border-strong px-3 py-2 text-control focus:border-accent focus:outline-none min-h-11"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Giá (cent)</label>
                <input
                  type="number"
                  value={priceCents}
                  onChange={(e) => setPriceCents(e.target.value)}
                  placeholder="200 = $2.00"
                  className="w-full rounded-card border border-border-strong px-3 py-2 text-control focus:border-accent focus:outline-none min-h-11"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted">Loại tiền</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-card border border-border-strong px-3 py-2 text-control focus:border-accent focus:outline-none min-h-11"
                >
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                </select>
              </div>
            </div>

            {error && <p className="mt-2 text-sm text-danger">{error}</p>}

            <button
              type="submit"
              disabled={creating}
              className="mt-4 w-full rounded-card bg-primary py-2 text-on-primary hover:bg-primary-hover disabled:opacity-50 text-label-lg min-h-11"
            >
              {creating ? 'Đang tạo...' : 'Tạo gói'}
            </button>
          </form>

          {/* Package list */}
          {/* Package list */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-foreground text-section-title">Danh sách gói</h2>
            <div className="flex gap-1 rounded-card bg-surface-muted p-1">
              <button
                onClick={() => setFilter('active')}
                className={`min-h-11 rounded-card px-3 py-1 text-xs font-medium ${filter === 'active' ? 'bg-surface text-accent ring-1 ring-border' : 'text-muted'
                  }`}
              >
                Đang bán
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`min-h-11 rounded-card px-3 py-1 text-xs font-medium ${filter === 'all' ? 'bg-surface text-accent ring-1 ring-border' : 'text-muted'
                  }`}
              >
                Tất cả {hiddenCount > 0 && `(+${hiddenCount} đã ẩn)`}
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-muted">Đang tải...</p>
          ) : packages.length === 0 ? (
            <p className="text-center text-muted">Chưa có gói nào.</p>
          ) : (
            <div className="space-y-2">
              {packages.map((pkg) =>
                editingId === pkg.id ? (
                  // Edit mode
                  <div key={pkg.id} className="rounded-card bg-surface p-4 ring-1 ring-accent-muted">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-medium text-muted">Tên gói</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded-card border border-border-strong px-3 py-1.5 text-control focus:border-accent focus:outline-none min-h-11"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted">Số coin</label>
                        <input
                          type="number"
                          value={editCoinAmount}
                          onChange={(e) => setEditCoinAmount(e.target.value)}
                          className="w-full rounded-card border border-border-strong px-3 py-1.5 text-control focus:border-accent focus:outline-none min-h-11"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted">Giá (cent)</label>
                        <input
                          type="number"
                          value={editPriceCents}
                          onChange={(e) => setEditPriceCents(e.target.value)}
                          className="w-full rounded-card border border-border-strong px-3 py-1.5 text-control focus:border-accent focus:outline-none min-h-11"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-medium text-muted">Loại tiền</label>
                        <select
                          value={editCurrency}
                          onChange={(e) => setEditCurrency(e.target.value)}
                          className="w-full rounded-card border border-border-strong px-3 py-1.5 text-control focus:border-accent focus:outline-none min-h-11"
                        >
                          <option value="usd">USD</option>
                          <option value="eur">EUR</option>
                        </select>
                      </div>
                    </div>

                    {editError && <p className="mt-2 text-xs text-danger">{editError}</p>}

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(pkg.id)}
                        disabled={saving}
                        className="flex-1 rounded-card bg-primary py-1.5 text-on-primary hover:bg-primary-hover disabled:opacity-50 text-label-lg min-h-11"
                      >
                        {saving ? 'Đang lưu...' : 'Lưu'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="min-h-11 flex-1 rounded-card bg-surface-muted py-1.5 text-xs font-semibold text-foreground hover:bg-surface-hover"
                      >
                        Huỷ
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div
                    key={pkg.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-surface p-4 ring-1 ring-border"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        🪙 {pkg.coin_amount} — {pkg.name}
                      </p>
                      <p className="text-xs text-muted">
                        {formatPrice(pkg.price_cents, pkg.currency)} ·{' '}
                        <span className={pkg.is_active ? 'text-success' : 'text-muted'}>
                          {pkg.is_active ? 'Đang bán' : 'Đã ẩn'}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(pkg)}
                        className="min-h-11 rounded-card bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent-muted"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleToggleActive(pkg)}
                        className={`min-h-11 rounded-card px-3 py-1.5 text-xs font-semibold ${pkg.is_active
                          ? 'bg-danger-soft text-danger hover:bg-danger-muted'
                          : 'bg-success-soft text-success hover:bg-success-muted'
                          }`}
                      >
                        {pkg.is_active ? 'Ẩn gói' : 'Mở bán lại'}
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
