import api from '../api/client.js';
import { User } from '../types/index.js';

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async register(data: { name: string; email: string; password: string; targetRole?: string }): Promise<AuthResponse> {
    const res = await api.post('/auth/register', data);
    return res.data.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post('/auth/login', data);
    return res.data.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data.data.user;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await api.patch('/auth/profile', data);
    return res.data.data.user;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await api.post('/auth/change-password', data);
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('resumeai_refresh_token');
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('resumeai_access_token');
      localStorage.removeItem('resumeai_refresh_token');
      localStorage.removeItem('resumeai_user');
    }
  },
};
