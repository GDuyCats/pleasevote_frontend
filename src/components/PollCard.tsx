'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Poll } from '@/types/poll';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ReactionBar from '@/components/ReactionBar';
import { useAuthPrompt } from '@/context/AuthPromptContext';
import PollOptionRow from '@/components/PollOptionRow';
export default function PollCard({ poll: initialPoll }: { poll: Poll }) {
  const [poll, setPoll] = useState(initialPoll);
  const [voting, setVoting] = useState<number | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const { openPrompt } = useAuthPrompt();
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.voteCount, 0);

  async function handleVote(optionId: number, e: React.MouseEvent) {
    e.stopPropagation();

    if (!user) {
      openPrompt();
      return;
    }

    setVoting(optionId);
    try {
      await api.post(`/polls/${poll.id}/vote`, { poll_option_id: optionId });
      const { data } = await api.get(`/polls/${poll.id}`);
      setPoll(data);
    } catch (err) {
      console.error('Vote failed', err);
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
  function handleOptionUpdated(optionId: number, updates: Partial<any>) {
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
    <div
      onClick={goToDetail}
      className="cursor-pointer rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:shadow-md"
    >
      {poll.background_image && (
        <div
          className="h-40 w-full rounded-t-2xl bg-cover bg-center"
          style={{ backgroundImage: `url(${poll.background_image})` }}
        />
      )}

      <div className="p-5">
        <div className="mb-3 flex items-center gap-2">
          {poll.author.avatar_url ? (
            <img src={poll.author.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
              {poll.author.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium text-gray-700">{poll.author.name}</span>
          {poll.isClosed && (
            <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              Đã đóng
            </span>
          )}
        </div>

        <h2 className="mb-4 text-lg font-semibold text-gray-900">{poll.question}</h2>

        <div onClick={(e) => e.stopPropagation()} className="space-y-3">
          {poll.options.map((option) => {
            const percent = totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0;
            return (
              <PollOptionRow
                key={option.id}
                option={option}
                percent={percent}
                disabled={poll.isClosed || voting === option.id}
                pollAuthorId={poll.author.id}
                pollId={poll.id}
                onVote={(optionId) => handleVote(optionId, { stopPropagation: () => { } } as any)}
                onOptionUpdated={handleOptionUpdated}
              />
            );
          })}
        </div>
        <p className="mt-3 text-xs text-gray-400">{totalVotes} lượt bình chọn</p>

        <div onClick={(e) => e.stopPropagation()}>
          <ReactionBar
            reactions={poll.reactions}
            commentCount={poll.totalCommentCount ?? 0}
            myReaction={poll.myReaction}
            onReact={handleReact}
            onRemove={handleRemoveReact}
            onCommentClick={goToDetail}
          />
        </div>
      </div>
    </div>
  );
}