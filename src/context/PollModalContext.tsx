'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface PollModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const PollModalContext = createContext<PollModalContextType | undefined>(undefined);

export function PollModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <PollModalContext.Provider
      value={{
        isOpen,
        openModal: () => setIsOpen(true),
        closeModal: () => setIsOpen(false),
        refreshKey,
        triggerRefresh: () => setRefreshKey((k) => k + 1),
      }}
    >
      {children}
    </PollModalContext.Provider>
  );
}

export function usePollModal() {
  const context = useContext(PollModalContext);
  if (!context) {
    throw new Error('usePollModal must be used within PollModalProvider');
  }
  return context;
}