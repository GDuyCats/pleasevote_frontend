'use client';

import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import type { ThemePreference } from '@/lib/theme';

import AppIcon, { type AppIconName } from '@/components/AppIcon';

const themeOptions: { value: ThemePreference; label: string; description: string; icon: AppIconName }[] = [
  { value: 'light', label: 'Sáng', description: 'Nền sáng, nội dung rõ ràng.', icon: 'sun' },
  { value: 'dark', label: 'Tối', description: 'Nền tối với màu sắc dịu nhẹ.', icon: 'moon' },
  { value: 'system', label: 'Theo hệ thống', description: 'Thay đổi cùng giao diện thiết bị.', icon: 'monitor' },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <>

      <main className="page-shell">
        <p className="mb-2 text-label-sm uppercase text-muted">Không gian của bạn</p>
        <h1 className="text-secondary text-page-title">Một giao diện, theo cách bạn thích.</h1>
        <p className="mt-3 max-w-prose text-body-lg text-muted">Giữ trải nghiệm đọc và trò chuyện thoải mái, dù ban ngày hay buổi tối.</p>
        <section className="mt-8 rounded-card border border-border bg-surface p-card">
          <fieldset className="min-w-0" aria-describedby="theme-description">
            <legend className="text-section-title text-foreground">Chế độ hiển thị</legend>
            <p id="theme-description" className="mt-2 text-body-lg text-muted">Chọn giao diện cho toàn bộ ứng dụng. Thay đổi được áp dụng ngay.</p>
            <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,11rem),1fr))] gap-gutter">
              {themeOptions.map((option) => (
                <label key={option.value} className={['flex min-w-0 cursor-pointer flex-col rounded-card border p-card', theme === option.value ? 'border-accent bg-accent-soft' : 'border-border bg-surface hover:bg-surface-muted'].join(' ')}>
                  <span className="mb-5 flex items-center justify-between">
                    <AppIcon name={option.icon} className={['h-6 w-6', theme === option.value ? 'text-accent' : 'text-muted'].join(' ')} />
                    <input type="radio" name="theme" value={option.value} checked={theme === option.value} onChange={() => setTheme(option.value)} className="h-[18px] w-[18px] accent-primary" />
                  </span>
                  <span className="text-author text-foreground">{option.label}</span>
                  <span className="mt-2 text-body-md text-muted [overflow-wrap:anywhere]">{option.description}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <p className="mt-6 flex items-start gap-2 border-t border-border pt-5 text-body-md text-muted"><AppIcon name="monitor" className="mt-0.5 h-4 w-4 shrink-0" /><span className="min-w-0">Lựa chọn được lưu trên trình duyệt này khi có thể. Chế độ “Theo hệ thống” tự đổi khi bạn thay đổi cài đặt thiết bị.</span></p>
        </section>
        {user?.role === 'admin' && <Link href="/admin" className="mt-5 flex items-center gap-3 rounded-card border border-border bg-surface p-card text-sm font-medium hover:bg-surface-muted"><AppIcon name="monitor" /><span className="flex-1">Quản trị cộng đồng</span><AppIcon name="arrow" className="h-4 w-4 text-muted" /></Link>}
      </main>
    </>
  );
}
