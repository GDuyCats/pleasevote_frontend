'use client';

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import AppIcon from '@/components/AppIcon';

export default function Brand({ compact = false }: { compact?: boolean }) {
  const { translate } = useLanguage();
  return (
    <Link href="/" aria-label={translate("PleaseVote — Trang chủ")} className="inline-flex shrink-0 items-center gap-2.5 rounded-control">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-primary text-on-primary">
        <AppIcon name="poll" className="h-5 w-5" />
      </span>
      <span className={['text-section-title font-bold tracking-tight text-foreground', compact ? 'hidden lg:inline' : ''].join(' ')}>pleasevote<span className="text-accent">.</span></span>
    </Link>
  );
}
