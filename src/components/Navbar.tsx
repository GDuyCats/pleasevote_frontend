'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCoin } from '@/context/CoinContext';
import { useCreatePoll } from '@/hooks/useCreatePoll';
import AppIcon from '@/components/AppIcon';
import Brand from '@/components/Brand';
import useLayoutHeight from '@/hooks/useLayoutHeight';

function getPageTitle(pathname: string) {
  if (pathname.startsWith('/admin')) return 'Quản trị';
  if (pathname.startsWith('/stickers')) return 'Khám phá sticker';
  if (pathname.startsWith('/coins')) return 'Ví coin';
  if (pathname.startsWith('/profile')) return 'Trang cá nhân';
  if (pathname.startsWith('/polls')) return 'Cuộc trò chuyện';
  if (pathname.startsWith('/settings')) return 'Cài đặt';
  return 'Bảng tin';
}

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { balance } = useCoin();
  const pathname = usePathname();
  const createPoll = useCreatePoll();
  const headerRef = useLayoutHeight('--app-header-height');
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <header ref={headerRef} className="sticky top-0 z-20 border-b border-border bg-surface">
      <div className="flex min-h-16 w-full flex-wrap items-center justify-between gap-x-3 gap-y-2 px-margin-mobile py-2 md:px-margin">
        <Brand />
        <div className="mr-auto hidden min-w-0 lg:block">
          <p className="text-label-lg text-secondary">{isAuthPage ? 'Chào mừng bạn' : getPageTitle(pathname)}</p>
          <p className="mt-1 text-body-sm text-muted">Kết nối từ những lựa chọn nhỏ.</p>
        </div>
        {isAuthPage ? (
          <Link href="/settings" className="flex min-h-11 items-center gap-2 rounded-control px-3 py-2 text-label-md text-muted hover:bg-surface-muted hover:text-secondary"><AppIcon name="settings" className="h-4 w-4 shrink-0" />Giao diện</Link>
        ) : <nav aria-label="Thao tác nhanh" className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-1 sm:gap-2">
          {!loading && (user ? (
            <Link href="/coins" className="flex min-h-11 items-center gap-1.5 rounded-full border border-border px-2.5 py-2 text-body-sm text-muted hover:border-border-strong hover:bg-surface-muted" aria-label="Mở ví coin" title={balance === null ? 'Ví coin' : balance.toLocaleString('vi-VN') + ' coin'}>
              <AppIcon name="coin" className="h-4 w-4 shrink-0" /><span className="max-w-16 truncate tabular-nums sm:max-w-24">{balance?.toLocaleString('vi-VN') ?? '…'}</span><span className="hidden sm:inline">coin</span>
            </Link>
          ) : (
            <Link href="/login" className="flex min-h-11 items-center rounded-control px-2 py-2 text-label-md text-accent hover:bg-accent-soft sm:px-3">Đăng nhập</Link>
          ))}
          {!loading && user && <button type="button" onClick={logout} aria-label="Đăng xuất" title="Đăng xuất" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-muted hover:bg-surface-muted hover:text-secondary md:hidden"><AppIcon name="logout" className="h-4 w-4" /></button>}
          <button type="button" onClick={createPoll} disabled={loading} className="hidden min-h-11 items-center gap-2 rounded-control bg-primary px-4 py-2.5 text-label-lg text-on-primary hover:bg-primary-hover disabled:opacity-50 md:flex">
            <AppIcon name="plus" className="h-4 w-4 shrink-0" />Tạo bình chọn
          </button>
        </nav>}
      </div>
    </header>
  );
}
