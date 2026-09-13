'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthPromptContextType {
  isOpen: boolean;
  message: string;
  openPrompt: (message?: string) => void;
  closePrompt: () => void;
}

const AuthPromptContext = createContext<AuthPromptContextType | undefined>(undefined);

export function AuthPromptProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('Đăng nhập để tiếp tục trải nghiệm PleaseVote.');

  function openPrompt(customMessage?: string) {
    if (customMessage) setMessage(customMessage);
    setIsOpen(true);
  }

  function closePrompt() {
    setIsOpen(false);
  }

  return (
    <AuthPromptContext.Provider value={{ isOpen, message, openPrompt, closePrompt }}>
      {children}
    </AuthPromptContext.Provider>
  );
}

export function useAuthPrompt() {
  const context = useContext(AuthPromptContext);
  if (!context) {
    throw new Error('useAuthPrompt must be used within AuthPromptProvider');
  }
  return context;
}