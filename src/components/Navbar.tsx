'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePollModal } from '@/context/PollModalContext';
import { useCoin } from '@/context/CoinContext';
import { getGreeting } from '@/lib/greeting';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { openModal } = usePollModal();
  const { balance } = useCoin();
  const router = useRouter();

  function handleCreatePollClick() {
    if (!user) {
      router.push('/login');
      return;
    }
    openModal();
  }

  return (
    <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">

        <Link href="/" className="text-lg font-bold text-purple-600">
          🗳️ PleaseVote
        </Link>

        {!loading && (
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button onClick={handleCreatePollClick} className="text-sm font-medium text-purple-600 hover:underline">
                  + Tạo bình chọn
                </button>

                <Link
                  href="/coins"
                  className="flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-sm font-semibold text-yellow-700 hover:bg-yellow-100"
                >
                  <span>🪙 {balance ?? '...'}</span>
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-yellow-200 text-[10px] font-bold">
                    +
                  </span>
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin/coin-packages" className="text-sm font-medium text-orange-600 hover:underline">
                    ⚙️ Quản trị
                  </Link>
                )}
                <Link href="/profile" className="text-sm text-gray-500 hover:text-purple-600 hover:underline">
                  {getGreeting()}, {user.name}
                </Link>
                <button
                  onClick={logout}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <button onClick={handleCreatePollClick} className="text-sm font-medium text-purple-600 hover:underline">
                  + Tạo bình chọn
                </button>
                <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-purple-600">
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-purple-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-purple-700"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}