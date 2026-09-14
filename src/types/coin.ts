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
export type CreateCoinPackageInput = Pick<CoinPackage, 'name' | 'coin_amount' | 'price_cents' | 'currency'>;
export type UpdateCoinPackageInput = Partial<CreateCoinPackageInput & Pick<CoinPackage, 'is_active'>>;

export interface CoinBalance {
  coin_balance: number;
}

export interface CheckoutSession {
  checkoutUrl: string;
}
