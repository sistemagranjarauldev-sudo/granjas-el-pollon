import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { farmStructureService } from './farmStructureService';
import { useAuth } from '../auth/AuthContext';
import { Area, Shed, Pen, PenStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { AreaModal } from './AreaModal';
import { ShedModal } from './ShedModal';
import { PenModal } from './PenModal';
import {
  Layers,
  Warehouse,
  Grid,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const FarmTopologyPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeFarm } = useAuth();

  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [selectedShed, setSelectedShed] = useState<Shed | null>(null);

  // Modals
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [isDeleteAreaOpen, setIsDeleteAreaOpen] = useState(false);

  const [isShedModalOpen, setIsShedModalOpen] = useState(false);
  const [editingShed, setEditingShed] = useState<Shed | null>(null);
  const [isDeleteShedOpen, setIsDeleteShedOpen] = useState(false);

  const [isPenModalOpen, setIsPenModalOpen] = useState(false);
  const [editingPen, setEditingPen] = useState<Pen | null>(null);
  const [isDeletePenOpen, setIsDeletePenOpen] = useState(false);
  const [selectedPen, setSelectedPen] = useState<Pen | null>(null);

  // Queries
  const { data: areasData, isLoading: isLoadingAreas } = useQuery({
    queryKey: ['areas', activeFarm?.farmId],
    queryFn: () => farmStructureService.getAreasByFarm(activeFarm!.farmId),
    enabled: !!activeFarm?.farmId,
  });

  const areas = areasData?.data || [];

  // Auto-select first area
  React.useEffect(() => {
    if (areas.length > 0 && !selectedArea) {
      setSelectedArea(areas[0]);
    }
  }, [areas, selectedArea]);

  const { data: shedsData, isLoading: isLoadingSheds } = useQuery({
    queryKey: ['sheds', selectedArea?.id],
    queryFn: () => farmStructureService.getShedsByArea(selectedArea!.id),
    enabled: !!selectedArea?.id,
  });

  const sheds = shedsData?.data || [];

  // Auto-select first shed
  React.useEffect(() => {
    if (sheds.length > 0 && (!selectedShed || !sheds.some((s) => s.id === selectedShed.id))) {
      setSelectedShed(sheds[0]);
    } else if (sheds.length === 0) {
      setSelectedShed(null);
    }
  }, [sheds, selectedShed]);

  const { data: pensData, isLoading: isLoadingPens } = useQuery({
    queryKey: ['pens', selectedShed?.id],
    queryFn: () => farmStructureService.getPensByShed(selectedShed!.id),
    enabled: !!selectedShed?.id,
  });

  const pens = pensData?.data || [];

  // Mutations
  const areaMutation = useMutation({
    mutationFn: (data: any) =>
      editingArea
        ? farmStructureService.updateArea(editingArea.id, data)
        : farmStructureService.createArea(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['areas', activeFarm?.farmId] }),
  });

  const deleteAreaMutation = useMutation({
    mutationFn: (id: string) => farmStructureService.deleteArea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas', activeFarm?.farmId] });
      setSelectedArea(null);
      setIsDeleteAreaOpen(false);
    },
  });

  const shedMutation = useMutation({
    mutationFn: (data: any) =>
      editingShed
        ? farmStructureService.updateShed(editingShed.id, data)
        : farmStructureService.createShed(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sheds', selectedArea?.id] }),
  });

  const deleteShedMutation = useMutation({
    mutationFn: (id: string) => farmStructureService.deleteShed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sheds', selectedArea?.id] });
      setSelectedShed(null);
      setIsDeleteShedOpen(false);
    },
  });

  const penMutation = useMutation({
    mutationFn: (data: any) =>
      editingPen
        ? farmStructureService.updatePen(editingPen.id, data)
        : farmStructureService.createPen(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pens', selectedShed?.id] });
      queryClient.invalidateQueries({ queryKey: ['sheds', selectedArea?.id] });
      queryClient.invalidateQueries({ queryKey: ['areas', activeFarm?.farmId] });
    },
  });

  const penStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PenStatus }) =>
      farmStructureService.updatePenStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pens', selectedShed?.id] }),
  });

  const deletePenMutation = useMutation({
    mutationFn: (id: string) => farmStructureService.deletePen(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pens', selectedShed?.id] });
      setIsDeletePenOpen(false);
    },
  });

  if (!activeFarm) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto mt-12 space-y-3">
        <Layers className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Seleccione una Granja</h3>
        <p className="text-xs text-slate-500">
          Debe seleccionar una granja activa en el encabezado para ver y gestionar su topología física.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: PenStatus) => {
    switch (status) {
      case PenStatus.Empty:
        return <Badge variant="success" dot>Disponible</Badge>;
      case PenStatus.Occupied:
        return <Badge variant="brand" dot>Ocupado</Badge>;
      case PenStatus.Maintenance:
        return <Badge variant="warning" dot>Mantenimiento</Badge>;
      case PenStatus.Sanitizing:
        return <Badge variant="info" dot>Vacío Sanitario</Badge>;
      default:
        return <Badge variant="neutral">Desconocido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
            <span>{activeFarm.farmName}</span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="text-slate-500">Estructura y Alojamiento</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Topología de la Granja
          </h1>
        </div>
      </div>

      {/* 3-Column Layout: Areas -> Sheds -> Pens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Áreas (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              1. Áreas ({areas.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              icon={<Plus className="w-3 h-3" />}
              onClick={() => {
                setEditingArea(null);
                setIsAreaModalOpen(true);
              }}
            >
              Área
            </Button>
          </div>

          <div className="space-y-2">
            {isLoadingAreas ? (
              <div className="p-4 text-center text-xs text-slate-400">Cargando áreas...</div>
            ) : areas.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-xl border border-dashed border-slate-300 text-xs text-slate-400">
                No hay áreas creadas aún. Cree la primera.
              </div>
            ) : (
              areas.map((area) => {
                const isSelected = selectedArea?.id === area.id;
                return (
                  <div
                    key={area.id}
                    onClick={() => setSelectedArea(area)}
                    className={cn(
                      'p-3.5 rounded-xl border cursor-pointer transition-all duration-150 relative group',
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500/80 shadow-sm ring-1 ring-emerald-500/20'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={cn('text-sm font-bold', isSelected ? 'text-emerald-950' : 'text-slate-900')}>
                          {area.name}
                        </h4>
                        <p className="text-[11px] font-mono text-slate-400 uppercase">{area.code} • {area.areaTypeName}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingArea(area);
                            setIsAreaModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedArea(area);
                            setIsDeleteAreaOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{area.totalSheds} galpones</span>
                      <span className="font-semibold text-slate-700">{area.currentOccupancy} / {area.totalCapacity} cab.</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Galpones (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Warehouse className="w-3.5 h-3.5 text-emerald-600" />
              2. Galpones ({sheds.length})
            </h3>
            {selectedArea && (
              <Button
                variant="outline"
                size="sm"
                icon={<Plus className="w-3 h-3" />}
                onClick={() => {
                  setEditingShed(null);
                  setIsShedModalOpen(true);
                }}
              >
                Galpón
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {!selectedArea ? (
              <div className="p-6 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-400">
                Seleccione un área primero.
              </div>
            ) : isLoadingSheds ? (
              <div className="p-4 text-center text-xs text-slate-400">Cargando galpones...</div>
            ) : sheds.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-xl border border-dashed border-slate-300 text-xs text-slate-400">
                No hay galpones en esta área.
              </div>
            ) : (
              sheds.map((shed) => {
                const isSelected = selectedShed?.id === shed.id;
                return (
                  <div
                    key={shed.id}
                    onClick={() => setSelectedShed(shed)}
                    className={cn(
                      'p-3.5 rounded-xl border cursor-pointer transition-all duration-150 relative group',
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500/80 shadow-sm ring-1 ring-emerald-500/20'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={cn('text-sm font-bold', isSelected ? 'text-emerald-950' : 'text-slate-900')}>
                          {shed.name}
                        </h4>
                        <p className="text-[11px] font-mono text-slate-400">{shed.code}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingShed(shed);
                            setIsShedModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedShed(shed);
                            setIsDeleteShedOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{shed.totalPens} corrales</span>
                      <span className="font-semibold text-slate-700">{shed.currentOccupancy} / {shed.totalCapacity} cab.</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 3: Corrales / Jaulas Grid (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5 text-emerald-600" />
              3. Corrales y Jaulas ({pens.length})
            </h3>
            {selectedShed && (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-3 h-3" />}
                onClick={() => {
                  setEditingPen(null);
                  setIsPenModalOpen(true);
                }}
              >
                Nuevo Corral
              </Button>
            )}
          </div>

          {!selectedShed ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-400">
              Seleccione un galpón para visualizar sus corrales y salas.
            </div>
          ) : isLoadingPens ? (
            <div className="p-8 text-center text-xs text-slate-400">Cargando corrales...</div>
          ) : pens.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300 space-y-2">
              <p className="text-sm font-semibold text-slate-700">Galpón sin corrales asignados</p>
              <p className="text-xs text-slate-500">Haga clic en "+ Nuevo Corral" para registrar la primera jaula o corral.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pens.map((pen) => {
                const percent = pen.maxCapacity > 0 ? Math.round((pen.currentOccupancy / pen.maxCapacity) * 100) : 0;
                return (
                  <Card key={pen.id} className="hover:border-slate-300 transition-colors">
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900">{pen.code}</span>
                            {getStatusBadge(pen.status)}
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">{pen.penTypeName}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingPen(pen);
                              setIsPenModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                            title="Editar"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPen(pen);
                              setIsDeletePenOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Capacity Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-600">Ocupación: {pen.currentOccupancy} / {pen.maxCapacity}</span>
                          <span className={percent >= 100 ? 'text-rose-600' : 'text-slate-500'}>{percent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              percent >= 100 ? 'bg-rose-500' : percent > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                            )}
                            style={{ width: `${Math.min(100, percent)}%` }}
                          />
                        </div>
                      </div>

                      {/* Quick Status Toggles */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Acción Rápida:</span>
                        <div className="flex items-center gap-1">
                          {pen.status !== PenStatus.Empty && (
                            <button
                              onClick={() => penStatusMutation.mutate({ id: pen.id, status: PenStatus.Empty })}
                              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                            >
                              Vaciar
                            </button>
                          )}
                          {pen.status !== PenStatus.Sanitizing && (
                            <button
                              onClick={() => penStatusMutation.mutate({ id: pen.id, status: PenStatus.Sanitizing })}
                              className="px-2 py-0.5 rounded bg-sky-50 hover:bg-sky-100 text-sky-700 font-medium transition-colors"
                            >
                              Sanitizar
                            </button>
                          )}
                          {pen.status !== PenStatus.Maintenance && (
                            <button
                              onClick={() => penStatusMutation.mutate({ id: pen.id, status: PenStatus.Maintenance })}
                              className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium transition-colors"
                            >
                              Mant.
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Area Modals */}
      <AreaModal
        isOpen={isAreaModalOpen}
        onClose={() => setIsAreaModalOpen(false)}
        onSubmit={async (data) => {
          await areaMutation.mutateAsync(data);
        }}
        area={editingArea}
        farmId={activeFarm.farmId}
        isLoading={areaMutation.isPending}
      />

      {selectedArea && (
        <ConfirmDialog
          isOpen={isDeleteAreaOpen}
          onClose={() => setIsDeleteAreaOpen(false)}
          onConfirm={() => deleteAreaMutation.mutate(selectedArea.id)}
          title="¿Eliminar Área?"
          message={`¿Confirma que desea eliminar el área "${selectedArea.name}"? Los galpones asociados se verán afectados.`}
          isLoading={deleteAreaMutation.isPending}
        />
      )}

      {/* Shed Modals */}
      {selectedArea && (
        <ShedModal
          isOpen={isShedModalOpen}
          onClose={() => setIsShedModalOpen(false)}
          onSubmit={async (data) => {
            await shedMutation.mutateAsync(data);
          }}
          shed={editingShed}
          areaId={selectedArea.id}
          isLoading={shedMutation.isPending}
        />
      )}

      {selectedShed && (
        <ConfirmDialog
          isOpen={isDeleteShedOpen}
          onClose={() => setIsDeleteShedOpen(false)}
          onConfirm={() => deleteShedMutation.mutate(selectedShed.id)}
          title="¿Eliminar Galpón?"
          message={`¿Confirma que desea eliminar el galpón "${selectedShed.name}"?`}
          isLoading={deleteShedMutation.isPending}
        />
      )}

      {/* Pen Modals */}
      {selectedShed && (
        <PenModal
          isOpen={isPenModalOpen}
          onClose={() => setIsPenModalOpen(false)}
          onSubmit={async (data) => {
            await penMutation.mutateAsync(data);
          }}
          pen={editingPen}
          shedId={selectedShed.id}
          isLoading={penMutation.isPending}
        />
      )}

      {selectedPen && (
        <ConfirmDialog
          isOpen={isDeletePenOpen}
          onClose={() => setIsDeletePenOpen(false)}
          onConfirm={() => deletePenMutation.mutate(selectedPen.id)}
          title="¿Eliminar Corral?"
          message={`¿Confirma que desea eliminar el corral "${selectedPen.code}"?`}
          isLoading={deletePenMutation.isPending}
        />
      )}
    </div>
  );
};
