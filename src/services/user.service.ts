import { api } from '@/lib/api';
import type { AvatarUploadResponse, FullProfile, UpdateProfileInput } from '@/types/user';
import { endpoints } from './endpoints';

export const userService = {
  async getProfile(): Promise<FullProfile> {
    const { data } = await api.get<FullProfile>(endpoints.users.me);
    return data;
  },
  async updateProfile(input: UpdateProfileInput): Promise<FullProfile> {
    const { data } = await api.patch<FullProfile>(endpoints.users.me, input);
    return data;
  },
  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await api.post<AvatarUploadResponse>(endpoints.users.avatar, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
