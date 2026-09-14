const iconPaths = {
  home: 'm3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9',
  plus: 'M12 5v14M5 12h14',
  poll: 'M5 20V10m7 10V4m7 16v-7',
  sticker: 'M14 21H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8l-7 7Zm0 0v-5a2 2 0 0 1 2-2h5M8 8h.01M15 8h.01M8 12c1.5 1.5 4 1.5 5.5 0',
  coin: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM15 8.5c-4-2-7 0-5 2.5s7 1 4.5 4c-1.5 1.5-4 .5-5.5 0M12 6v12',
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2',
  settings: 'M4 7h16M4 17h16M8 4v6m8 4v6',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  check: 'm5 12 4 4L19 6',
  close: 'm6 6 12 12M18 6 6 18',
  mail: 'M3 5h18v14H3V5Zm0 1 9 7 9-7',
  logout: 'M9 4H5v16h4m5-12 4 4-4 4m-5-4h13',
  sun: 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',
  moon: 'M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z',
  monitor: 'M3 4h18v13H3V4Zm9 13v4m-5 0h10',
  globe: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z',
  lock: 'M6 10h12v11H6V10Zm3 0V6a3 3 0 0 1 6 0v4',
  message: 'M21 11a8 8 0 0 1-8 8H7l-4 3V7a4 4 0 0 1 4-4h6a8 8 0 0 1 8 8ZM8 9h8m-8 4h5',
} as const;

export type AppIconName = keyof typeof iconPaths;

export default function AppIcon({ name, className = 'h-5 w-5' }: { name: AppIconName; className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d={iconPaths[name]} />
    </svg>
  );
}
