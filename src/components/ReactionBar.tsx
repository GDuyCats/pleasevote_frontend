'use client';

import { useLanguage } from '@/context/LanguageContext';
import ReactionButton from '@/components/ReactionButton';
import ReactionSummary from '@/components/ReactionSummary';
import { ReactionBreakdown } from '@/types/poll';

interface Props {
  reactions: ReactionBreakdown;
  commentCount: number;
  myReaction: string | null;
  onReact: (type: string) => void;
  onRemove: () => void;
  onCommentClick?: () => void;
}

export default function ReactionBar({ reactions, commentCount, myReaction, onReact, onRemove, onCommentClick }: Props) {
  const { translate } = useLanguage();
  return (
    <div className="border-t border-border-soft pt-1">
      <ReactionSummary reactions={reactions} commentCount={commentCount} />

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <div className="flex items-center rounded-control px-3 py-1 hover:bg-surface-muted">
          <ReactionButton count={0} myReaction={myReaction} onReact={onReact} onRemove={onRemove} />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCommentClick?.();
          }}
          className="ui-button ui-button-ghost gap-2 text-muted transition-colors duration-150 hover:bg-surface-muted"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="font-medium">{translate("Bình luận")}</span>
        </button>
      </div>
    </div>
  );
}
