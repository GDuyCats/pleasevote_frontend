'use client';

import Link from 'next/link';
import { useAuthPrompt } from '@/context/AuthPromptContext';

export default function AuthPromptModal() {
  const { isOpen, message, closePrompt } = useAuthPrompt();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={closePrompt}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 text-4xl">💜</div>
        <h2 className="mb-2 text-lg font-bold text-gray-900">Tham gia PleaseVote</h2>
        <p className="mb-6 text-sm text-gray-500">{message}</p>

        <div className="space-y-2">
          <Link
            href="/login"
            onClick={closePrompt}
            className="block w-full rounded-full bg-purple-600 py-2.5 text-sm font-semibold text-white hover:bg-purple-700"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            onClick={closePrompt}
            className="block w-full rounded-full border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Đăng ký
          </Link>
        </div>

        <button
          onClick={closePrompt}
          className="mt-4 text-xs text-gray-400 hover:text-gray-600"
        >
          Để sau
        </button>
      </div>
    </div>
  );
}