import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';
import { CoinProvider } from '@/context/CoinContext';
import { AuthPromptProvider } from '@/context/AuthPromptContext';
import { PollModalProvider } from '@/context/PollModalContext';
import CreatePollModal from '@/components/CreatePollModal';
import AuthPromptModal from '@/components/AuthPromptModal';
import AppShell from '@/components/AppShell';
import { ThemeProvider } from '@/context/ThemeContext';
import { themeInitScript } from '@/lib/theme';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin', 'vietnamese'], variable: '--font-plus-jakarta-sans', display: 'swap' });

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
    <html lang="vi" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}>
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
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
