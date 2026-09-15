'use client';

import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import { applyLanguage, createTranslator, LANGUAGE_CHANGE_EVENT, LANGUAGE_STORAGE_KEY, locales, parseLanguage, type Language, type Translator } from '@/lib/i18n';

function getSnapshot(): Language {
  return parseLanguage(document.documentElement.dataset.language);
}

function getServerSnapshot(): Language {
  return 'vi';
}

function subscribe(onChange: () => void) {
  function syncLanguage() {
    applyLanguage(getSnapshot());
    onChange();
  }
  function syncStorage(event: StorageEvent) {
    if (event.key !== LANGUAGE_STORAGE_KEY && event.key !== null) return;
    try {
      if (event.storageArea && event.storageArea !== window.localStorage) return;
    } catch {}
    applyLanguage(parseLanguage(event.newValue));
    onChange();
  }
  window.addEventListener('storage', syncStorage);
  window.addEventListener(LANGUAGE_CHANGE_EVENT, syncLanguage);
  syncLanguage();
  return () => {
    window.removeEventListener('storage', syncStorage);
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, syncLanguage);
  };
}

function setLanguage(language: Language) {
  applyLanguage(language);
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {}
  window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
}

type LanguageContextValue = {
  language: Language;
  locale: string;
  setLanguage: (language: Language) => void;
  translate: Translator;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (value: string | number | Date, options?: Intl.DateTimeFormatOptions) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const value = useMemo<LanguageContextValue>(() => ({
    language,
    locale: locales[language],
    setLanguage,
    translate: createTranslator(language),
    formatNumber: (number, options) => new Intl.NumberFormat(locales[language], options).format(number),
    formatDate: (input, options) => {
      const date = new Date(input);
      return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(locales[language], options).format(date);
    },
  }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
