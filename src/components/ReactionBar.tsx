'use client';

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
  return (
    <div className="border-t border-gray-100 pt-1">
      <ReactionSummary reactions={reactions} commentCount={commentCount} />

      <div className="flex items-center gap-0 border-t border-gray-100 pt-2">
        <div className="flex items-center rounded-lg px-2 py-1 hover:bg-gray-50">
          <ReactionButton count={0} myReaction={myReaction} onReact={onReact} onRemove={onRemove} />
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onCommentClick?.();
          }}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-gray-500 transition-colors duration-150 hover:bg-gray-50"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="font-medium">Bình luận</span>
        </button>
      </div>
    </div>
  );
}