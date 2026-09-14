'use client';

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import AppIcon from '@/components/AppIcon';


export default function CoinsCancelPage() {
  const { translate } = useLanguage();
  return (
    <div className="bg-background">


      <main className="page-shell max-w-md text-center">
        <div className="ui-card">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-media bg-surface-muted text-muted"><AppIcon name="close" className="h-6 w-6" /></span>
          <h1 className="mb-2 text-foreground text-page-title">{translate("Đã huỷ thanh toán")}</h1>
          <p className="mb-6 text-body-md text-muted">{translate("Bạn có thể quay lại nạp coin bất cứ lúc nào.")}</p>

          <Link
            href="/coins"
            className="ui-button ui-button-primary"
          >
            {translate("Quay lại nạp coin")} </Link>
        </div>
      </main>
    </div>
  );
}
