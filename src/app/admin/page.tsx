'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
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
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="mx-auto max-w-4xl px-4 py-8">
          <h1 className="mb-1 text-xl font-bold text-gray-900">Bảng điều khiển</h1>
          <p className="mb-4 text-sm text-gray-500">Tổng quan hoạt động hệ thống</p>

          <AdminNav />

          {loading || !stats ? (
            <p className="text-center text-gray-400">Đang tải...</p>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 text-sm font-semibold text-gray-600">Người dùng</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="Tổng số" value={stats.users.total} />
                  <StatCard label="Mới hôm nay" value={stats.users.newToday} />
                  <StatCard label="Mới tuần này" value={stats.users.newThisWeek} />
                  <StatCard label="Bị khoá" value={stats.users.locked} />
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-sm font-semibold text-gray-600">Bình chọn</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="Tổng số" value={stats.polls.total} />
                  <StatCard label="Công khai" value={stats.polls.public} />
                  <StatCard label="Đã đóng" value={stats.polls.closed} />
                  <StatCard label="Tổng lượt vote" value={stats.engagement.totalVotes} />
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-sm font-semibold text-gray-600">Kiểm duyệt (cần xử lý)</h2>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Báo cáo chờ xử lý" value={stats.moderation.pendingReports} />
                  <StatCard label="Khiếu nại chờ xử lý" value={stats.moderation.pendingAppeals} />
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-sm font-semibold text-gray-600">Doanh thu</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                <h2 className="mb-2 text-sm font-semibold text-gray-600">Sticker Marketplace</h2>
                <div className="grid grid-cols-2 gap-3">
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