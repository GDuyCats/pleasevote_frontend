'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface CoinContextType {
  balance: number | null;
  refreshBalance: () => Promise<void>;
}

const CoinContext = createContext<CoinContextType | undefined>(undefined);

export function CoinProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);

  async function refreshBalance() {
    if (!user) {
      setBalance(null);
      return;
    }
    try {
      const { data } = await api.get('/coins/balance');
      setBalance(data.coin_balance);
    } catch {
      // silently ignore — balance just won't show
    }
  }

  useEffect(() => {
    refreshBalance();
  }, [user]);

  return (
    <CoinContext.Provider value={{ balance, refreshBalance }}>
      {children}
    </CoinContext.Provider>
  );
}

export function useCoin() {
  const context = useContext(CoinContext);
  if (!context) {
    throw new Error('useCoin must be used within CoinProvider');
  }
  return context;
}