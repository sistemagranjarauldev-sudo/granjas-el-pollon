import api from '../../lib/axios';
import { ApiResponse, PaginatedList, AuditLogItem } from '../../types';

export const auditService = {
  getAuditLogs: async (
    pageIndex = 1,
    pageSize = 20,
    module?: string,
    action?: string,
    entityName?: string
  ): Promise<ApiResponse<PaginatedList<AuditLogItem>>> => {
    const res = await api.get<ApiResponse<PaginatedList<AuditLogItem>>>('/audit/logs', {
      params: { pageIndex, pageSize, module, action, entityName },
    });
    return res.data;
  },

  getAuditLogById: async (id: string): Promise<ApiResponse<AuditLogItem>> => {
    const res = await api.get<ApiResponse<AuditLogItem>>(`/audit/logs/${id}`);
    return res.data;
  },
};
