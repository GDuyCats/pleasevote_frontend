'use client';

import { useState, useRef } from 'react';

const REACTION_EMOJIS: Record<string, string> = {
  like: '👍',
  love: '❤️',
  haha: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😡',
};

const REACTION_COLORS: Record<string, string> = {
  like: 'text-blue-600',
  love: 'text-red-500',
  haha: 'text-yellow-500',
  wow: 'text-yellow-500',
  sad: 'text-yellow-500',
  angry: 'text-orange-600',
};

interface Props {
  count: number;
  myReaction: string | null;
  onReact: (type: string) => void;
  onRemove: () => void;
  size?: 'sm' | 'md';
}

export default function ReactionButton({ count, myReaction, onReact, onRemove, size = 'md' }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  // useRef persists across renders — unlike a plain variable, clearTimeout
  // here reliably cancels the exact timer we previously scheduled.
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openPicker() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setShowPicker(true);
  }

  function scheduleClose() {
    closeTimerRef.current = setTimeout(() => setShowPicker(false), 300);
  }

  function handleMainClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (myReaction) {
      onRemove();
    } else {
      onReact('like');
    }
  }

  function handleSelect(e: React.MouseEvent, type: string) {
    e.stopPropagation();
    setShowPicker(false);
    if (myReaction === type) {
      onRemove();
    } else {
      onReact(type);
    }
  }

  const activeColor = myReaction ? REACTION_COLORS[myReaction] : 'text-gray-500';
  const activeEmoji = myReaction ? REACTION_EMOJIS[myReaction] : null;
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className="relative inline-block" onMouseEnter={openPicker} onMouseLeave={scheduleClose}>
      <button
        onClick={handleMainClick}
        className={`flex items-center gap-1 font-medium transition-colors duration-150 ${activeColor} ${textSize}`}
      >
        {activeEmoji ? (
          <span className='text-lg'>{activeEmoji}</span>
        ) : (
          <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
            />
          </svg>
        )}
        {count > 0 && <span className="tabular-nums">{count}</span>}
      </button>

      {/* Invisible bridge so the cursor can travel from button to popup
          without triggering mouseleave in the dead zone between them. */}
      <div className="absolute bottom-full left-0 h-3 w-full" />

      <div
        className={`absolute bottom-full left-0 z-20 mb-2 flex origin-bottom-left gap-1 rounded-full bg-white p-2 shadow-lg ring-1 ring-gray-200 transition-all duration-150 ${
          showPicker ? 'scale-100 opacity-100' : 'pointer-events-none scale-90 opacity-0'
        }`}
      >
        {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
          <button
            key={type}
            onClick={(e) => handleSelect(e, type)}
            className={`text-xl transition-transform duration-150 hover:-translate-y-1 hover:scale-125 ${
              myReaction === type ? 'scale-125' : ''
            }`}
            title={type}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}