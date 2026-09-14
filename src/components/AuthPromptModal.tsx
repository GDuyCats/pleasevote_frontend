'use client';

import Link from 'next/link';
import AppIcon from '@/components/AppIcon';
import { useAuthPrompt } from '@/context/AuthPromptContext';

export default function AuthPromptModal() {
  const { isOpen, message, closePrompt } = useAuthPrompt();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/40 px-4"
      onClick={closePrompt}
    >
      <div
        className="max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-panel border border-border bg-surface p-card text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-panel bg-accent-soft text-accent"><AppIcon name="message" className="h-6 w-6" /></span>
        <h2 className="mb-2 text-foreground text-card-title">Tham gia PleaseVote</h2>
        <p className="mb-6 text-sm text-muted">{message}</p>

        <div className="space-y-2">
          <Link
            href="/login"
            onClick={closePrompt}
            className="block w-full rounded-control bg-primary py-2.5 text-on-primary hover:bg-primary-hover text-label-lg min-h-11"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            onClick={closePrompt}
            className="block w-full rounded-full border border-border-strong py-2.5 text-sm font-semibold text-foreground hover:bg-background"
          >
            Đăng ký
          </Link>
        </div>

        <button
          onClick={closePrompt}
          className="min-h-11 mt-4 text-xs text-muted hover:text-muted"
        >
          Để sau
        </button>
      </div>
    </div>
  );
}
