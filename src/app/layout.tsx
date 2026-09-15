import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { CoinProvider } from '@/context/CoinContext';
import { AuthPromptProvider } from '@/context/AuthPromptContext';
import { PollModalProvider } from '@/context/PollModalContext';
import CreatePollModal from '@/components/CreatePollModal';
import AuthPromptModal from '@/components/AuthPromptModal';
import AppShell from '@/components/AppShell';
import { ThemeProvider } from '@/context/ThemeContext';
import { themeInitScript } from '@/lib/theme';
import { LanguageProvider } from '@/context/LanguageContext';
import { languageInitScript } from '@/lib/i18n';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'PleaseVote',
  description: 'Bình chọn vui vẻ cùng bạn bè',
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: languageInitScript }} />
      </head>
      <body className="font-sans antialiased">
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <CoinProvider>
                <AuthPromptProvider>
                  <PollModalProvider>
                    <AppShell>{children}</AppShell>
                    {modal}
                    <CreatePollModal />
                    <AuthPromptModal />
                  </PollModalProvider>
                </AuthPromptProvider>
              </CoinProvider>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
