'use client';

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import AppIcon from '@/components/AppIcon';

export default function PageError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { translate } = useLanguage();
  return (
    <main className="page-shell">
      <section role="alert" className="ui-card mx-auto max-w-lg text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-media bg-danger-soft text-danger"><AppIcon name="close" className="h-6 w-6" /></span>
        <h1 className="text-page-title text-foreground">{translate("Chưa thể hiển thị trang")}</h1>
        <p className="mb-6 mt-3 text-body-lg text-muted">{translate("Đã xảy ra lỗi. Bạn có thể thử tải lại nội dung hoặc quay về bảng tin.")}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={reset} className="ui-button ui-button-primary">{translate("Thử lại")}</button>
          <Link href="/" className="ui-button ui-button-secondary">{translate("Về bảng tin")}</Link>
        </div>
      </section>
    </main>
  );
}
