'use client';

import { useLanguage } from '@/context/LanguageContext';
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
  const { translate, formatNumber } = useLanguage();
  const sorted = Object.entries(reactions)
    .filter(([key, count]) => count > 0 && REACTION_EMOJIS[key])
    .sort((a, b) => b[1] - a[1]);

  const total = sorted.reduce((sum, [, count]) => sum + count, 0);
  const topThree = sorted.slice(0, 3);

  if (total === 0 && commentCount === 0) return null;

  return (
    <div className="flex items-center justify-between py-1.5 text-metadata text-muted">
      <div className="flex items-center gap-1.5">
        {topThree.length > 0 && (
          <span className="flex items-center gap-0.5">
            {topThree.map(([key]) => (
              <span key={key} className="text-card-title">
                {REACTION_EMOJIS[key]}
              </span>
            ))}
          </span>
        )}
        {total > 0 && <span>{formatNumber(total)}</span>}
      </div>

      {commentCount > 0 && <span>{translate('comments', { count: commentCount })}</span>}
    </div>
  );
}
