import { createTranslator, locales, type Language } from './i18n';

export function formatRelativeTime(dateString: string, language: Language = 'vi'): string {
  const timestamp = new Date(dateString).getTime();
  if (Number.isNaN(timestamp)) return '—';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return createTranslator(language)('Vừa xong');
  const formatter = new Intl.RelativeTimeFormat(locales[language], { numeric: 'always' });
  if (seconds < 3600) return formatter.format(-Math.floor(seconds / 60), 'minute');
  if (seconds < 86400) return formatter.format(-Math.floor(seconds / 3600), 'hour');
  const days = Math.floor(seconds / 86400);
  if (days < 7) return formatter.format(-days, 'day');
  if (days < 30) return formatter.format(-Math.floor(days / 7), 'week');
  if (days < 365) return formatter.format(-Math.floor(days / 30), 'month');
  return formatter.format(-Math.floor(days / 365), 'year');
}
