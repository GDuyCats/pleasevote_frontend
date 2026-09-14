'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  function onClose() {
    router.back();
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/60 px-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-panel bg-surface border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex justify-end border-b border-border bg-surface px-3 py-2">
          <button
            type="button"
            aria-label="Đóng bình chọn"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-muted ring-1 ring-border hover:bg-surface-muted"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
