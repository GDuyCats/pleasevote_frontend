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
        type="button"
        onClick={() => onVote(option.id)}
        disabled={disabled}
        className="min-h-11 relative w-full overflow-hidden rounded-card border border-border bg-background px-4 py-3 text-left transition-colors enabled:hover:border-accent disabled:cursor-not-allowed"
      >
        <div aria-hidden="true" className="absolute inset-y-0 left-0 bg-accent-muted transition-[width] motion-reduce:transition-none" style={{ width: `${percent}%` }} />
        <div className="relative flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <span className="min-w-0 flex-1 basis-28">
            <span className="block text-body-lg text-foreground [overflow-wrap:anywhere]">{option.label}</span>
            {option.description && <span className="mt-1 block text-xs leading-5 break-words text-muted">{option.description}</span>}
          </span>
          <span className="ml-auto max-w-full text-right [overflow-wrap:anywhere]">
            <span className="block text-sm font-semibold tabular-nums text-foreground">{percent}%</span>
            <span className="mt-0.5 block text-label-sm tabular-nums text-muted">{option.voteCount} phiếu</span>
          </span>
        </div>
      </button>

      <ReactionSummary reactions={option.reactions || ({} as any)} commentCount={option.commentCount || 0} />

      <div className="mt-1 flex min-h-8 items-center gap-4 px-1 text-xs text-muted">
        <ReactionButton
          count={0}
          myReaction={option.myReaction || null}
          onReact={handleReact}
          onRemove={handleRemoveReact}
          size="sm"
        />
        <button type="button" aria-expanded={showComments} onClick={() => setShowComments((v) => !v)} className="min-h-11 font-medium hover:text-accent">
          {showComments ? 'Ẩn bình luận' : 'Bình luận'}
        </button>
      </div>

      {showComments && <OptionComments optionId={option.id} pollId={pollId} pollAuthorId={pollAuthorId} />}
    </div>
  );
}
