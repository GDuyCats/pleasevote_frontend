'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import Dialog from '@/components/Dialog';
import AppIcon from '@/components/AppIcon';

export default function Modal({ children }: { children: React.ReactNode }) {
  const { translate } = useLanguage();
  const router = useRouter();

  return (
    <Dialog onClose={() => router.back()} label={translate("Chi tiết bình chọn")} className="max-w-2xl p-0">
      <div className="sticky top-0 z-10 flex justify-end border-b border-border-soft bg-surface px-3 py-2">
        <button type="button" aria-label={translate("Đóng bình chọn")} onClick={() => router.back()} className="ui-button ui-button-secondary h-11 w-11 p-0">
          <AppIcon name="close" />
        </button>
      </div>
      {children}
    </Dialog>
  );
}
