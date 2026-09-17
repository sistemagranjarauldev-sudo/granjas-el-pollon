import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { batchesService } from './batchesService';
import { useAuth } from '../auth/AuthContext';
import { Batch, BatchStage, BatchStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { BatchModal } from './BatchModal';
import { BatchMovementModal } from './BatchMovementModal';
import {
  Search,
  Plus,
  ArrowRightLeft,
  Eye,
  Edit2,
  Trash2,
  Boxes,
  Users,
  Layers,
} from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export const BatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeFarm } = useAuth();

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<BatchStage | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<BatchStatus | ''>('');

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [movingBatch, setMovingBatch] = useState<Batch | null>(null);
  const [deletingBatch, setDeletingBatch] = useState<Batch | null>(null);

  // Query
  const { data: batchesData, isLoading } = useQuery({
    queryKey: ['batches', activeFarm?.farmId, pageIndex, pageSize, debouncedSearch, selectedStage, selectedStatus],
    queryFn: () =>
      batchesService.getBatches(
        pageIndex,
        pageSize,
        debouncedSearch || undefined,
        selectedStage ? (selectedStage as BatchStage) : undefined,
        selectedStatus ? (selectedStatus as BatchStatus) : undefined
      ),
    enabled: !!activeFarm?.farmId,
  });

  const batches = batchesData?.data?.items || [];
  const totalCount = batchesData?.data?.totalCount || 0;
  const totalPages = batchesData?.data?.totalPages || 1;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => batchesService.createBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['pens'] });
      setIsCreateModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => batchesService.updateBatch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setEditingBatch(null);
    },
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => batchesService.moveBatch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['pens'] });
      setMovingBatch(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => batchesService.deleteBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['pens'] });
      setDeletingBatch(null);
    },
  });

  if (!activeFarm) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto mt-12 space-y-3">
        <h3 className="text-lg font-bold text-slate-900">Seleccione una Granja</h3>
        <p className="text-xs text-slate-500">
          Debe seleccionar una granja en el selector superior para consultar sus lotes de producción.
        </p>
      </div>
    );
  }

  const getStageBadge = (stage: BatchStage) => {
    switch (stage) {
      case BatchStage.Lactation:
        return <Badge variant="brand">Lactancia / Maternidad</Badge>;
      case BatchStage.Nursery:
        return <Badge variant="info">Destete / Precebo</Badge>;
      case BatchStage.Grower:
        return <Badge variant="success">Crecimiento / Desarrollo</Badge>;
      case BatchStage.Finisher:
        return <Badge variant="warning">Engorde / Ceba</Badge>;
      case BatchStage.ReplacementGilt:
        return <Badge variant="neutral">Reposición / Futuras</Badge>;
    }
  };

  const getStatusBadge = (status: BatchStatus) => {
    switch (status) {
      case BatchStatus.Active:
        return <Badge variant="success" dot>Activo</Badge>;
      case BatchStatus.Closed:
        return <Badge variant="neutral">Cerrado</Badge>;
      case BatchStatus.Transferred:
        return <Badge variant="info">Transferido</Badge>;
      case BatchStatus.Sold:
        return <Badge variant="brand">Liquidado / Vendido</Badge>;
    }
  };

  // Metric summaries
  const totalAnimals = batches.reduce((acc, b) => acc + (b.status === BatchStatus.Active ? b.currentQuantity : 0), 0);
  const activeBatchesCount = batches.filter((b) => b.status === BatchStatus.Active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
            <span>{activeFarm.farmName}</span>
            <span>•</span>
            <span className="text-slate-500">Producción en Grupo</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Lotes de Producción
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Control de piaras, destetes, crecimiento, engorde, pesajes colectivos y traslados de corrales.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Crear Lote
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-sm border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-100 uppercase tracking-wider">Lotes Activos</p>
              <h3 className="text-2xl font-black mt-1">{activeBatchesCount}</h3>
            </div>
            <div className="p-3 bg-white/10 rounded-xl">
              <Boxes className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Población en Lotes</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalAnimals} cabezas</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Lotes Registrados</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalCount}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 bg-white shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-6 relative">
            <Input
              placeholder="Buscar por código de lote, nombre u observaciones..."
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="sm:col-span-3">
            <select
              className="block w-full rounded-lg border border-slate-300 text-xs py-2 px-3 bg-white"
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value ? (Number(e.target.value) as BatchStage) : '')}
            >
              <option value="">Todas las Etapas</option>
              <option value={BatchStage.Lactation}>Lactancia / Maternidad</option>
              <option value={BatchStage.Nursery}>Destete / Precebo</option>
              <option value={BatchStage.Grower}>Crecimiento</option>
              <option value={BatchStage.Finisher}>Engorde / Ceba</option>
              <option value={BatchStage.ReplacementGilt}>Reposición</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              className="block w-full rounded-lg border border-slate-300 text-xs py-2 px-3 bg-white"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value ? (Number(e.target.value) as BatchStatus) : '')}
            >
              <option value="">Todos los Estados</option>
              <option value={BatchStatus.Active}>Solo Activos</option>
              <option value={BatchStatus.Closed}>Cerrados</option>
              <option value={BatchStatus.Transferred}>Transferidos</option>
              <option value={BatchStatus.Sold}>Vendidos / Liquidados</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="overflow-hidden border border-slate-200">
        <Table>
          <Thead>
            <Tr>
              <Th>Código y Nombre</Th>
              <Th>Etapa Productiva</Th>
              <Th>Población (Actual / Inicial)</Th>
              <Th>Ubicación Actual</Th>
              <Th>Días en Lote</Th>
              <Th>Peso Promedio</Th>
              <Th>Estado</Th>
              <Th className="text-right">Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={8} className="text-center py-10 text-xs text-slate-400">
                  Cargando lotes de producción...
                </Td>
              </Tr>
            ) : batches.length === 0 ? (
              <Tr>
                <Td colSpan={8} className="text-center py-12 text-slate-400">
                  <p className="text-sm font-semibold text-slate-700">No se encontraron lotes registrados</p>
                  <p className="text-xs text-slate-500 mt-1">Cree un nuevo lote para agrupar animales por etapa productiva.</p>
                </Td>
              </Tr>
            ) : (
              batches.map((b) => {
                const diff = b.initialQuantity - b.currentQuantity;
                const mortalityOrTransferRate = b.initialQuantity > 0 ? ((diff / b.initialQuantity) * 100).toFixed(1) : '0';

                return (
                  <Tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">{b.code}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">{b.name}</p>
                    </Td>
                    <Td>{getStageBadge(b.stage)}</Td>
                    <Td>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{b.currentQuantity}</span>
                          <span className="text-xs text-slate-400">/ {b.initialQuantity} cabezas</span>
                        </div>
                        {diff > 0 && (
                          <p className="text-[10px] text-rose-500 font-medium">
                            -{diff} bajas/traslados ({mortalityOrTransferRate}%)
                          </p>
                        )}
                      </div>
                    </Td>
                    <Td>
                      {b.penCode ? (
                        <div>
                          <span className="font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {b.penCode}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">{b.shedName} • {b.areaName}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Sin ubicación</span>
                      )}
                    </Td>
                    <Td>
                      <div className="text-xs text-slate-700">
                        <p className="font-semibold">{b.daysInBatch} días en etapa</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Inició: {new Date(b.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </Td>
                    <Td>
                      <div className="text-xs">
                        {b.currentAverageWeightKg ? (
                          <span className="text-emerald-600 font-bold text-sm">
                            {b.currentAverageWeightKg} kg
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Sin pesajes</span>
                        )}
                      </div>
                    </Td>
                    <Td>{getStatusBadge(b.status)}</Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Ver Ficha de Lote"
                          onClick={() => navigate(`/batches/${b.id}`)}
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Mover o Transferir Cabezas"
                          onClick={() => setMovingBatch(b)}
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5 text-sky-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Editar"
                          onClick={() => setEditingBatch(b)}
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Eliminar"
                          onClick={() => setDeletingBatch(b)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Mostrando página {pageIndex} de {totalPages} ({totalCount} lotes)</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pageIndex <= 1}
                onClick={() => setPageIndex((p) => p - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pageIndex >= totalPages}
                onClick={() => setPageIndex((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <BatchModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data);
        }}
        farmId={activeFarm.farmId}
        isLoading={createMutation.isPending}
      />

      {editingBatch && (
        <BatchModal
          isOpen={!!editingBatch}
          onClose={() => setEditingBatch(null)}
          onSubmit={async (data) => {
            await updateMutation.mutateAsync({ id: editingBatch.id, data });
          }}
          batch={editingBatch}
          farmId={activeFarm.farmId}
          isLoading={updateMutation.isPending}
        />
      )}

      {movingBatch && (
        <BatchMovementModal
          isOpen={!!movingBatch}
          onClose={() => setMovingBatch(null)}
          onSubmit={async (data) => {
            await moveMutation.mutateAsync({ id: movingBatch.id, data });
          }}
          batch={movingBatch}
          farmId={activeFarm.farmId}
          isLoading={moveMutation.isPending}
        />
      )}

      {deletingBatch && (
        <ConfirmDialog
          isOpen={!!deletingBatch}
          onClose={() => setDeletingBatch(null)}
          onConfirm={() => deleteMutation.mutate(deletingBatch.id)}
          title="¿Eliminar Lote de Producción?"
          message={`¿Confirma que desea eliminar el lote "${deletingBatch.code} - ${deletingBatch.name}"? Esta acción no se puede deshacer.`}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};
