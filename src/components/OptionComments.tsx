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
    <div className="mt-2 rounded-lg bg-gray-50 p-3">
      <form onSubmit={handleSubmit} className="mb-3 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={user ? 'Bình luận về lựa chọn này...' : 'Đăng nhập để bình luận'}
          className="flex-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-purple-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-purple-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
        >
          Gửi
        </button>
      </form>

      {loading ? (
        <p className="text-xs text-gray-400">Đang tải...</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-400">Chưa có bình luận nào cho lựa chọn này.</p>
      ) : (
        <div className="divide-y divide-gray-200">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} pollAuthorId={pollAuthorId} />
          ))}
        </div>
      )}
    </div>
  );
}