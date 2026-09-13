import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';
import { CoinProvider } from '@/context/CoinContext';
import { AuthPromptProvider } from '@/context/AuthPromptContext';
import { PollModalProvider } from '@/context/PollModalContext';
import CreatePollModal from '@/components/CreatePollModal';
import AuthPromptModal from '@/components/AuthPromptModal';
import AppShell from '@/components/AppShell';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="vi">
      <body className={inter.className}>
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
      </body>
    </html>
  );
}