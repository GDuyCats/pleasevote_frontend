'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useState } from 'react';
import { pollService } from '@/services/poll.service';
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
  pending?: boolean;
  pollAuthorId: number;
  pollId: number;
  onVote: (optionId: number) => void;
  onOptionUpdated: (optionId: number, updates: Partial<PollOption>) => void;
}

export default function PollOptionRow({
  option,
  percent,
  disabled,
  pending = false,
  pollAuthorId,
  pollId,
  onVote,
  onOptionUpdated,
}: Props) {
  const { translate, formatNumber } = useLanguage();
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
      await pollService.reactToOption(option.id, type);
    } catch {
      // leave optimistic state
    }
  }

  async function handleRemoveReact() {
    if (!user) return;
    applyOptimisticReaction(null);
    try {
      await pollService.removeOptionReaction(option.id);
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
        aria-busy={pending}
        className="min-h-12 w-full rounded-option border border-border-strong bg-surface px-4 py-3 text-left transition-colors enabled:hover:border-accent enabled:hover:bg-accent-soft disabled:cursor-not-allowed"
      >
        <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <span className="min-w-0 flex-1 basis-28">
            <span className="block text-body-lg text-body [overflow-wrap:anywhere]">{option.label}</span>
            {option.description && <span className="mt-1 block text-metadata leading-5 break-words text-muted">{option.description}</span>}
          </span>
          <span className="ml-auto max-w-full text-right [overflow-wrap:anywhere]">
            <span className="inline-block rounded-badge bg-badge px-2 py-1 text-label-lg tabular-nums text-accent">{formatNumber(percent / 100, { style: 'percent' })}</span>
            <span className="mt-0.5 block text-label-sm tabular-nums text-muted">{translate('votes', { count: option.voteCount })}</span>
          </span>
        </span>
        <span aria-hidden="true" className="mt-3 block h-2 overflow-hidden rounded-pill bg-progress-track">
          <span className="block h-full rounded-pill bg-primary transition-[width] motion-reduce:transition-none" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
        </span>
        {pending && <span role="status" className="mt-2 block text-metadata text-muted">{translate("Đang gửi bình chọn…")}</span>}
      </button>

      <ReactionSummary reactions={option.reactions || ({} as any)} commentCount={option.commentCount || 0} />

      <div className="mt-1 flex min-h-11 flex-wrap items-center gap-4 px-1 text-metadata text-muted">
        <ReactionButton
          count={0}
          myReaction={option.myReaction || null}
          onReact={handleReact}
          onRemove={handleRemoveReact}
          size="sm"
        />
        <button type="button" aria-expanded={showComments} onClick={() => setShowComments((v) => !v)} className="min-h-11 font-medium hover:text-accent">
          {showComments ? translate("Ẩn bình luận") : translate("Bình luận")}
        </button>
      </div>

      {showComments && <OptionComments optionId={option.id} pollId={pollId} pollAuthorId={pollAuthorId} />}
    </div>
  );
}
