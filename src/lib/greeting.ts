import { createTranslator, type Language } from './i18n';

export function getGreeting(language: Language = 'vi'): string {
  const hour = new Date().getHours();
  const translate = createTranslator(language);
  if (hour >= 5 && hour < 12) return translate('greetingMorning');
  if (hour >= 12 && hour < 18) return translate('greetingAfternoon');
  if (hour >= 18 && hour < 22) return translate('greetingEvening');
  return translate('greetingNight');
}
