'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Poll } from '@/types/poll';
import Navbar from '@/components/Navbar';
import PollCard from '@/components/PollCard';
import { usePollModal } from '@/context/PollModalContext';

export default function HomePage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { refreshKey } = usePollModal();

  async function fetchPolls(cursor?: number) {
    const params: Record<string, number> = { limit: 10 };
    if (cursor) params.cursor = cursor;

    const { data } = await api.get('/polls', { params });

    setPolls((prev) => (cursor ? [...prev, ...data.data] : data.data));
    setNextCursor(data.nextCursor);
  }

  useEffect(() => {
    setLoading(true);
    fetchPolls().finally(() => setLoading(false));
  }, [refreshKey]);

  async function handleLoadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    await fetchPolls(nextCursor);
    setLoadingMore(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-6">
        {loading ? (
          <p className="text-center text-gray-400">Đang tải...</p>
        ) : polls.length === 0 ? (
          <p className="text-center text-gray-400">Chưa có bình chọn nào. Hãy là người đầu tiên tạo!</p>
        ) : (
          <div className="space-y-4">
            {polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        )}

        {nextCursor && (
          <div className="mt-6 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="rounded-lg bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              {loadingMore ? 'Đang tải...' : 'Xem thêm'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}