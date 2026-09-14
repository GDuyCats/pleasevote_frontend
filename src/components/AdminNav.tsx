'use client';

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Tổng quan' },
  { href: '/admin/users', label: 'Người dùng' },
  { href: '/admin/coin-packages', label: 'Gói Coin' },
];

export default function AdminNav() {
  const { translate } = useLanguage();
  const pathname = usePathname();

  return (
    <nav aria-label={translate("Điều hướng quản trị")} className="mb-6 flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={pathname === link.href ? 'page' : undefined}
          className="ui-filter"
        >
          {translate(link.label)}
        </Link>
      ))}
    </nav>
  );
}
