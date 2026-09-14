'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Comment } from '@/types/poll';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import CommentItem from '@/components/CommentItem';
import { useAuthPrompt } from '@/context/AuthPromptContext';
export default function OptionComments({
  optionId,
  pollId,
  pollAuthorId,
}: {
  optionId: number;
  pollId: number;
  pollAuthorId: number;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { openPrompt } = useAuthPrompt();
  const router = useRouter();

  async function fetchComments() {
    setLoading(true);
    try {
      const { data } = await api.get(`/comments/options/${optionId}`);
      setComments(data.data);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/comments/polls/${pollId}`, { content: text, poll_option_id: optionId });
      setText('');
      await fetchComments();
    } finally {
      setSubmitting(false);
    }
  }

  if (!loaded && !loading) {
    fetchComments();
  }

  return (
    <div className="mt-2 rounded-card bg-background p-3">
      <form onSubmit={handleSubmit} className="mb-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={user ? 'Bình luận về lựa chọn này...' : 'Đăng nhập để bình luận'}
          className="flex-1 rounded-full border border-border bg-surface px-3 py-1.5 text-control focus:border-accent focus:outline-none min-h-11 min-w-0"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-control bg-primary px-3 py-1.5 text-on-primary hover:bg-primary-hover disabled:opacity-50 text-label-lg min-h-11"
        >
          Gửi
        </button>
      </form>

      {loading ? (
        <p className="text-xs text-muted">Đang tải...</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted">Chưa có bình luận nào cho lựa chọn này.</p>
      ) : (
        <div className="divide-y divide-border">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} pollAuthorId={pollAuthorId} />
          ))}
        </div>
      )}
    </div>
  );
}
