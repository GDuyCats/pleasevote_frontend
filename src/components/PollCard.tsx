'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Poll, PollOption } from '@/types/poll';
import AppIcon from '@/components/AppIcon';
import { formatRelativeTime } from '@/lib/formatTime';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ReactionBar from '@/components/ReactionBar';
import { useAuthPrompt } from '@/context/AuthPromptContext';
import PollOptionRow from '@/components/PollOptionRow';
export default function PollCard({ poll: initialPoll }: { poll: Poll }) {
  const [poll, setPoll] = useState(initialPoll);
  const [voting, setVoting] = useState<number | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const { openPrompt } = useAuthPrompt();
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.voteCount, 0);

  async function handleVote(optionId: number) {
    if (!user) {
      openPrompt();
      return;
    }

    setVoting(optionId);
    setVoteError(null);
    try {
      await api.post(`/polls/${poll.id}/vote`, { poll_option_id: optionId });
      const { data } = await api.get(`/polls/${poll.id}`);
      setPoll(data);
    } catch (err) {
      console.error('Vote failed', err);
      setVoteError('Chưa thể gửi bình chọn. Bạn thử lại nhé.');
    } finally {
      setVoting(null);
    }
  }

  function applyOptimisticReaction(newType: string | null) {
    setPoll((prev) => {
      const updatedReactions = { ...prev.reactions };
      const oldType = prev.myReaction;

      if (oldType) {
        updatedReactions[oldType as keyof typeof updatedReactions] = Math.max(
          0,
          updatedReactions[oldType as keyof typeof updatedReactions] - 1
        );
      }
      if (newType) {
        updatedReactions[newType as keyof typeof updatedReactions] =
          (updatedReactions[newType as keyof typeof updatedReactions] || 0) + 1;
      }

      return { ...prev, reactions: updatedReactions, myReaction: newType };
    });
  }
  function handleOptionUpdated(optionId: number, updates: Partial<PollOption>) {
    setPoll((prev) => ({
      ...prev,
      options: prev.options.map((o) => (o.id === optionId ? { ...o, ...updates } : o)),
    }));
  }
  async function handleReact(type: string) {
    if (!user) {
      openPrompt();
      return;
    }

    applyOptimisticReaction(type);

    try {
      await api.post(`/polls/${poll.id}/react`, { type });
    } catch {
      const { data } = await api.get(`/polls/${poll.id}`);
      setPoll(data);
    }
  }

  async function handleRemoveReact() {
    if (!user) {
      openPrompt();
      return;
    }

    applyOptimisticReaction(null);

    try {
      await api.delete(`/polls/${poll.id}/react`);
    } catch {
      const { data } = await api.get(`/polls/${poll.id}`);
      setPoll(data);
    }
  }

  function goToDetail() {
    router.push(`/polls/${poll.id}`);
  }

  return (
    <article aria-labelledby={'poll-title-' + poll.id} className="overflow-hidden rounded-card border border-border bg-surface">
      <div className="p-card">
        <div className="mb-4 flex flex-wrap items-start gap-3">
          {poll.author.avatar_url ? (
            <Image src={poll.author.avatar_url} alt="" width={40} height={40} unoptimized className="h-10 w-10 shrink-0 rounded-full border border-border object-cover" />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">{poll.author.name.charAt(0).toUpperCase()}</div>
          )}
          <div className="min-w-0 flex-1 basis-24">
            <p className="truncate text-author text-secondary">{poll.author.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-metadata text-muted">
              <time dateTime={poll.created_at}>{formatRelativeTime(poll.created_at)}</time>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1"><AppIcon name={poll.visibility === 'public' ? 'globe' : 'lock'} className="h-3 w-3" />{poll.visibility === 'public' ? 'Công khai' : poll.visibility === 'private' ? 'Riêng tư' : 'Nhóm'}</span>
            </div>
          </div>
          <span className={['shrink-0 rounded-full px-2.5 py-1 text-label-sm font-medium', poll.isClosed ? 'bg-surface-muted text-muted' : 'bg-accent-soft text-accent'].join(' ')}>{poll.isClosed ? 'Đã đóng' : 'Đang mở'}</span>
        </div>
        <h2 id={'poll-title-' + poll.id} className="text-secondary [overflow-wrap:anywhere] text-card-title">
          <Link href={'/polls/' + poll.id} className="rounded-sm hover:text-accent">{poll.question}</Link>
        </h2>
        {poll.background_image && <Link href={'/polls/' + poll.id} aria-label={'Xem bình chọn: ' + poll.question} className="mt-4 block overflow-hidden rounded-panel"><Image src={poll.background_image} alt="" width={1200} height={640} unoptimized className="aspect-[16/9] h-auto w-full object-cover" /></Link>}
        <p className="mb-4 mt-2 text-xs text-muted">{poll.isClosed ? 'Bình chọn đã kết thúc. Bạn vẫn có thể tham gia thảo luận.' : poll.type === 'multiple_choice' ? 'Bạn có thể chọn nhiều phương án.' : 'Chọn một phương án để chia sẻ ý kiến của bạn.'}</p>
        <div className="space-y-4" aria-busy={voting !== null}>
          {poll.options.map((option) => (
            <PollOptionRow
              key={option.id}
              option={option}
              percent={totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0}
              disabled={poll.isClosed || voting !== null}
              pollAuthorId={poll.author.id}
              pollId={poll.id}
              onVote={handleVote}
              onOptionUpdated={handleOptionUpdated}
            />
          ))}
        </div>
        {voteError && <p role="alert" className="mt-3 text-sm text-danger">{voteError}</p>}
        <div className="mb-3 mt-5 flex items-center gap-1.5 text-xs text-muted"><AppIcon name="poll" className="h-3.5 w-3.5" /><span>{totalVotes.toLocaleString('vi-VN')} lượt bình chọn</span>{voting !== null && <span role="status" className="ml-auto">Đang gửi…</span>}</div>
        <ReactionBar reactions={poll.reactions} commentCount={poll.totalCommentCount ?? 0} myReaction={poll.myReaction} onReact={handleReact} onRemove={handleRemoveReact} onCommentClick={goToDetail} />
      </div>
    </article>
  );
}
