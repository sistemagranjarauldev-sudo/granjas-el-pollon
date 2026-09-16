import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AuditLogItem } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import { History } from 'lucide-react';

export interface AuditDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLogItem | null;
}

export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({ isOpen, onClose, log }) => {
  if (!log) return null;

  const parseJson = (str?: string) => {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  };

  const oldObj = parseJson(log.oldValues);
  const newObj = parseJson(log.newValues);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600" />
          <span>Detalle de Registro de Auditoría</span>
        </div>
      }
      description={`Evento inmutable #${log.id.substring(0, 8)}`}
      maxWidth="2xl"
      footer={
        <Button variant="primary" size="sm" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Event Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Acción:</span>
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
              className="mt-0.5"
            >
              {log.action}
            </Badge>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Módulo / Entidad:</span>
            <span className="font-bold text-slate-800">{log.module} • {log.entityName}</span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Usuario Actor:</span>
            <span className="font-semibold text-slate-800">{log.userName || log.userId || 'Sistema'}</span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Fecha y Hora (UTC):</span>
            <span className="font-medium text-slate-700">{formatDateTime(log.timestamp)}</span>
          </div>
        </div>

        {/* IP and Agent */}
        <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
          <span>IP Origen: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">{log.ipAddress || '127.0.0.1'}</code></span>
          <span>Entity ID: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">{log.entityId}</code></span>
        </div>

        {/* Diff comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Old Values */}
          <div className="space-y-1.5">
            <h5 className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Valores Anteriores (Old Values)
            </h5>
            <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl font-mono text-[11px] text-slate-800 overflow-x-auto max-h-60">
              {oldObj ? (
                <pre>{JSON.stringify(oldObj, null, 2)}</pre>
              ) : (
                <span className="text-slate-400 italic">No aplica (Creación nueva)</span>
              )}
            </div>
          </div>

          {/* New Values */}
          <div className="space-y-1.5">
            <h5 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Nuevos Valores (New Values)
            </h5>
            <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl font-mono text-[11px] text-slate-800 overflow-x-auto max-h-60">
              {newObj ? (
                <pre>{JSON.stringify(newObj, null, 2)}</pre>
              ) : (
                <span className="text-slate-400 italic">No aplica (Eliminación)</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
