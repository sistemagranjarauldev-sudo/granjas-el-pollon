import api from '../../lib/axios';
import {
  ApiResponse,
  PaginatedList,
  Farm,
  Area,
  Shed,
  Pen,
  FarmConfiguration,
  PenStatus,
} from '../../types';

export const farmStructureService = {
  // Granjas
  getFarms: async (pageIndex = 1, pageSize = 20, search?: string): Promise<ApiResponse<PaginatedList<Farm>>> => {
    const res = await api.get<ApiResponse<PaginatedList<Farm>>>('/farms', {
      params: { pageIndex, pageSize, search },
    });
    return res.data;
  },

  getFarmById: async (id: string): Promise<ApiResponse<Farm>> => {
    const res = await api.get<ApiResponse<Farm>>(`/farms/${id}`);
    return res.data;
  },

  createFarm: async (data: Partial<Farm>): Promise<ApiResponse<Farm>> => {
    const res = await api.post<ApiResponse<Farm>>('/farms', data);
    return res.data;
  },

  updateFarm: async (id: string, data: Partial<Farm>): Promise<ApiResponse<Farm>> => {
    const res = await api.put<ApiResponse<Farm>>(`/farms/${id}`, data);
    return res.data;
  },

  deleteFarm: async (id: string): Promise<ApiResponse> => {
    const res = await api.delete<ApiResponse>(`/farms/${id}`);
    return res.data;
  },

  // Áreas
  getAreasByFarm: async (farmId: string): Promise<ApiResponse<Area[]>> => {
    const res = await api.get<ApiResponse<Area[]>>(`/areas/farm/${farmId}`);
    return res.data;
  },

  createArea: async (data: any): Promise<ApiResponse<Area>> => {
    const res = await api.post<ApiResponse<Area>>('/areas', data);
    return res.data;
  },

  updateArea: async (id: string, data: any): Promise<ApiResponse<Area>> => {
    const res = await api.put<ApiResponse<Area>>(`/areas/${id}`, data);
    return res.data;
  },

  deleteArea: async (id: string): Promise<ApiResponse> => {
    const res = await api.delete<ApiResponse>(`/areas/${id}`);
    return res.data;
  },

  // Galpones
  getShedsByArea: async (areaId: string): Promise<ApiResponse<Shed[]>> => {
    const res = await api.get<ApiResponse<Shed[]>>(`/sheds/area/${areaId}`);
    return res.data;
  },

  createShed: async (data: any): Promise<ApiResponse<Shed>> => {
    const res = await api.post<ApiResponse<Shed>>('/sheds', data);
    return res.data;
  },

  updateShed: async (id: string, data: any): Promise<ApiResponse<Shed>> => {
    const res = await api.put<ApiResponse<Shed>>(`/sheds/${id}`, data);
    return res.data;
  },

  deleteShed: async (id: string): Promise<ApiResponse> => {
    const res = await api.delete<ApiResponse>(`/sheds/${id}`);
    return res.data;
  },

  // Corrales
  getPensByShed: async (shedId: string): Promise<ApiResponse<Pen[]>> => {
    const res = await api.get<ApiResponse<Pen[]>>(`/pens/shed/${shedId}`);
    return res.data;
  },

  createPen: async (data: any): Promise<ApiResponse<Pen>> => {
    const res = await api.post<ApiResponse<Pen>>('/pens', data);
    return res.data;
  },

  updatePen: async (id: string, data: any): Promise<ApiResponse<Pen>> => {
    const res = await api.put<ApiResponse<Pen>>(`/pens/${id}`, data);
    return res.data;
  },

  updatePenStatus: async (id: string, status: PenStatus): Promise<ApiResponse> => {
    const res = await api.patch<ApiResponse>(`/pens/${id}/status`, status);
    return res.data;
  },

  deletePen: async (id: string): Promise<ApiResponse> => {
    const res = await api.delete<ApiResponse>(`/pens/${id}`);
    return res.data;
  },

  // Configuraciones de Granja
  getFarmConfigurations: async (farmId: string): Promise<ApiResponse<FarmConfiguration[]>> => {
    const res = await api.get<ApiResponse<FarmConfiguration[]>>(`/farms/${farmId}/configurations`);
    return res.data;
  },

  updateFarmConfiguration: async (farmId: string, key: string, value: string): Promise<ApiResponse> => {
    const res = await api.put<ApiResponse>(`/farms/${farmId}/configurations`, { key, value });
    return res.data;
  },
};
