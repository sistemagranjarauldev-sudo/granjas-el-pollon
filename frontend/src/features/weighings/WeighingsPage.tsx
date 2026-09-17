import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { weighingsService } from './weighingsService';
import { useAuth } from '../auth/AuthContext';
import { PigWeighing, BatchWeighing } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { WeighingModal } from './WeighingModal';
import {
  Plus,
  Trash2,
  User,
  Users,
  Eye,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const WeighingsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeFarm } = useAuth();

  const [activeTab, setActiveTab] = useState<'pigs' | 'batches'>('pigs');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(15);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingPigWeighing, setDeletingPigWeighing] = useState<PigWeighing | null>(null);
  const [deletingBatchWeighing, setDeletingBatchWeighing] = useState<BatchWeighing | null>(null);

  // Queries
  const { data: pigWeighingsData, isLoading: isLoadingPigWeighings } = useQuery({
    queryKey: ['pig-weighings', activeFarm?.farmId, pageIndex, pageSize],
    queryFn: () => weighingsService.getPigWeighings(pageIndex, pageSize),
    enabled: !!activeFarm?.farmId && activeTab === 'pigs',
  });

  const { data: batchWeighingsData, isLoading: isLoadingBatchWeighings } = useQuery({
    queryKey: ['batch-weighings', activeFarm?.farmId, pageIndex, pageSize],
    queryFn: () => weighingsService.getBatchWeighings(pageIndex, pageSize),
    enabled: !!activeFarm?.farmId && activeTab === 'batches',
  });

  const pigWeighings = pigWeighingsData?.data?.items || [];
  const pigTotalPages = pigWeighingsData?.data?.totalPages || 1;
  const pigTotalCount = pigWeighingsData?.data?.totalCount || 0;

  const batchWeighings = batchWeighingsData?.data?.items || [];
  const batchTotalPages = batchWeighingsData?.data?.totalPages || 1;
  const batchTotalCount = batchWeighingsData?.data?.totalCount || 0;

  // Mutations
  const recordPigMutation = useMutation({
    mutationFn: (data: any) => weighingsService.recordPigWeighing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pig-weighings'] });
      queryClient.invalidateQueries({ queryKey: ['pigs'] });
      setIsModalOpen(false);
    },
  });

  const recordBatchMutation = useMutation({
    mutationFn: (data: any) => weighingsService.recordBatchWeighing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-weighings'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setIsModalOpen(false);
    },
  });

  const deletePigMutation = useMutation({
    mutationFn: (id: string) => weighingsService.deletePigWeighing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pig-weighings'] });
      queryClient.invalidateQueries({ queryKey: ['pigs'] });
      setDeletingPigWeighing(null);
    },
  });

  const deleteBatchMutation = useMutation({
    mutationFn: (id: string) => weighingsService.deleteBatchWeighing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-weighings'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setDeletingBatchWeighing(null);
    },
  });

  if (!activeFarm) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto mt-12 space-y-3">
        <h3 className="text-lg font-bold text-slate-900">Seleccione una Granja</h3>
        <p className="text-xs text-slate-500">
          Debe seleccionar una granja para consultar los registros de pesaje.
        </p>
      </div>
    );
  }

  const handleModalSubmit = async (data: any) => {
    if (data.pigId) {
      await recordPigMutation.mutateAsync(data);
    } else {
      await recordBatchMutation.mutateAsync(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
            <span>{activeFarm.farmName}</span>
            <span>•</span>
            <span className="text-slate-500">Biológico y Rendimiento</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Pesajes y Control Ponderal (GDP)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Seguimiento de curvas de crecimiento, ganancia media diaria (g/día) y control biométrico.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Registrar Pesaje
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
        <button
          onClick={() => {
            setActiveTab('pigs');
            setPageIndex(1);
          }}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'pigs'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          )}
        >
          <User className="w-4 h-4" />
          Pesajes Individuales ({pigTotalCount})
        </button>
        <button
          onClick={() => {
            setActiveTab('batches');
            setPageIndex(1);
          }}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'batches'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          )}
        >
          <Users className="w-4 h-4" />
          Pesajes Colectivos por Lote ({batchTotalCount})
        </button>
      </div>

      {/* Tab 1: Individual Weighings Table */}
      {activeTab === 'pigs' && (
        <Card className="overflow-hidden border border-slate-200">
          <Table>
            <Thead>
              <Tr>
                <Th>Arete / Animal</Th>
                <Th>Fecha</Th>
                <Th>Peso</Th>
                <Th>Edad / Etapa</Th>
                <Th>Ganancia Peso</Th>
                <Th>GDP Calculada (g/día)</Th>
                <Th>Notas</Th>
                <Th className="text-right">Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoadingPigWeighings ? (
                <Tr>
                  <Td colSpan={8} className="text-center py-10 text-xs text-slate-400">
                    Cargando pesajes individuales...
                  </Td>
                </Tr>
              ) : pigWeighings.length === 0 ? (
                <Tr>
                  <Td colSpan={8} className="text-center py-12 text-slate-400">
                    <p className="text-sm font-semibold text-slate-700">No hay pesajes individuales registrados</p>
                    <p className="text-xs text-slate-500 mt-1">Haga clic en "Registrar Pesaje" para iniciar la curva ponderal.</p>
                  </Td>
                </Tr>
              ) : (
                pigWeighings.map((w) => (
                  <Tr key={w.id} className="hover:bg-slate-50/70">
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">{w.pigCode}</span>
                      </div>
                    </Td>
                    <Td className="font-semibold text-slate-800">{new Date(w.weighingDate).toLocaleDateString()}</Td>
                    <Td className="font-extrabold text-base text-emerald-700">{w.weightKg.toFixed(2)} kg</Td>
                    <Td>
                      <div className="text-xs">
                        <p className="font-medium text-slate-800">{w.ageDays} días</p>
                        <p className="text-[10px] text-slate-400">{w.stageName}</p>
                      </div>
                    </Td>
                    <Td>
                      {w.weightGainKg ? (
                        <span className="font-semibold text-emerald-600">+{w.weightGainKg.toFixed(2)} kg</span>
                      ) : (
                        <span className="text-slate-400 italic">Pesaje inicial</span>
                      )}
                    </Td>
                    <Td>
                      {w.averageDailyGainGrams ? (
                        <span className="font-bold text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          {w.averageDailyGainGrams} g/día
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">-</span>
                      )}
                    </Td>
                    <Td className="text-slate-500 text-xs max-w-xs truncate">{w.notes || '-'}</Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Ver Ficha del Animal"
                          onClick={() => navigate(`/pigs/${w.pigId}`)}
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Eliminar Pesaje"
                          onClick={() => setDeletingPigWeighing(w)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>

          {/* Pagination */}
          {pigTotalPages > 1 && (
            <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Mostrando página {pageIndex} de {pigTotalPages} ({pigTotalCount} registros)</span>
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
                  disabled={pageIndex >= pigTotalPages}
                  onClick={() => setPageIndex((p) => p + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Tab 2: Batch Weighings Table */}
      {activeTab === 'batches' && (
        <Card className="overflow-hidden border border-slate-200">
          <Table>
            <Thead>
              <Tr>
                <Th>Lote</Th>
                <Th>Fecha</Th>
                <Th>Muestreo</Th>
                <Th>Peso Total Muestra</Th>
                <Th>Peso Promedio</Th>
                <Th>Ganancia Media</Th>
                <Th>GDP Promedio (g/día)</Th>
                <Th className="text-right">Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoadingBatchWeighings ? (
                <Tr>
                  <Td colSpan={8} className="text-center py-10 text-xs text-slate-400">
                    Cargando pesajes por lote...
                  </Td>
                </Tr>
              ) : batchWeighings.length === 0 ? (
                <Tr>
                  <Td colSpan={8} className="text-center py-12 text-slate-400">
                    <p className="text-sm font-semibold text-slate-700">No hay pesajes colectivos registrados</p>
                    <p className="text-xs text-slate-500 mt-1">Registre muestreos de pesaje periódicos en sus lotes.</p>
                  </Td>
                </Tr>
              ) : (
                batchWeighings.map((bw) => (
                  <Tr key={bw.id} className="hover:bg-slate-50/70">
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">{bw.batchCode}</span>
                      </div>
                      <p className="text-xs text-slate-500">{bw.batchName}</p>
                    </Td>
                    <Td className="font-semibold text-slate-800">{new Date(bw.weighingDate).toLocaleDateString()}</Td>
                    <Td className="font-medium text-slate-700">{bw.sampleQuantity} cerdos</Td>
                    <Td className="font-mono text-slate-800">{bw.totalSampleWeightKg.toFixed(1)} kg</Td>
                    <Td className="font-extrabold text-base text-emerald-700">{bw.averageWeightKg.toFixed(2)} kg</Td>
                    <Td>
                      {bw.weightGainKg ? (
                        <span className="font-semibold text-emerald-600">+{bw.weightGainKg.toFixed(2)} kg</span>
                      ) : (
                        <span className="text-slate-400 italic">-</span>
                      )}
                    </Td>
                    <Td>
                      {bw.averageDailyGainGrams ? (
                        <span className="font-bold text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          {bw.averageDailyGainGrams} g/día
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">-</span>
                      )}
                    </Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Ver Ficha del Lote"
                          onClick={() => navigate(`/batches/${bw.batchId}`)}
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Eliminar Pesaje"
                          onClick={() => setDeletingBatchWeighing(bw)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>

          {/* Pagination */}
          {batchTotalPages > 1 && (
            <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Mostrando página {pageIndex} de {batchTotalPages} ({batchTotalCount} registros)</span>
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
                  disabled={pageIndex >= batchTotalPages}
                  onClick={() => setPageIndex((p) => p + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Weighing Modal */}
      <WeighingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        farmId={activeFarm.farmId}
        isLoading={recordPigMutation.isPending || recordBatchMutation.isPending}
      />

      {/* Delete Modals */}
      {deletingPigWeighing && (
        <ConfirmDialog
          isOpen={!!deletingPigWeighing}
          onClose={() => setDeletingPigWeighing(null)}
          onConfirm={() => deletePigMutation.mutate(deletingPigWeighing.id)}
          title="¿Eliminar Pesaje Individual?"
          message={`¿Confirma que desea eliminar el pesaje de ${deletingPigWeighing.weightKg} kg del animal ${deletingPigWeighing.pigCode}?`}
          isLoading={deletePigMutation.isPending}
        />
      )}

      {deletingBatchWeighing && (
        <ConfirmDialog
          isOpen={!!deletingBatchWeighing}
          onClose={() => setDeletingBatchWeighing(null)}
          onConfirm={() => deleteBatchMutation.mutate(deletingBatchWeighing.id)}
          title="¿Eliminar Pesaje de Lote?"
          message={`¿Confirma que desea eliminar el pesaje promedio de ${deletingBatchWeighing.averageWeightKg.toFixed(2)} kg del lote ${deletingBatchWeighing.batchCode}?`}
          isLoading={deleteBatchMutation.isPending}
        />
      )}
    </div>
  );
};
