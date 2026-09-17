import api from '../../lib/axios';
import {
  ApiResponse,
  PaginatedList,
  Batch,
  BatchDetail,
  BatchStage,
  BatchStatus,
} from '../../types';

export const batchesService = {
  getBatches: async (
    pageIndex = 1,
    pageSize = 20,
    search?: string,
    stage?: BatchStage,
    status?: BatchStatus,
    penId?: string
  ): Promise<ApiResponse<PaginatedList<Batch>>> => {
    const res = await api.get<ApiResponse<PaginatedList<Batch>>>('/batches', {
      params: { pageIndex, pageSize, search, stage, status, penId },
    });
    return res.data;
  },

  getBatchById: async (id: string): Promise<ApiResponse<BatchDetail>> => {
    const res = await api.get<ApiResponse<BatchDetail>>(`/batches/${id}`);
    return res.data;
  },

  getActiveBatches: async (): Promise<ApiResponse<Batch[]>> => {
    const res = await api.get<ApiResponse<Batch[]>>('/batches/active');
    return res.data;
  },

  createBatch: async (data: any): Promise<ApiResponse<Batch>> => {
    const res = await api.post<ApiResponse<Batch>>('/batches', data);
    return res.data;
  },

  updateBatch: async (id: string, data: any): Promise<ApiResponse<Batch>> => {
    const res = await api.put<ApiResponse<Batch>>(`/batches/${id}`, data);
    return res.data;
  },

  moveBatch: async (id: string, data: { targetPenId: string; quantity: number; reason: string; notes?: string }): Promise<ApiResponse> => {
    const res = await api.post<ApiResponse>(`/batches/${id}/move`, data);
    return res.data;
  },

  deleteBatch: async (id: string): Promise<ApiResponse> => {
    const res = await api.delete<ApiResponse>(`/batches/${id}`);
    return res.data;
  },
};
