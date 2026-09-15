'use client';

import { useLanguage } from '@/context/LanguageContext';
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
  like: 'text-accent',
  love: 'text-danger',
  haha: 'text-warning',
  wow: 'text-warning',
  sad: 'text-warning',
  angry: 'text-warning',
};

const REACTION_LABELS: Record<string, string> = {
  like: 'Thích', love: 'Yêu thích', haha: 'Haha', wow: 'Wow', sad: 'Buồn', angry: 'Phẫn nộ',
};

interface Props {
  count: number;
  myReaction: string | null;
  onReact: (type: string) => void;
  onRemove: () => void;
  size?: 'sm' | 'md';
}

export default function ReactionButton({ count, myReaction, onReact, onRemove, size = 'md' }: Props) {
  const { translate, formatNumber } = useLanguage();
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

  const activeColor = myReaction ? REACTION_COLORS[myReaction] : 'text-muted';
  const activeEmoji = myReaction ? REACTION_EMOJIS[myReaction] : null;
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const textSize = size === 'sm' ? 'text-metadata' : 'text-body-md';

  return (
    <div className="relative inline-block" onMouseEnter={openPicker} onMouseLeave={scheduleClose}
      onFocus={openPicker}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) scheduleClose(); }}
      onKeyDown={(event) => { if (event.key === 'Escape') { setShowPicker(false); event.stopPropagation(); } }}>
      <button
        type="button"
        aria-label={myReaction ? translate('removeReaction', { reaction: translate(REACTION_LABELS[myReaction] || 'Cảm xúc') }) : translate("Thích")}
        aria-pressed={Boolean(myReaction)}
        onClick={handleMainClick}
        className={`flex min-h-11 items-center gap-2 font-medium transition-colors duration-150 ${activeColor} ${textSize}`}
      >
        {activeEmoji ? (
          <span className='text-section-title'>{activeEmoji}</span>
        ) : (
          <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
            />
          </svg>
        )}
        {count > 0 && <span className="tabular-nums">{formatNumber(count)}</span>}
        {size === 'md' && <span>{myReaction ? translate(REACTION_LABELS[myReaction] || "Cảm xúc") : translate("Thích")}</span>}
      </button>

      {/* Invisible bridge so the cursor can travel from button to popup
          without triggering mouseleave in the dead zone between them. */}
      <div className="absolute bottom-full left-0 h-3 w-full" />

      <div
        inert={!showPicker}
        role="group"
        aria-label={translate("Chọn cảm xúc")}
        className={`fixed inset-x-4 bottom-[calc(var(--mobile-nav-height)+0.5rem)] z-40 mx-auto mb-2 flex w-fit max-w-[calc(100vw-2rem)] flex-wrap justify-center gap-1 rounded-panel bg-surface p-2 shadow-floating ring-1 ring-border transition-opacity duration-150 sm:absolute sm:inset-x-auto sm:bottom-full sm:left-0 sm:z-20 sm:mx-0 sm:flex-nowrap sm:rounded-full ${
          showPicker ? 'scale-100 opacity-100' : 'pointer-events-none scale-90 opacity-0'
        }`}
      >
        {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
          <button
            key={type}
            type="button"
            aria-label={translate(REACTION_LABELS[type])}
            aria-pressed={myReaction === type}
            onClick={(e) => handleSelect(e, type)}
            className={`min-h-11 min-w-11 rounded-full p-1 text-card-title hover:bg-surface-muted ${
              myReaction === type ? 'bg-accent-soft' : ''
            }`}
            title={REACTION_LABELS[type]}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
