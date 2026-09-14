'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

import AdminGuard from '@/components/AdminGuard';
import AdminNav from '@/components/AdminNav';

interface Stats {
  users: { total: number; admins: number; staff: number; verified: number; locked: number; newToday: number; newThisWeek: number };
  polls: { total: number; public: number; private: number; closed: number };
  engagement: { totalVotes: number; totalComments: number; totalReactions: number };
  moderation: { pendingReports: number; pendingAppeals: number };
  revenue: { byCurrency: { currency: string; totalCents: number; transactionCount: number }[]; coinsInCirculation: number };
  marketplace: { totalStickers: number; totalStickerPurchases: number };
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="min-w-0 rounded-card bg-surface p-card ring-1 ring-border">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-metric tabular-nums [overflow-wrap:anywhere] text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } finally {
      setLoading(false);
    }
  }

  function formatMoney(cents: number, currency: string) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(
      cents / 100
    );
  }

  return (
    <AdminGuard>
      <div className="bg-background">


        <main className="page-shell max-w-4xl">
          <h1 className="mb-1 text-foreground text-page-title">Bảng điều khiển</h1>
          <p className="mb-4 text-sm text-muted">Tổng quan hoạt động hệ thống</p>

          <AdminNav />

          {loading || !stats ? (
            <p className="text-center text-muted">Đang tải...</p>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 text-muted text-section-title">Người dùng</h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-3">
                  <StatCard label="Tổng số" value={stats.users.total} />
                  <StatCard label="Mới hôm nay" value={stats.users.newToday} />
                  <StatCard label="Mới tuần này" value={stats.users.newThisWeek} />
                  <StatCard label="Bị khoá" value={stats.users.locked} />
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-muted text-section-title">Bình chọn</h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-3">
                  <StatCard label="Tổng số" value={stats.polls.total} />
                  <StatCard label="Công khai" value={stats.polls.public} />
                  <StatCard label="Đã đóng" value={stats.polls.closed} />
                  <StatCard label="Tổng lượt vote" value={stats.engagement.totalVotes} />
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-muted text-section-title">Kiểm duyệt (cần xử lý)</h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-3">
                  <StatCard label="Báo cáo chờ xử lý" value={stats.moderation.pendingReports} />
                  <StatCard label="Khiếu nại chờ xử lý" value={stats.moderation.pendingAppeals} />
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-muted text-section-title">Doanh thu</h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-3">
                  {stats.revenue.byCurrency.map((r) => (
                    <StatCard
                      key={r.currency}
                      label={`Doanh thu (${r.currency.toUpperCase()})`}
                      value={formatMoney(r.totalCents, r.currency)}
                      sub={`${r.transactionCount} giao dịch`}
                    />
                  ))}
                  <StatCard label="Coin đang lưu hành" value={`🪙 ${stats.revenue.coinsInCirculation}`} />
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-muted text-section-title">Sticker Marketplace</h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-3">
                  <StatCard label="Tổng sticker" value={stats.marketplace.totalStickers} />
                  <StatCard label="Lượt mua" value={stats.marketplace.totalStickerPurchases} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  );
}
