'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Tổng quan' },
  { href: '/admin/users', label: 'Người dùng' },
  { href: '/admin/coin-packages', label: 'Gói Coin' },
  { href: '/admin/reports', label: 'Báo cáo' },
  { href: '/admin/appeals', label: 'Khiếu nại' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border pb-px">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`inline-flex min-h-11 items-center whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${
            pathname === link.href
              ? 'border-accent text-accent'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
