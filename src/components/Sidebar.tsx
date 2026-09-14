'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAuthPrompt } from '@/context/AuthPromptContext';
import { useCoin } from '@/context/CoinContext';
import { useCreatePoll } from '@/hooks/useCreatePoll';
import AppIcon, { type AppIconName } from '@/components/AppIcon';

function NavItem({ href, label, icon, active, onClick }: {
  href: string;
  label: string;
  icon: AppIconName;
  active: boolean;
  onClick?: () => void;
}) {
  const className = ['flex min-h-11 w-full items-center justify-center gap-3 rounded-control px-3 py-3 text-label-lg transition-colors lg:justify-start', active ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface-muted hover:text-secondary'].join(' ');
  const content = <><AppIcon name={icon} className="h-5 w-5 shrink-0" /><span className="hidden lg:inline">{label}</span></>;
  return onClick
    ? <button type="button" aria-label={label} title={label} onClick={onClick} className={className}>{content}</button>
    : <Link href={href} aria-label={label} title={label} aria-current={active ? 'page' : undefined} className={className}>{content}</Link>;
}

export default function Sidebar() {
  const { user, logout, loading } = useAuth();
  const { openPrompt } = useAuthPrompt();
  const { balance } = useCoin();
  const pathname = usePathname();
  const createPoll = useCreatePoll();

  return (
    <aside className="sticky top-[var(--app-header-height)] hidden h-[calc(100dvh-var(--app-header-height))] min-w-0 flex-col overflow-y-auto overscroll-contain border-x border-border bg-surface px-3 py-6 md:flex lg:px-4">
      <p className="hidden shrink-0 px-3 text-body-sm text-muted lg:block">Mỗi ý kiến đều có giá trị.</p>
      <nav aria-label="Điều hướng chính" className="mt-3 flex-1 space-y-1">
        <NavItem href="/" label="Bảng tin" icon="home" active={pathname === '/'} />
        <NavItem href="/stickers" label="Khám phá sticker" icon="sticker" active={pathname.startsWith('/stickers')} />
        <NavItem href="/coins" label="Ví coin" icon="coin" active={pathname.startsWith('/coins')} onClick={!loading && !user ? () => openPrompt() : undefined} />
        <NavItem href="/profile" label="Trang cá nhân" icon="user" active={pathname === '/profile'} onClick={!loading && !user ? () => openPrompt() : undefined} />
        <div className="my-4 border-t border-border" />
        <NavItem href="/settings" label="Cài đặt giao diện" icon="settings" active={pathname === '/settings'} />
        {user?.role === 'admin' && <NavItem href="/admin" label="Quản trị" icon="monitor" active={pathname.startsWith('/admin')} />}
        <button type="button" aria-label="Tạo bình chọn" title="Tạo bình chọn" onClick={createPoll} disabled={loading} className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-control bg-primary px-3 py-3 text-label-lg text-on-primary hover:bg-primary-hover disabled:opacity-50">
          <AppIcon name="plus" className="h-5 w-5 shrink-0" /><span className="hidden lg:inline">Tạo bình chọn</span>
        </button>
      </nav>
      <div className="mt-6 shrink-0 border-t border-border pt-4">
        {loading ? (
          <div role="status" className="flex justify-center p-2 text-body-sm text-muted"><span className="hidden lg:inline">Đang tải tài khoản…</span><span className="lg:hidden" aria-label="Đang tải tài khoản">…</span></div>
        ) : user ? (
          <div className="flex flex-col items-center gap-2 lg:flex-row">
            <Link href="/profile" aria-label={'Trang cá nhân của ' + user.name} title={user.name} className="flex min-w-0 items-center justify-center gap-3 rounded-control p-1 hover:bg-surface-muted lg:flex-1 lg:justify-start lg:p-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-label-lg text-accent">{user.name.charAt(0).toUpperCase()}</span>
              <span className="hidden min-w-0 lg:block"><span className="block truncate text-label-lg">{user.name}</span><span className="block break-words text-body-sm text-muted">{balance === null ? 'Ví của bạn' : balance.toLocaleString('vi-VN') + ' coin'}</span></span>
            </Link>
            <button type="button" onClick={logout} aria-label="Đăng xuất" title="Đăng xuất" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-muted hover:bg-surface-muted hover:text-secondary"><AppIcon name="logout" /></button>
          </div>
        ) : (
          <div>
            <div className="hidden px-2 lg:block"><p className="text-label-lg">Cùng tham gia nhé?</p><p className="mb-4 mt-1 text-body-sm text-muted">Đăng nhập để bình chọn, chia sẻ và trò chuyện.</p></div>
            <Link href="/login" aria-label="Đăng nhập" title="Đăng nhập" className="flex min-h-11 items-center justify-center gap-2 rounded-control border border-border px-2 py-2.5 text-label-lg hover:border-border-strong hover:bg-surface-muted"><AppIcon name="user" className="h-5 w-5 lg:hidden" /><span className="hidden lg:inline">Đăng nhập</span></Link>
            <p className="mt-3 hidden text-center text-body-sm text-muted lg:block">Chưa có tài khoản? <Link href="/register" className="font-semibold text-accent hover:underline">Đăng ký</Link></p>
          </div>
        )}
      </div>
    </aside>
  );
}
