'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Poll } from '@/types/poll';

import PollCard from '@/components/PollCard';
import AppIcon from '@/components/AppIcon';
import { usePollModal } from '@/context/PollModalContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useCreatePoll } from '@/hooks/useCreatePoll';

type FeedFilter = 'all' | 'open' | 'closed';
const filters: { value: FeedFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'open', label: 'Đang mở' },
  { value: 'closed', label: 'Đã đóng' },
];

function FeedSkeleton() {
  return (
    <div role="status" aria-label="Đang tải bảng tin" className="space-y-4">
      {[0, 1].map((index) => (
        <div key={index} aria-hidden="true" className="rounded-card border border-border bg-surface p-card">
          <div className="mb-6 flex gap-3"><div className="h-10 w-10 rounded-full bg-surface-muted" /><div className="space-y-2 py-1"><div className="h-3 w-28 rounded bg-surface-muted" /><div className="h-2 w-20 rounded bg-surface-muted" /></div></div>
          <div className="mb-5 h-4 w-3/4 rounded bg-surface-muted" />
          <div className="space-y-3"><div className="h-12 rounded-card bg-surface-muted" /><div className="h-12 rounded-card bg-surface-muted" /></div>
        </div>
      ))}
    </div>
  );
}

function Feed() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [requestKey, setRequestKey] = useState(0);
  const [filter, setFilter] = useState<FeedFilter>('all');
  const { user, loading: authLoading } = useAuth();
  const { resolvedTheme } = useTheme();
  const createPoll = useCreatePoll();

  useEffect(() => {
    let cancelled = false;
    api.get('/polls', { params: { limit: 10 } })
      .then(({ data }) => {
        if (cancelled) return;
        setPolls(data.data);
        setNextCursor(data.nextCursor);
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [requestKey]);

  function retry() {
    setError(false);
    setLoading(true);
    setRequestKey((previous) => previous + 1);
  }

  async function handleLoadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    setLoadMoreError(false);
    try {
      const { data } = await api.get('/polls', { params: { limit: 10, cursor: nextCursor } });
      setPolls((previous) => [...previous, ...data.data]);
      setNextCursor(data.nextCursor);
    } catch {
      setLoadMoreError(true);
    } finally {
      setLoadingMore(false);
    }
  }

  const visiblePolls = polls.filter((poll) => filter === 'all' || (filter === 'closed' ? poll.isClosed : !poll.isClosed));

  return (
    <main className="page-shell grid grid-cols-1 items-start gap-gutter wide:grid-cols-[minmax(0,1fr)_var(--spacing-discovery)]">
      <div className="mx-auto w-full min-w-0 max-w-feed md:max-w-none">
        <div className="mb-6">
          <p className="mb-2 text-label-sm uppercase text-muted">Góc nhìn của cộng đồng</p>
          <h1 className="text-secondary text-page-title">Hôm nay, bạn chọn gì?</h1>
          <p className="mt-2 text-body-md text-muted">Chia sẻ một câu hỏi. Khám phá những góc nhìn khác nhau.</p>
        </div>

        <section aria-label="Tạo bình chọn" className="mb-6 rounded-card border border-border bg-surface p-card">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent" aria-hidden="true">
              {user ? user.name.charAt(0).toUpperCase() : <AppIcon name="user" />}
            </span>
            <button type="button" onClick={createPoll} disabled={authLoading} className="min-h-11 min-w-0 flex-1 rounded-card bg-background px-4 py-3 text-left text-sm text-muted hover:bg-surface-muted disabled:opacity-50">Bạn đang phân vân điều gì?</button>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <span className="flex items-center gap-2 text-xs text-muted"><AppIcon name="poll" className="h-4 w-4 text-accent" />Một câu hỏi, nhiều góc nhìn</span>
            <button type="button" onClick={createPoll} disabled={authLoading} className="min-h-11 shrink-0 rounded-card px-3 py-2 text-xs font-semibold text-accent hover:bg-accent-soft disabled:opacity-50">Tạo bình chọn <span aria-hidden="true">↗</span></button>
          </div>
        </section>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-secondary text-section-title">Bảng tin cộng đồng</h2>
          <div role="group" aria-label="Lọc bình chọn đã tải" className="flex max-w-full flex-wrap gap-1 rounded-control border border-border bg-surface p-1">
            {filters.map((item) => (
              <button type="button" key={item.value} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)} className={['min-h-11 rounded-control px-3 py-2 text-label-md', filter === item.value ? 'bg-secondary text-surface' : 'text-muted hover:bg-surface-muted hover:text-secondary'].join(' ')}>{item.label}</button>
            ))}
          </div>
        </div>
        {filter !== 'all' && <p className="mb-4 text-xs leading-5 text-muted">Đang lọc trong các bình chọn đã tải.{nextCursor ? ' Chọn “Xem thêm” để tìm thêm nội dung.' : ''}</p>}

        {loading ? <FeedSkeleton /> : error ? (
          <div role="alert" className="rounded-card border border-border bg-surface px-6 py-10 text-center">
            <AppIcon name="globe" className="mx-auto mb-4 h-8 w-8 text-muted" />
            <h3 className="text-section-title">Chưa thể tải bảng tin</h3>
            <p className="mb-5 mt-2 text-sm leading-6 text-muted">Kết nối có thể đang gián đoạn. Bạn thử lại nhé.</p>
            <button type="button" onClick={retry} className="min-h-11 rounded-card border border-border-strong px-5 py-2.5 text-sm font-semibold hover:bg-surface-muted">Thử lại</button>
          </div>
        ) : visiblePolls.length === 0 ? (
          <div className="rounded-card border border-dashed border-border-strong bg-surface px-6 py-10 text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-card bg-accent-soft text-accent"><AppIcon name="poll" className="h-6 w-6" /></span>
            <h3 className="text-section-title">{polls.length === 0 ? 'Bắt đầu cuộc trò chuyện đầu tiên' : 'Chưa có bình chọn phù hợp'}</h3>
            <p className="mx-auto mb-5 mt-2 max-w-xs text-sm leading-6 text-muted">{polls.length === 0 ? 'Một câu hỏi nhỏ cũng có thể mở ra những góc nhìn thú vị.' : 'Thử xem tất cả bình chọn hoặc tải thêm nội dung.'}</p>
            <button type="button" onClick={polls.length === 0 ? createPoll : () => setFilter('all')} disabled={polls.length === 0 && authLoading} className="rounded-card bg-primary px-5 py-2.5 text-on-primary hover:bg-primary-hover disabled:opacity-50 text-label-lg min-h-11">{polls.length === 0 ? 'Tạo bình chọn đầu tiên' : 'Xem tất cả'}</button>
          </div>
        ) : (
          <div className="space-y-4">{visiblePolls.map((poll) => <PollCard key={poll.id} poll={poll} />)}</div>
        )}

        {!loading && !error && nextCursor && (
          <div className="mt-5 text-center">
            {loadMoreError && <p role="alert" className="mb-3 text-sm text-danger">Chưa tải được nội dung tiếp theo. Bạn có thể thử lại.</p>}
            <button type="button" onClick={handleLoadMore} disabled={loadingMore} className="min-h-11 w-full rounded-card border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground hover:bg-surface-muted disabled:opacity-50">{loadingMore ? 'Đang tải…' : loadMoreError ? 'Thử tải thêm' : 'Xem thêm bình chọn'}</button>
          </div>
        )}
        {!loading && !error && polls.length > 0 && !nextCursor && <p className="py-8 text-center text-xs text-muted">Bạn đã xem hết các bình chọn hiện có.</p>}
      </div>

      <aside aria-label="Góc cộng đồng" className="sticky top-[calc(var(--app-header-height)+var(--spacing-section))] hidden max-h-[calc(100dvh-var(--app-header-height)-2*var(--spacing-section))] min-w-0 overflow-y-auto overscroll-contain space-y-gutter wide:block">
        <section className="rounded-card border border-border bg-surface p-card">
          <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-card bg-accent-soft text-accent"><AppIcon name="message" /></span>
          <h2 className="tracking-tight text-section-title">Chọn cùng nhau,<br />hiểu nhau hơn.</h2>
          <p className="mt-3 text-sm leading-6 text-muted">Từ chuyện ăn gì hôm nay đến những quyết định quan trọng. Mọi câu hỏi đều có chỗ ở đây.</p>
          <div className="mt-5 space-y-3 border-t border-border pt-4">
            {['Đặt câu hỏi thật rõ ràng', 'Lắng nghe những ý kiến khác', 'Giữ cuộc trò chuyện tử tế'].map((tip) => <p key={tip} className="flex items-start gap-2 text-xs leading-5 text-muted"><AppIcon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{tip}</p>)}
          </div>
        </section>
        <Link href="/stickers" className="group flex items-center gap-3 rounded-card border border-border bg-surface p-card hover:border-border-strong">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-surface-muted text-muted"><AppIcon name="sticker" /></span>
          <span className="flex-1"><span className="block text-sm font-semibold">Nói bằng sticker</span><span className="mt-1 block text-xs text-muted">Thêm chút cá tính cho bạn</span></span>
          <AppIcon name="arrow" className="h-4 w-4 text-muted group-hover:text-accent" />
        </Link>
        <Link href="/settings" className="flex items-center gap-3 rounded-card px-2 py-3 text-muted hover:text-foreground">
          <AppIcon name={resolvedTheme === 'dark' ? 'moon' : 'sun'} />
          <span className="flex-1 text-xs">Giao diện {resolvedTheme === 'dark' ? 'tối' : 'sáng'}</span><span className="text-xs font-medium text-accent">Tùy chỉnh</span>
        </Link>
        <p className="px-2 text-xs leading-5 text-muted">PleaseVote · Mỗi ý kiến đều có giá trị.</p>
      </aside>
    </main>
  );
}

export default function HomePage() {
  const { refreshKey } = usePollModal();
  return <><Feed key={refreshKey} /></>;
}
