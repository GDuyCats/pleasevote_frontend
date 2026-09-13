export interface CoinPackage {
  id: number;
  name: string;
  coin_amount: number;
  price_cents: number;
  currency: string;
  is_active: boolean;
}

export interface CoinTransaction {
  id: number;
  coin_amount: number;
  price_cents: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
}