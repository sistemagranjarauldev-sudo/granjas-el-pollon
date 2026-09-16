import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditService } from './auditService';
import { AuditLogItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { Select } from '../../components/ui/Select';
import { AuditDetailModal } from './AuditDetailModal';
import { Eye, ShieldAlert, RefreshCw } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const AuditLogsPage: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const [module, setModule] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const pageSize = 15;

  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', pageIndex, module, action],
    queryFn: () => auditService.getAuditLogs(pageIndex, pageSize, module || undefined, action || undefined),
  });

  const moduleOptions = [
    { value: '', label: 'Todos los Módulos' },
    { value: 'FarmStructure', label: 'Estructura de Granja' },
    { value: 'Security', label: 'Seguridad y Usuarios' },
  ];

  const actionOptions = [
    { value: '', label: 'Todas las Acciones' },
    { value: 'CREATE', label: 'Creación (CREATE)' },
    { value: 'UPDATE', label: 'Modificación (UPDATE)' },
    { value: 'DELETE', label: 'Eliminación (DELETE)' },
  ];

  const columns: Column<AuditLogItem>[] = [
    {
      header: 'Fecha / Hora (UTC)',
      cell: (log) => (
        <span className="text-xs font-mono font-medium text-slate-700">
          {formatDateTime(log.timestamp)}
        </span>
      ),
    },
    {
      header: 'Acción',
      cell: (log) => (
        <Badge
          variant={
            log.action === 'CREATE'
              ? 'success'
              : log.action === 'UPDATE'
              ? 'brand'
              : log.action === 'DELETE'
              ? 'danger'
              : 'neutral'
          }
        >
          {log.action}
        </Badge>
      ),
    },
    {
      header: 'Módulo',
      cell: (log) => (
        <span className="text-xs font-semibold text-slate-900">{log.module}</span>
      ),
    },
    {
      header: 'Entidad / Registro',
      cell: (log) => (
        <div className="text-xs">
          <p className="font-bold text-slate-800">{log.entityName}</p>
          <p className="text-[11px] font-mono text-slate-400 truncate max-w-[120px]">{log.entityId}</p>
        </div>
      ),
    },
    {
      header: 'Usuario',
      cell: (log) => (
        <span className="text-xs font-medium text-slate-700">
          {log.userName || log.userId || 'Sistema'}
        </span>
      ),
    },
    {
      header: 'IP Origen',
      cell: (log) => (
        <span className="text-xs font-mono text-slate-500">{log.ipAddress || '—'}</span>
      ),
    },
    {
      header: 'Detalle',
      className: 'text-right',
      cell: (log) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedLog(log);
            setIsDetailOpen(true);
          }}
          icon={<Eye className="w-3.5 h-3.5" />}
        >
          Ver Diff
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-emerald-600" />
            Auditoría y Trazabilidad Forense
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registro inmutable de todas las mutaciones realizadas en la base de datos
          </p>
        </div>
        <Button variant="outline" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={() => refetch()}>
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-48">
          <Select
            options={moduleOptions}
            value={module}
            onChange={(e) => {
              setModule(e.target.value);
              setPageIndex(1);
            }}
          />
        </div>

        <div className="w-48">
          <Select
            options={actionOptions}
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPageIndex(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={data?.data?.items || []}
        isLoading={isLoading}
        emptyMessage="No se han registrado eventos de auditoría con los filtros seleccionados."
        pagination={{
          pageIndex: data?.data?.pageIndex || 1,
          pageSize: data?.data?.pageSize || 15,
          totalCount: data?.data?.totalCount || 0,
          totalPages: data?.data?.totalPages || 1,
          hasPreviousPage: data?.data?.hasPreviousPage || false,
          hasNextPage: data?.data?.hasNextPage || false,
          onPageChange: (p) => setPageIndex(p),
        }}
      />

      {/* Detail Modal */}
      <AuditDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        log={selectedLog}
      />
    </div>
  );
};
