'use client';

import { useAuth } from '@/context/AuthContext';
import { useAuthPrompt } from '@/context/AuthPromptContext';
import { usePollModal } from '@/context/PollModalContext';

export function useCreatePoll() {
  const { user, loading } = useAuth();
  const { openPrompt } = useAuthPrompt();
  const { openModal } = usePollModal();

  return function createPoll() {
    if (loading) return;
    if (!user) {
      openPrompt('Đăng nhập để tạo bình chọn và lắng nghe ý kiến của mọi người.');
      return;
    }
    openModal();
  };
}
