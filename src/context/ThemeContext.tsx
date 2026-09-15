'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';
import {
  applyTheme,
  parseTheme,
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
} from '@/lib/theme';

function getSnapshot() {
  const { themePreference, theme } = document.documentElement.dataset;
  return [parseTheme(themePreference), theme === 'dark' ? 'dark' : 'light'].join(':');
}

function getServerSnapshot() {
  return 'system:light';
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  function syncTheme() {
    applyTheme(parseTheme(document.documentElement.dataset.themePreference));
    onChange();
  }
  function syncStorage(event: StorageEvent) {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
    applyTheme(parseTheme(event.newValue));
    onChange();
  }
  media.addEventListener('change', syncTheme);
  window.addEventListener('storage', syncStorage);
  window.addEventListener(THEME_CHANGE_EVENT, syncTheme);
  syncTheme();
  return () => {
    media.removeEventListener('change', syncTheme);
    window.removeEventListener('storage', syncStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, syncTheme);
  };
}

function setTheme(preference: ThemePreference) {
  applyTheme(preference);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {}
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

const ThemeContext = createContext<{
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (preference: ThemePreference) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [theme, resolvedTheme] = snapshot.split(':') as [ThemePreference, ResolvedTheme];

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
