'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { translate } = useLanguage();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, loading]);

  if (loading || !user || user.role !== 'admin') {
    return <p className="mt-10 text-center text-muted">{translate("Đang kiểm tra quyền truy cập...")}</p>;
  }

  return <>{children}</>;
}
