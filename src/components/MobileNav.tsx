'use client';

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAuthPrompt } from '@/context/AuthPromptContext';
import { useCreatePoll } from '@/hooks/useCreatePoll';
import useLayoutHeight from '@/hooks/useLayoutHeight';
import AppIcon, { type AppIconName } from '@/components/AppIcon';

const items: { href: string | null; label: string; icon: AppIconName }[] = [
  { href: '/', label: 'Bảng tin', icon: 'home' },
  { href: '/stickers', label: 'Sticker', icon: 'sticker' },
  { href: null, label: 'Tạo bình chọn', icon: 'plus' },
  { href: '/profile', label: 'Cá nhân', icon: 'user' },
  { href: '/settings', label: 'Cài đặt', icon: 'settings' },
];

export default function MobileNav() {
  const { translate } = useLanguage();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { openPrompt } = useAuthPrompt();
  const createPoll = useCreatePoll();
  const navRef = useLayoutHeight('--mobile-nav-height');

  return (
    <nav ref={navRef} aria-label={translate("Điều hướng di động")} className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
      <div className="mx-auto grid min-h-16 max-w-feed grid-cols-5 items-center">
        {items.map((item) => {
          if (!item.href) return <button key={item.label} type="button" onClick={createPoll} disabled={loading} aria-label={translate(item.label)} className="ui-button ui-button-primary mx-auto h-11 w-11 disabled:opacity-50 p-0"><AppIcon name="plus" /></button>;
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined}
              onClick={(event) => {
                if (item.href === '/profile' && !user) {
                  event.preventDefault();
                  if (!loading) openPrompt();
                }
              }}
              className={['flex min-h-14 min-w-0 px-1 py-2 text-center flex-col items-center justify-center gap-1 rounded-control text-label-sm', active ? 'text-accent' : 'text-muted hover:bg-surface-muted'].join(' ')}>
              <AppIcon name={item.icon} /><span className="[overflow-wrap:anywhere]">{translate(item.label)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
