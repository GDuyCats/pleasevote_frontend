'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
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
    return <p className="mt-10 text-center text-muted">Đang kiểm tra quyền truy cập...</p>;
  }

  return <>{children}</>;
}