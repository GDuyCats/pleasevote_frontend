'use client';

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import AppIcon from '@/components/AppIcon';

export default function NotFound() {
  const { translate } = useLanguage();
  return (
    <main className="page-shell">
      <section className="ui-card mx-auto max-w-lg text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-media bg-surface-muted text-muted"><AppIcon name="globe" className="h-6 w-6" /></span>
        <p className="mb-2 text-metadata text-muted">404</p>
        <h1 className="text-page-title text-foreground">{translate("Không tìm thấy trang")}</h1>
        <p className="mb-6 mt-3 text-body-lg text-muted">{translate("Đường dẫn này không tồn tại hoặc nội dung đã được chuyển đi.")}</p>
        <Link href="/" className="ui-button ui-button-primary">{translate("Về bảng tin")}</Link>
      </section>
    </main>
  );
}
