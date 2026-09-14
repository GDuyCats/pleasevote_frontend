'use client';

import type { AdminStats as Stats } from '@/types/admin';
import { useLanguage } from '@/context/LanguageContext';
import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';

import AdminGuard from '@/components/AdminGuard';
import AdminNav from '@/components/AdminNav';

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  const { formatNumber } = useLanguage();
  return (
    <div className="ui-card min-w-0">
      <p className="text-metadata text-muted">{label}</p>
      <p className="mt-1 text-metric tabular-nums [overflow-wrap:anywhere] text-foreground">{typeof value === 'number' ? formatNumber(value) : value}</p>
      {sub && <p className="mt-0.5 text-metadata text-muted">{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { translate, locale } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      const data = await adminService.getStats();
      setStats(data);
    } finally {
      setLoading(false);
    }
  }

  function formatMoney(cents: number, currency: string) {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency.toUpperCase() }).format(
      cents / 100
    );
  }

  return (
    <AdminGuard>
      <div className="bg-background">

        <main className="page-shell">
          <h1 className="mb-1 text-foreground text-page-title">{translate("Bảng điều khiển")}</h1>
          <p className="mb-4 text-body-md text-muted">{translate("Tổng quan hoạt động hệ thống")}</p>

          <AdminNav />

          {loading || !stats ? (
            <p className="text-center text-muted">{translate("Đang tải...")}</p>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 text-muted text-section-title">{translate("Người dùng")}</h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-3">
                  <StatCard label={translate("Tổng số")} value={stats.users.total} />
                  <StatCard label={translate("Mới hôm nay")} value={stats.users.newToday} />
                  <StatCard label={translate("Mới tuần này")} value={stats.users.newThisWeek} />
                  <StatCard label={translate("Bị khoá")} value={stats.users.locked} />
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-muted text-section-title">{translate("Bình chọn")}</h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-3">
                  <StatCard label={translate("Tổng số")} value={stats.polls.total} />
                  <StatCard label={translate("Công khai")} value={stats.polls.public} />
                  <StatCard label={translate("Đã đóng")} value={stats.polls.closed} />
                  <StatCard label={translate("Tổng lượt vote")} value={stats.engagement.totalVotes} />
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-muted text-section-title">{translate("Kiểm duyệt (cần xử lý)")}</h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-3">
                  <StatCard label={translate("Báo cáo chờ xử lý")} value={stats.moderation.pendingReports} />
                  <StatCard label={translate("Khiếu nại chờ xử lý")} value={stats.moderation.pendingAppeals} />
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-muted text-section-title">{translate("Doanh thu")}</h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-3">
                  {stats.revenue.byCurrency.map((r) => (
                    <StatCard
                      key={r.currency}
                      label={translate('revenueCurrency', { currency: r.currency.toUpperCase() })}
                      value={formatMoney(r.totalCents, r.currency)}
                      sub={translate('transactions', { count: r.transactionCount })}
                    />
                  ))}
                  <StatCard label={translate("Coin đang lưu hành")} value={translate('coinPrice', { count: stats.revenue.coinsInCirculation })} />
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-muted text-section-title">{translate("Sticker Marketplace")}</h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-3">
                  <StatCard label={translate("Tổng sticker")} value={stats.marketplace.totalStickers} />
                  <StatCard label={translate("Lượt mua")} value={stats.marketplace.totalStickerPurchases} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  );
}
