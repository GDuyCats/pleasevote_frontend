'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { PollOption } from '@/types/poll';
import { useAuth } from '@/context/AuthContext';
import { useAuthPrompt } from '@/context/AuthPromptContext';
import ReactionButton from '@/components/ReactionButton';
import ReactionSummary from '@/components/ReactionSummary';
import OptionComments from '@/components/OptionComments';

interface Props {
  option: PollOption;
  percent: number;
  disabled: boolean;
  pollAuthorId: number;
  pollId: number;
  onVote: (optionId: number) => void;
  onOptionUpdated: (optionId: number, updates: Partial<PollOption>) => void;
}

export default function PollOptionRow({
  option,
  percent,
  disabled,
  pollAuthorId,
  pollId,
  onVote,
  onOptionUpdated,
}: Props) {
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();
  const { openPrompt } = useAuthPrompt();

  function applyOptimisticReaction(newType: string | null) {
    const reactions = { ...(option.reactions || {}) } as any;
    const oldType = option.myReaction;

    if (oldType) reactions[oldType] = Math.max(0, (reactions[oldType] || 0) - 1);
    if (newType) reactions[newType] = (reactions[newType] || 0) + 1;

    onOptionUpdated(option.id, { reactions, myReaction: newType });
  }

  async function handleReact(type: string) {
    if (!user) {
      openPrompt();
      return;
    }
    applyOptimisticReaction(type);
    try {
      await api.post(`/polls/options/${option.id}/react`, { type });
    } catch {
      // leave optimistic state
    }
  }

  async function handleRemoveReact() {
    if (!user) return;
    applyOptimisticReaction(null);
    try {
      await api.delete(`/polls/options/${option.id}/react`);
    } catch {
      // no-op
    }
  }

  return (
    <div>
      <button
        onClick={() => onVote(option.id)}
        disabled={disabled}
        className="relative w-full overflow-hidden rounded-lg border border-gray-200 px-4 py-2.5 text-left transition hover:border-purple-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <div className="absolute inset-y-0 left-0 bg-purple-100 transition-all" style={{ width: `${percent}%` }} />
        <div className="relative flex items-center justify-between">
          <span className="text-sm font-medium text-gray-800">{option.label}</span>
          <span className="text-xs font-semibold text-gray-500">
            {option.voteCount} phiếu · {percent}%
          </span>
        </div>
      </button>

      <ReactionSummary reactions={option.reactions || ({} as any)} commentCount={option.commentCount || 0} />

      <div className="mt-1 flex items-center gap-4 pl-1 text-xs text-gray-400">
        <ReactionButton
          count={0}
          myReaction={option.myReaction || null}
          onReact={handleReact}
          onRemove={handleRemoveReact}
          size="sm"
        />
        <button onClick={() => setShowComments((v) => !v)} className="font-medium hover:underline">
          {showComments ? 'Ẩn bình luận' : 'Bình luận'}
        </button>
      </div>

      {showComments && <OptionComments optionId={option.id} pollId={pollId} pollAuthorId={pollAuthorId} />}
    </div>
  );
}