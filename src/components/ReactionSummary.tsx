'use client';

import { ReactionBreakdown } from '@/types/poll';

const REACTION_EMOJIS: Record<string, string> = {
  like: '👍',
  love: '❤️',
  haha: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😡',
};

interface Props {
  reactions: ReactionBreakdown;
  commentCount: number;
}

export default function ReactionSummary({ reactions, commentCount }: Props) {
  const sorted = Object.entries(reactions)
    .filter(([key, count]) => count > 0 && REACTION_EMOJIS[key])
    .sort((a, b) => b[1] - a[1]);

  const total = sorted.reduce((sum, [, count]) => sum + count, 0);
  const topThree = sorted.slice(0, 3);

  if (total === 0 && commentCount === 0) return null;

  return (
    <div className="flex items-center justify-between py-1.5 text-xs text-gray-500">
      <div className="flex items-center gap-1.5">
        {topThree.length > 0 && (
          <span className="flex items-center gap-0.5">
            {topThree.map(([key]) => (
              <span key={key} className="text-xl">
                {REACTION_EMOJIS[key]}
              </span>
            ))}
          </span>
        )}
        {total > 0 && <span>{total}</span>}
      </div>

      {commentCount > 0 && <span>{commentCount} bình luận</span>}
    </div>
  );
}