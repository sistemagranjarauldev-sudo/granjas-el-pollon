import api from '../../lib/axios';
import { ApiResponse, LoginResponse, UserProfile } from '../../types';

export const authService = {
  login: async (identifier: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
      identifier,
      password,
    });
    return res.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch (err) {
        // Ignorar fallo de red en logout
      }
    }
  },

  getCurrentUser: async (): Promise<ApiResponse<UserProfile>> => {
    const res = await api.get<ApiResponse<UserProfile>>('/auth/me');
    return res.data;
  },
};
