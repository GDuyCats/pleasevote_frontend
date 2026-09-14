'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Navbar from '@/components/Navbar';

const NO_SIDEBAR_ROUTES = ['/login', '/register'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = NO_SIDEBAR_ROUTES.includes(pathname);

  return (
    <>
      <Navbar />
      {isAuthPage ? children : (
        <div className="w-full min-h-[calc(100dvh-var(--app-header-height))] md:grid md:grid-cols-[var(--spacing-sidebar-compact)_minmax(0,1fr)] md:items-start md:gap-gutter md:px-margin lg:grid-cols-[var(--spacing-sidebar)_minmax(0,1fr)]">
          <Sidebar />
          <div className="min-w-0 pb-[calc(var(--mobile-nav-height)+1rem)] md:pb-0">{children}</div>
          <MobileNav />
        </div>
      )}
    </>
  );
}
