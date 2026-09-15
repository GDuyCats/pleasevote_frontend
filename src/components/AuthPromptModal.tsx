'use client';

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import AppIcon from '@/components/AppIcon';
import Dialog from '@/components/Dialog';
import { useAuthPrompt } from '@/context/AuthPromptContext';

export default function AuthPromptModal() {
  const { translate } = useLanguage();
  const { isOpen, message, closePrompt } = useAuthPrompt();

  if (!isOpen) return null;

  return (
    <Dialog onClose={closePrompt} label={translate("Tham gia PleaseVote")} className="max-w-sm text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-panel bg-accent-soft text-accent"><AppIcon name="message" className="h-6 w-6" /></span>
        <h2 className="mb-2 text-foreground text-card-title">{translate("Tham gia PleaseVote")}</h2>
        <p className="mb-6 text-body-md text-muted">{translate(message)}</p>

        <div className="space-y-2">
          <Link
            href="/login"
            onClick={closePrompt}
            className="ui-button ui-button-primary w-full"
          >
            {translate("Đăng nhập")} </Link>
          <Link
            href="/register"
            onClick={closePrompt}
            className="block w-full rounded-full border border-border-strong py-2.5 text-body-md font-semibold text-foreground hover:bg-background"
          >
            {translate("Đăng ký")} </Link>
        </div>

        <button
          onClick={closePrompt}
          className="ui-button ui-button-ghost mt-4 text-muted hover:text-muted"
        >
          {translate("Để sau")} </button>
    </Dialog>
  );
}
