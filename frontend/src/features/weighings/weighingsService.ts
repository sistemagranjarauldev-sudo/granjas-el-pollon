import api from '../../lib/axios';
import {
  ApiResponse,
  PaginatedList,
  PigWeighing,
  BatchWeighing,
  GrowthCurvePoint,
} from '../../types';

export const weighingsService = {
  getPigWeighings: async (
    pageIndex = 1,
    pageSize = 20,
    pigId?: string
  ): Promise<ApiResponse<PaginatedList<PigWeighing>>> => {
    const res = await api.get<ApiResponse<PaginatedList<PigWeighing>>>('/weighings/pigs', {
      params: { pageIndex, pageSize, pigId },
    });
    return res.data;
  },

  getBatchWeighings: async (
    pageIndex = 1,
    pageSize = 20,
    batchId?: string
  ): Promise<ApiResponse<PaginatedList<BatchWeighing>>> => {
    const res = await api.get<ApiResponse<PaginatedList<BatchWeighing>>>('/weighings/batches', {
      params: { pageIndex, pageSize, batchId },
    });
    return res.data;
  },

  getPigGrowthCurve: async (pigId: string): Promise<ApiResponse<GrowthCurvePoint[]>> => {
    const res = await api.get<ApiResponse<GrowthCurvePoint[]>>(`/weighings/pigs/${pigId}/curve`);
    return res.data;
  },

  getBatchGrowthCurve: async (batchId: string): Promise<ApiResponse<GrowthCurvePoint[]>> => {
    const res = await api.get<ApiResponse<GrowthCurvePoint[]>>(`/weighings/batches/${batchId}/curve`);
    return res.data;
  },

  recordPigWeighing: async (data: {
    pigId: string;
    weighingDate: string;
    weightKg: number;
    notes?: string;
  }): Promise<ApiResponse<PigWeighing>> => {
    const res = await api.post<ApiResponse<PigWeighing>>('/weighings/pigs', data);
    return res.data;
  },

  recordBatchWeighing: async (data: {
    batchId: string;
    weighingDate: string;
    sampleQuantity: number;
    totalSampleWeightKg: number;
    notes?: string;
  }): Promise<ApiResponse<BatchWeighing>> => {
    const res = await api.post<ApiResponse<BatchWeighing>>('/weighings/batches', data);
    return res.data;
  },

  deletePigWeighing: async (id: string): Promise<ApiResponse> => {
    const res = await api.delete<ApiResponse>(`/weighings/pigs/${id}`);
    return res.data;
  },

  deleteBatchWeighing: async (id: string): Promise<ApiResponse> => {
    const res = await api.delete<ApiResponse>(`/weighings/batches/${id}`);
    return res.data;
  },
};
