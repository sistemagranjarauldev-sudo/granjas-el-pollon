import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { batchesService } from './batchesService';
import { weighingsService } from '../weighings/weighingsService';
import { useAuth } from '../auth/AuthContext';
import { BatchStage, BatchStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { BatchMovementModal } from './BatchMovementModal';
import { WeighingModal } from '../weighings/WeighingModal';
import {
  ArrowLeft,
  Scale,
  ArrowRightLeft,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const BatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeFarm } = useAuth();

  const [activeTab, setActiveTab] = useState<'weighings' | 'movements' | 'metrics'>('weighings');
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isWeighingModalOpen, setIsWeighingModalOpen] = useState(false);

  // Query
  const { data: batchData, isLoading } = useQuery({
    queryKey: ['batch-detail', id],
    queryFn: () => batchesService.getBatchById(id!),
    enabled: !!id,
  });

  const batch = batchData?.data;

  // Mutations
  const moveMutation = useMutation({
    mutationFn: (data: any) => batchesService.moveBatch(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setIsMoveModalOpen(false);
    },
  });

  const weighingMutation = useMutation({
    mutationFn: (data: any) => weighingsService.recordBatchWeighing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setIsWeighingModalOpen(false);
    },
  });

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-400">Cargando ficha del lote...</div>;
  }

  if (!batch) {
    return (
      <div className="p-12 text-center space-y-3">
        <h3 className="text-lg font-bold text-slate-800">Lote no encontrado</h3>
        <Button variant="outline" size="sm" onClick={() => navigate('/batches')}>
          Volver a Lotes
        </Button>
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
        return <Badge variant="success">Crecimiento</Badge>;
      case BatchStage.Finisher:
        return <Badge variant="warning">Engorde / Ceba</Badge>;
      case BatchStage.ReplacementGilt:
        return <Badge variant="neutral">Reposición</Badge>;
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
        return <Badge variant="brand">Vendido</Badge>;
    }
  };

  const diffQuantity = batch.initialQuantity - batch.currentQuantity;
  const reductionRate = batch.initialQuantity > 0 ? ((diffQuantity / batch.initialQuantity) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Back & Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/batches')}
        >
          Volver a Lotes
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowRightLeft className="w-4 h-4" />}
            onClick={() => setIsMoveModalOpen(true)}
          >
            Mover / Transferir
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Scale className="w-4 h-4" />}
            onClick={() => setIsWeighingModalOpen(true)}
          >
            Pesaje Colectivo
          </Button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-teal-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-3xl font-extrabold tracking-tight text-white">
                {batch.code}
              </span>
              {getStageBadge(batch.stage)}
              {getStatusBadge(batch.status)}
            </div>
            <h2 className="text-base font-bold text-teal-100">{batch.name}</h2>
            {batch.notes && <p className="text-xs text-slate-300 max-w-xl">{batch.notes}</p>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-t md:border-t-0 md:border-l border-white/15 pt-4 md:pt-0 md:pl-6">
            <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <p className="text-[11px] text-teal-200 font-medium">Población Actual</p>
              <p className="text-xl font-black text-white mt-0.5">{batch.currentQuantity}</p>
              <p className="text-[10px] text-slate-300">Inicial: {batch.initialQuantity}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <p className="text-[11px] text-teal-200 font-medium">Peso Promedio</p>
              <p className="text-xl font-black text-emerald-300 mt-0.5">
                {batch.currentAverageWeightKg ? `${batch.currentAverageWeightKg} kg` : 'N/A'}
              </p>
              <p className="text-[10px] text-slate-300">{batch.weighings?.length || 0} pesajes</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <p className="text-[11px] text-teal-200 font-medium">Ubicación</p>
              <p className="text-lg font-bold text-white mt-0.5">{batch.penCode || 'Sin corral'}</p>
              <p className="text-[10px] text-slate-300 truncate">{batch.shedName || 'N/A'}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <p className="text-[11px] text-teal-200 font-medium">Días en Etapa</p>
              <p className="text-lg font-bold text-white mt-0.5">{batch.daysInBatch} días</p>
              <p className="text-[10px] text-teal-300">{(batch.daysInBatch / 30).toFixed(1)} meses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('weighings')}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-1.5',
            activeTab === 'weighings' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          )}
        >
          <Scale className="w-4 h-4" />
          Pesajes Colectivos y GDP ({batch.weighings?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-1.5',
            activeTab === 'movements' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          )}
        >
          <ArrowRightLeft className="w-4 h-4" />
          Historial de Movimientos ({batch.movements?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-1.5',
            activeTab === 'metrics' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          )}
        >
          <TrendingUp className="w-4 h-4" />
          Balance Zootécnico
        </button>
      </div>

      {/* Tab 1: Pesajes Colectivos */}
      {activeTab === 'weighings' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Evolución Ponderal del Lote y Ganancia Media Diaria (GMD/GDP)
              </h4>
              <p className="text-[11px] text-slate-500">Muestreos de pesaje por lote con cálculo automático de crecimiento en g/día.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsWeighingModalOpen(true)}
            >
              Nuevo Muestreo
            </Button>
          </div>
          <Table>
            <Thead>
              <Tr>
                <Th>Fecha Pesaje</Th>
                <Th>Muestreo / Total</Th>
                <Th>Peso Total Muestra</Th>
                <Th>Peso Promedio</Th>
                <Th>Ganancia Media (kg)</Th>
                <Th>GDP Promedio (g/día)</Th>
                <Th>Observaciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {!batch.weighings || batch.weighings.length === 0 ? (
                <Tr>
                  <Td colSpan={7} className="text-center py-10 text-xs text-slate-400">
                    No se han registrado pesajes colectivos para este lote.
                  </Td>
                </Tr>
              ) : (
                batch.weighings.map((w) => (
                  <Tr key={w.id} className="hover:bg-slate-50/70">
                    <Td className="font-semibold text-slate-800">{new Date(w.weighingDate).toLocaleDateString()}</Td>
                    <Td>{w.sampleQuantity} de {batch.currentQuantity} cerdos</Td>
                    <Td className="font-mono text-slate-700">{w.totalSampleWeightKg.toFixed(1)} kg</Td>
                    <Td className="font-extrabold text-sm text-emerald-700">{w.averageWeightKg.toFixed(2)} kg</Td>
                    <Td>{w.weightGainKg ? `+${w.weightGainKg.toFixed(2)} kg` : '-'}</Td>
                    <Td>
                      {w.averageDailyGainGrams ? (
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {w.averageDailyGainGrams} g/día
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Primer pesaje</span>
                      )}
                    </Td>
                    <Td className="text-slate-500 text-xs">{w.notes || '-'}</Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Card>
      )}

      {/* Tab 2: Movimientos */}
      {activeTab === 'movements' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Trazabilidad de Traslados y Reubicaciones
            </h4>
          </div>
          <Table>
            <Thead>
              <Tr>
                <Th>Fecha / Hora</Th>
                <Th>Cabezas Movidas</Th>
                <Th>Corral Origen</Th>
                <Th>Corral Destino</Th>
                <Th>Motivo</Th>
                <Th>Responsable</Th>
                <Th>Notas</Th>
              </Tr>
            </Thead>
            <Tbody>
              {!batch.movements || batch.movements.length === 0 ? (
                <Tr>
                  <Td colSpan={7} className="text-center py-10 text-xs text-slate-400">
                    No se registran movimientos para este lote.
                  </Td>
                </Tr>
              ) : (
                batch.movements.map((m) => (
                  <Tr key={m.id}>
                    <Td className="font-medium text-slate-800">{new Date(m.movementDate).toLocaleString()}</Td>
                    <Td className="font-bold text-slate-900">{m.quantity} cabezas</Td>
                    <Td>{m.sourcePenCode ? <span className="font-mono text-slate-600">{m.sourcePenCode}</span> : <span className="text-slate-400 italic">Ingreso Inicial</span>}</Td>
                    <Td><span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{m.targetPenCode}</span></Td>
                    <Td className="font-semibold text-slate-800">{m.reason}</Td>
                    <Td className="text-slate-500 text-xs">{m.responsibleUserId || 'Sistema'}</Td>
                    <Td className="text-slate-500 text-xs">{m.notes || '-'}</Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Card>
      )}

      {/* Tab 3: Balance Zootécnico */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Balance Poblacional</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Cantidad Inicial:</span>
                <span className="font-bold text-slate-800">{batch.initialQuantity} cerdos</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Cantidad Actual:</span>
                <span className="font-bold text-emerald-600">{batch.currentQuantity} cerdos</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Diferencia / Bajas / Envíos:</span>
                <span className="font-bold text-rose-500">-{diffQuantity} cerdos</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Tasa de Reducción:</span>
                <span className="font-bold text-slate-800">{reductionRate}%</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cronograma Productivo</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Fecha de Inicio:</span>
                <span className="font-bold text-slate-800">{new Date(batch.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Fecha Estimada Fin:</span>
                <span className="font-bold text-slate-800">{batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'No definida'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Días en Etapa:</span>
                <span className="font-bold text-slate-800">{batch.daysInBatch} días</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rendimiento Ponderal</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Peso Promedio Actual:</span>
                <span className="font-bold text-emerald-600">{batch.currentAverageWeightKg ? `${batch.currentAverageWeightKg} kg` : 'Sin pesajes'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Muestreos Registrados:</span>
                <span className="font-bold text-slate-800">{batch.weighings?.length || 0} sesiones</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modals */}
      {activeFarm && (
        <>
          <BatchMovementModal
            isOpen={isMoveModalOpen}
            onClose={() => setIsMoveModalOpen(false)}
            onSubmit={async (data) => {
              await moveMutation.mutateAsync(data);
            }}
            batch={batch}
            farmId={activeFarm.farmId}
            isLoading={moveMutation.isPending}
          />

          <WeighingModal
            isOpen={isWeighingModalOpen}
            onClose={() => setIsWeighingModalOpen(false)}
            onSubmit={async (data) => {
              await weighingMutation.mutateAsync({ ...data, batchId: batch.id });
            }}
            defaultBatchId={batch.id}
            farmId={activeFarm.farmId}
            isLoading={weighingMutation.isPending}
          />
        </>
      )}
    </div>
  );
};
