import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pigsService } from './pigsService';
import { weighingsService } from '../weighings/weighingsService';
import { useAuth } from '../auth/AuthContext';
import { PigSex, BatchStage } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { PigMovementModal } from './PigMovementModal';
import { WeighingModal } from '../weighings/WeighingModal';
import {
  ArrowLeft,
  Scale,
  GitFork,
  ArrowRightLeft,
  Activity,
  Award,
  Plus,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const PigDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeFarm } = useAuth();

  const [activeTab, setActiveTab] = useState<'general' | 'genealogy' | 'weighings' | 'movements'>('general');
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isWeighingModalOpen, setIsWeighingModalOpen] = useState(false);

  // Queries
  const { data: pigData, isLoading } = useQuery({
    queryKey: ['pig-detail', id],
    queryFn: () => pigsService.getPigById(id!),
    enabled: !!id,
  });

  const { data: treeData } = useQuery({
    queryKey: ['pig-genealogy', id],
    queryFn: () => pigsService.getGenealogyTree(id!, 3),
    enabled: !!id && activeTab === 'genealogy',
  });

  const pig = pigData?.data;

  // Mutations
  const moveMutation = useMutation({
    mutationFn: (data: any) => pigsService.movePig(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pig-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['pigs'] });
      setIsMoveModalOpen(false);
    },
  });

  const weighingMutation = useMutation({
    mutationFn: (data: any) => weighingsService.recordPigWeighing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pig-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['pigs'] });
      setIsWeighingModalOpen(false);
    },
  });

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-400">Cargando ficha del animal...</div>;
  }

  if (!pig) {
    return (
      <div className="p-12 text-center space-y-3">
        <h3 className="text-lg font-bold text-slate-800">Animal no encontrado</h3>
        <Button variant="outline" size="sm" onClick={() => navigate('/pigs')}>
          Volver al Inventario
        </Button>
      </div>
    );
  }

  const getSexBadge = (sex: PigSex) => {
    switch (sex) {
      case PigSex.Female:
        return <Badge variant="brand">Hembra</Badge>;
      case PigSex.Male:
        return <Badge variant="info">Verraco</Badge>;
      case PigSex.CastratedMale:
        return <Badge variant="neutral">Castrado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/pigs')}
        >
          Volver al Plantel
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowRightLeft className="w-4 h-4" />}
            onClick={() => setIsMoveModalOpen(true)}
          >
            Trasladar Corral
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Scale className="w-4 h-4" />}
            onClick={() => setIsWeighingModalOpen(true)}
          >
            Registrar Pesaje
          </Button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-3xl font-extrabold tracking-tight text-white">
                {pig.identificationCode}
              </span>
              {getSexBadge(pig.sex)}
              <Badge variant="success" dot>{pig.statusName}</Badge>
            </div>
            <p className="text-sm text-slate-300">
              {pig.breed} {pig.geneticLine && `• Línea ${pig.geneticLine}`}
            </p>
            {pig.electronicId && (
              <p className="text-xs font-mono text-slate-400">Microchip RFID: {pig.electronicId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-t md:border-t-0 md:border-l border-slate-700/80 pt-4 md:pt-0 md:pl-6">
            <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <p className="text-[11px] text-slate-400 font-medium">Edad Actual</p>
              <p className="text-lg font-bold text-white mt-0.5">{pig.ageInDays} días</p>
              <p className="text-[10px] text-emerald-400">{(pig.ageInDays / 30).toFixed(1)} meses</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <p className="text-[11px] text-slate-400 font-medium">Último Peso</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">
                {pig.currentWeightKg ? `${pig.currentWeightKg} kg` : 'N/A'}
              </p>
              <p className="text-[10px] text-slate-400">{pig.lastWeighingDate ? new Date(pig.lastWeighingDate).toLocaleDateString() : 'Sin pesaje'}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <p className="text-[11px] text-slate-400 font-medium">Ubicación</p>
              <p className="text-lg font-bold text-white mt-0.5">{pig.penCode || 'Sin corral'}</p>
              <p className="text-[10px] text-slate-400 truncate">{pig.shedName || 'N/A'}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <p className="text-[11px] text-slate-400 font-medium">Estado Reprod.</p>
              <p className="text-sm font-bold text-amber-300 mt-1 truncate">{pig.reproductiveStatusName}</p>
              <p className="text-[10px] text-slate-400">{pig.parity} partos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('general')}
          className={cn(
            'pb-3 border-b-2 transition-colors',
            activeTab === 'general' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          )}
        >
          Ficha General
        </button>
        <button
          onClick={() => setActiveTab('genealogy')}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-1.5',
            activeTab === 'genealogy' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          )}
        >
          <GitFork className="w-4 h-4" />
          Árbol Genealógico
        </button>
        <button
          onClick={() => setActiveTab('weighings')}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-1.5',
            activeTab === 'weighings' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          )}
        >
          <Scale className="w-4 h-4" />
          Historial de Pesajes ({pig.weighings?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-1.5',
            activeTab === 'movements' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          )}
        >
          <ArrowRightLeft className="w-4 h-4" />
          Trazabilidad de Movimientos ({pig.movements?.length || 0})
        </button>
      </div>

      {/* Tab 1: Ficha General */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Datos Zootécnicos y de Ingreso
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Fecha de Nacimiento</p>
                <p className="font-semibold text-slate-800 mt-0.5">{new Date(pig.birthDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Fecha de Ingreso</p>
                <p className="font-semibold text-slate-800 mt-0.5">{new Date(pig.entryDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Tipo de Ingreso</p>
                <p className="font-semibold text-slate-800 mt-0.5">{pig.entryTypeName}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Lote Asignado</p>
                <p className="font-semibold text-slate-800 mt-0.5">{pig.batchCode || 'Individual'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Partos Acumulados</p>
                <p className="font-semibold text-slate-800 mt-0.5">{pig.parity} partos</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Fecha Registro Sistema</p>
                <p className="font-semibold text-slate-800 mt-0.5">{new Date(pig.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {pig.notes && (
              <div className="pt-3 border-t border-slate-100 text-xs">
                <p className="text-slate-400 font-medium">Observaciones:</p>
                <p className="text-slate-700 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {pig.notes}
                </p>
              </div>
            )}
          </Card>

          <Card className="p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Genealogía Directa
            </h4>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Padre (Sire)</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">{pig.sireCode || 'No registrado'}</p>
                  <p className="text-xs text-slate-500">{pig.sireBreed || 'Raza desconocida'}</p>
                </div>
                {pig.sireId && (
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/pigs/${pig.sireId}`)}>
                    Ver Ficha
                  </Button>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Madre (Dam)</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">{pig.damCode || 'No registrada'}</p>
                  <p className="text-xs text-slate-500">{pig.damBreed || 'Raza desconocida'}</p>
                </div>
                {pig.damId && (
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/pigs/${pig.damId}`)}>
                    Ver Ficha
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Árbol Genealógico */}
      {activeTab === 'genealogy' && (
        <Card className="p-8">
          <h4 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">
            Pedigrí y Árbol Genealógico (3 Generaciones)
          </h4>

          {treeData?.data ? (
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center">
              {/* Gen 1: Animal */}
              <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl shadow-sm min-w-[180px]">
                <Badge variant="brand" className="mb-2">Animal</Badge>
                <h5 className="font-extrabold text-base text-slate-900">{treeData.data.code}</h5>
                <p className="text-xs text-slate-500">{treeData.data.breed}</p>
              </div>

              <span className="text-slate-300 font-bold text-2xl hidden md:inline">←</span>

              {/* Gen 2: Padres */}
              <div className="flex flex-col gap-6">
                <div className="p-3 bg-sky-50 border border-sky-300 rounded-xl min-w-[180px]">
                  <Badge variant="info" className="mb-1">Padre</Badge>
                  <h6 className="font-bold text-sm text-slate-900">{treeData.data.sire?.code || 'Desconocido'}</h6>
                  <p className="text-[11px] text-slate-500">{treeData.data.sire?.breed || 'Sin raza'}</p>
                </div>

                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl min-w-[180px]">
                  <Badge variant="brand" className="mb-1">Madre</Badge>
                  <h6 className="font-bold text-sm text-slate-900">{treeData.data.dam?.code || 'Desconocida'}</h6>
                  <p className="text-[11px] text-slate-500">{treeData.data.dam?.breed || 'Sin raza'}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center">Cargando genealogía...</p>
          )}
        </Card>
      )}

      {/* Tab 3: Historial de Pesajes */}
      {activeTab === 'weighings' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Curva Ponderal y Rendimiento</h4>
            <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsWeighingModalOpen(true)}>
              Nuevo Pesaje
            </Button>
          </div>
          <Table>
            <Thead>
              <Tr>
                <Th>Fecha Pesaje</Th>
                <Th>Peso (kg)</Th>
                <Th>Edad (Días)</Th>
                <Th>Etapa</Th>
                <Th>Ganancia (kg)</Th>
                <Th>GDP (g/día)</Th>
                <Th>Observaciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pig.weighings?.length === 0 ? (
                <Tr>
                  <Td colSpan={7} className="text-center py-8 text-xs text-slate-400">
                    No se han registrado pesajes para este animal.
                  </Td>
                </Tr>
              ) : (
                pig.weighings?.map((w) => (
                  <Tr key={w.id}>
                    <Td className="font-medium text-slate-800">{new Date(w.weighingDate).toLocaleDateString()}</Td>
                    <Td className="font-extrabold text-sm text-emerald-700">{w.weightKg} kg</Td>
                    <Td>{w.ageDays} días</Td>
                    <Td><Badge variant="neutral">{BatchStage[w.stage]}</Badge></Td>
                    <Td>{w.weightGainKg ? `+${w.weightGainKg} kg` : '-'}</Td>
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

      {/* Tab 4: Historial de Movimientos */}
      {activeTab === 'movements' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Historial de Ubicaciones Físicas</h4>
          </div>
          <Table>
            <Thead>
              <Tr>
                <Th>Fecha / Hora</Th>
                <Th>Corral Origen</Th>
                <Th>Corral Destino</Th>
                <Th>Motivo del Traslado</Th>
                <Th>Responsable</Th>
                <Th>Notas</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pig.movements?.length === 0 ? (
                <Tr>
                  <Td colSpan={6} className="text-center py-8 text-xs text-slate-400">
                    No se registran movimientos.
                  </Td>
                </Tr>
              ) : (
                pig.movements?.map((m) => (
                  <Tr key={m.id}>
                    <Td className="font-medium text-slate-800">{new Date(m.movementDate).toLocaleString()}</Td>
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

      {/* Modals */}
      {activeFarm && (
        <>
          <PigMovementModal
            isOpen={isMoveModalOpen}
            onClose={() => setIsMoveModalOpen(false)}
            onSubmit={async (data) => {
              await moveMutation.mutateAsync(data);
            }}
            pig={pig}
            farmId={activeFarm.farmId}
            isLoading={moveMutation.isPending}
          />

          <WeighingModal
            isOpen={isWeighingModalOpen}
            onClose={() => setIsWeighingModalOpen(false)}
            onSubmit={async (data) => {
              await weighingMutation.mutateAsync({ ...data, pigId: pig.id });
            }}
            defaultPigId={pig.id}
            farmId={activeFarm.farmId}
            isLoading={weighingMutation.isPending}
          />
        </>
      )}
    </div>
  );
};
