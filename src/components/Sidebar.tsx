'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAuthPrompt } from '@/context/AuthPromptContext';
import { usePollModal } from '@/context/PollModalContext';
import { useCoin } from '@/context/CoinContext';

function NavItem({
  href,
  label,
  icon,
  active,
  onClick,
}: {
  href?: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  const className = `flex items-center gap-3 rounded-full px-4 py-3 text-base font-medium transition-colors ${
    active ? 'text-purple-600' : 'text-gray-700 hover:bg-gray-100'
  }`;

  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        <span className="h-6 w-6">{icon}</span>
        <span>{label}</span>
      </button>
    );
  }

  return (
    <Link href={href!} className={className}>
      <span className="h-6 w-6">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

const Icon = {
  home: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
    </svg>
  ),
  create: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  sticker: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
    </svg>
  ),
  coin: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  profile: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  admin: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

export default function Sidebar() {
  const { user, logout, loading } = useAuth();
  const { openPrompt } = useAuthPrompt();
  const { openModal } = usePollModal();
  const { balance } = useCoin();
  const pathname = usePathname();
  const router = useRouter();

  function handleCreatePollClick() {
    if (!user) {
      openPrompt('Đăng nhập để tạo bình chọn của riêng bạn.');
      return;
    }
    openModal();
  }

  if (loading) return <aside className="hidden w-64 shrink-0 md:block" />;

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between overflow-y-auto border-r border-gray-100 px-2 py-4 md:flex">
      <div>
        <Link href="/" className="mb-2 block px-4 py-2 text-xl font-bold text-purple-600">
          🗳️ PleaseVote
        </Link>

        <nav className="space-y-1">
          <NavItem href="/" label="Trang chủ" icon={Icon.home} active={pathname === '/'} />

          {user && (
            <NavItem label="Tạo bình chọn" icon={Icon.create} onClick={handleCreatePollClick} />
          )}

          <NavItem
            href="/stickers"
            label="Sticker"
            icon={Icon.sticker}
            active={pathname.startsWith('/stickers')}
          />

          {user ? (
            <NavItem
              href="/coins"
              label={`Coin · 🪙 ${balance ?? '...'}`}
              icon={Icon.coin}
              active={pathname.startsWith('/coins')}
            />
          ) : (
            <NavItem label="Coin" icon={Icon.coin} onClick={() => openPrompt()} />
          )}

          {user ? (
            <NavItem
              href="/profile"
              label="Hồ sơ"
              icon={Icon.profile}
              active={pathname === '/profile'}
            />
          ) : (
            <NavItem label="Hồ sơ" icon={Icon.profile} onClick={() => openPrompt()} />
          )}

          {user?.role === 'admin' && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="px-4 pb-1 text-xs font-semibold uppercase text-gray-400">Quản trị</p>
              <NavItem
                href="/admin"
                label="Tổng quan"
                icon={Icon.admin}
                active={pathname.startsWith('/admin')}
              />
            </div>
          )}
        </nav>
      </div>

      <div className="px-2">
        {user ? (
          <div className="flex items-center justify-between rounded-full px-2 py-2 hover:bg-gray-100">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[100px] truncate text-sm font-medium text-gray-800">{user.name}</span>
            </div>
            <button onClick={logout} className="text-xs font-medium text-gray-400 hover:text-red-500">
              Đăng xuất
            </button>
          </div>
        ) : (
          <div className="space-y-2 px-2">
            <Link
              href="/login"
              className="block rounded-full bg-purple-600 py-2 text-center text-sm font-semibold text-white hover:bg-purple-700"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="block rounded-full border border-gray-300 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}