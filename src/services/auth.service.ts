import { api } from '@/lib/api';
import type { AuthSession, LoginInput, RegisterInput, RegisterResponse } from '@/types/auth';
import { endpoints } from './endpoints';

export const authService = {
  async login(input: LoginInput): Promise<AuthSession> {
    const { data } = await api.post<AuthSession>(endpoints.auth.login, input);
    return data;
  },
  async loginWithGoogle(idToken: string): Promise<AuthSession> {
    const { data } = await api.post<AuthSession>(endpoints.auth.google, { idToken });
    return data;
  },
  async register(input: RegisterInput): Promise<RegisterResponse> {
    const { data } = await api.post<RegisterResponse>(endpoints.auth.register, input);
    return data;
  },
  async logout(refreshToken: string): Promise<void> {
    await api.post<unknown>(endpoints.auth.logout, { refreshToken });
  },
};
