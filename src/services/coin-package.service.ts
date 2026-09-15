import { api } from '@/lib/api';
import type { EntityId } from '@/types/api';
import type { CoinPackage, CreateCoinPackageInput, UpdateCoinPackageInput } from '@/types/coin';
import { endpoints } from './endpoints';

export const coinPackageService = {
  async list(): Promise<CoinPackage[]> {
    const { data } = await api.get<CoinPackage[]>(endpoints.coinPackages.list);
    return data;
  },
  async listAll(): Promise<CoinPackage[]> {
    const { data } = await api.get<CoinPackage[]>(endpoints.coinPackages.all);
    return data;
  },
  async create(input: CreateCoinPackageInput): Promise<void> {
    await api.post<unknown>(endpoints.coinPackages.list, input);
  },
  async update(packageId: EntityId, input: UpdateCoinPackageInput): Promise<void> {
    await api.put<unknown>(endpoints.coinPackages.detail(packageId), input);
  },
  async deactivate(packageId: EntityId): Promise<void> {
    await api.delete<unknown>(endpoints.coinPackages.detail(packageId));
  },
};
