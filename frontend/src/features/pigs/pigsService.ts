import api from '../../lib/axios';
import {
  ApiResponse,
  PaginatedList,
  Pig,
  PigDetail,
  PigSex,
  PigStatus,
  GenealogyNode,
} from '../../types';

export const pigsService = {
  getPigs: async (
    pageIndex = 1,
    pageSize = 20,
    search?: string,
    sex?: PigSex,
    status?: PigStatus,
    penId?: string,
    batchId?: string
  ): Promise<ApiResponse<PaginatedList<Pig>>> => {
    const res = await api.get<ApiResponse<PaginatedList<Pig>>>('/pigs', {
      params: { pageIndex, pageSize, search, sex, status, penId, batchId },
    });
    return res.data;
  },

  getPigById: async (id: string): Promise<ApiResponse<PigDetail>> => {
    const res = await api.get<ApiResponse<PigDetail>>(`/pigs/${id}`);
    return res.data;
  },

  getAvailableBreedingPigs: async (sex: PigSex): Promise<ApiResponse<Pig[]>> => {
    const res = await api.get<ApiResponse<Pig[]>>(`/pigs/breeding/${sex}`);
    return res.data;
  },

  getGenealogyTree: async (id: string, depth = 3): Promise<ApiResponse<GenealogyNode>> => {
    const res = await api.get<ApiResponse<GenealogyNode>>(`/pigs/${id}/genealogy`, {
      params: { depth },
    });
    return res.data;
  },

  createPig: async (data: any): Promise<ApiResponse<Pig>> => {
    const res = await api.post<ApiResponse<Pig>>('/pigs', data);
    return res.data;
  },

  updatePig: async (id: string, data: any): Promise<ApiResponse<Pig>> => {
    const res = await api.put<ApiResponse<Pig>>(`/pigs/${id}`, data);
    return res.data;
  },

  movePig: async (id: string, data: { targetPenId: string; reason: string; notes?: string }): Promise<ApiResponse> => {
    const res = await api.post<ApiResponse>(`/pigs/${id}/move`, data);
    return res.data;
  },

  deletePig: async (id: string): Promise<ApiResponse> => {
    const res = await api.delete<ApiResponse>(`/pigs/${id}`);
    return res.data;
  },
};
