import { api } from '@/lib/api';
import type { EntityId } from '@/types/api';
import type { AdminStats, AdminUser } from '@/types/admin';
import { endpoints } from './endpoints';

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const { data } = await api.get<AdminStats>(endpoints.admin.stats);
    return data;
  },
  async listUsers(): Promise<AdminUser[]> {
    const { data } = await api.get<AdminUser[]>(endpoints.users.list);
    return data;
  },
  async lockUser(userId: EntityId): Promise<void> {
    await api.patch<unknown>(endpoints.users.lock(userId));
  },
  async unlockUser(userId: EntityId): Promise<void> {
    await api.patch<unknown>(endpoints.users.unlock(userId));
  },
  async changeUserRole(userId: EntityId, role: string): Promise<void> {
    await api.patch<unknown>(endpoints.users.role(userId), { role });
  },
};
