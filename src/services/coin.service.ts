import { api } from '@/lib/api';
import type { CheckoutSession, CoinBalance } from '@/types/coin';
import { endpoints } from './endpoints';

export const coinService = {
  async getBalance(): Promise<CoinBalance> {
    const { data } = await api.get<CoinBalance>(endpoints.coins.balance);
    return data;
  },
  async checkout(packageId: number): Promise<CheckoutSession> {
    const { data } = await api.post<CheckoutSession>(endpoints.coins.checkout, { coin_package_id: packageId });
    return data;
  },
};
