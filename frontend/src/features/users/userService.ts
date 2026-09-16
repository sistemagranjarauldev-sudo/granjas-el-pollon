import api from '../../lib/axios';
import { ApiResponse, PaginatedList, UserItem, RoleItem, PermissionItem } from '../../types';

export const userService = {
  getUsers: async (pageIndex = 1, pageSize = 20, search?: string): Promise<ApiResponse<PaginatedList<UserItem>>> => {
    const res = await api.get<ApiResponse<PaginatedList<UserItem>>>('/users', {
      params: { pageIndex, pageSize, search },
    });
    return res.data;
  },

  getUserById: async (id: string): Promise<ApiResponse<UserItem>> => {
    const res = await api.get<ApiResponse<UserItem>>(`/users/${id}`);
    return res.data;
  },

  createUser: async (data: any): Promise<ApiResponse<UserItem>> => {
    const res = await api.post<ApiResponse<UserItem>>('/users', data);
    return res.data;
  },

  updateUser: async (id: string, data: any): Promise<ApiResponse<UserItem>> => {
    const res = await api.put<ApiResponse<UserItem>>(`/users/${id}`, data);
    return res.data;
  },

  toggleUserStatus: async (id: string): Promise<ApiResponse> => {
    const res = await api.patch<ApiResponse>(`/users/${id}/status`);
    return res.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse> => {
    const res = await api.delete<ApiResponse>(`/users/${id}`);
    return res.data;
  },

  getRoles: async (): Promise<ApiResponse<RoleItem[]>> => {
    const res = await api.get<ApiResponse<RoleItem[]>>('/roles');
    return res.data;
  },

  getPermissions: async (): Promise<ApiResponse<PermissionItem[]>> => {
    const res = await api.get<ApiResponse<PermissionItem[]>>('/roles/permissions');
    return res.data;
  },
};
