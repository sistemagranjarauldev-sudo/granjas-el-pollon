import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { pigsService } from './pigsService';
import { useAuth } from '../auth/AuthContext';
import { Pig, PigSex, PigStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PigModal } from './PigModal';
import { PigMovementModal } from './PigMovementModal';
import {
  Search,
  Plus,
  ArrowRightLeft,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export const PigsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeFarm } = useAuth();

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSex, setSelectedSex] = useState<PigSex | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<PigStatus | ''>('');

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPig, setEditingPig] = useState<Pig | null>(null);
  const [movingPig, setMovingPig] = useState<Pig | null>(null);
  const [deletingPig, setDeletingPig] = useState<Pig | null>(null);

  // Query
  const { data: pigsData, isLoading } = useQuery({
    queryKey: ['pigs', activeFarm?.farmId, pageIndex, pageSize, debouncedSearch, selectedSex, selectedStatus],
    queryFn: () =>
      pigsService.getPigs(
        pageIndex,
        pageSize,
        debouncedSearch || undefined,
        selectedSex ? (selectedSex as PigSex) : undefined,
        selectedStatus ? (selectedStatus as PigStatus) : undefined
      ),
    enabled: !!activeFarm?.farmId,
  });

  const pigs = pigsData?.data?.items || [];
  const totalCount = pigsData?.data?.totalCount || 0;
  const totalPages = pigsData?.data?.totalPages || 1;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => pigsService.createPig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pigs'] });
      queryClient.invalidateQueries({ queryKey: ['breeding-sires'] });
      queryClient.invalidateQueries({ queryKey: ['breeding-dams'] });
      queryClient.invalidateQueries({ queryKey: ['pens'] });
      setIsCreateModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => pigsService.updatePig(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pigs'] });
      setEditingPig(null);
    },
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => pigsService.movePig(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pigs'] });
      queryClient.invalidateQueries({ queryKey: ['pens'] });
      setMovingPig(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pigsService.deletePig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pigs'] });
      queryClient.invalidateQueries({ queryKey: ['pens'] });
      setDeletingPig(null);
    },
  });

  if (!activeFarm) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto mt-12 space-y-3">
        <h3 className="text-lg font-bold text-slate-900">Seleccione una Granja</h3>
        <p className="text-xs text-slate-500">
          Debe seleccionar una granja en el selector superior para consultar su plantel porcino.
        </p>
      </div>
    );
  }

  const getSexBadge = (sex: PigSex) => {
    switch (sex) {
      case PigSex.Female:
        return <Badge variant="brand">Hembra</Badge>;
      case PigSex.Male:
        return <Badge variant="info">Macho (Verraco)</Badge>;
      case PigSex.CastratedMale:
        return <Badge variant="neutral">Cebón (Castrado)</Badge>;
    }
  };

  const getStatusBadge = (status: PigStatus) => {
    switch (status) {
      case PigStatus.Active:
        return <Badge variant="success" dot>Activo</Badge>;
      case PigStatus.Sold:
        return <Badge variant="neutral">Vendido</Badge>;
      case PigStatus.Dead:
        return <Badge variant="danger">Muerto</Badge>;
      case PigStatus.Culled:
        return <Badge variant="warning">Descartado</Badge>;
      case PigStatus.Transferred:
        return <Badge variant="info">Trasladado</Badge>;
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
            <span className="text-slate-500">Plantel Porcino</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Inventario Individual de Animales
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de reproductoras, verracos, genealogía, pesajes y ficha técnica individual.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Registrar Animal
        </Button>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 bg-white shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-6 relative">
            <Input
              placeholder="Buscar por arete, RFID, raza o genética..."
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="sm:col-span-3">
            <select
              className="block w-full rounded-lg border border-slate-300 text-xs py-2 px-3 bg-white"
              value={selectedSex}
              onChange={(e) => setSelectedSex(e.target.value ? (Number(e.target.value) as PigSex) : '')}
            >
              <option value="">Todos los Sexos</option>
              <option value={PigSex.Female}>Hembras (Madres/Primerizas)</option>
              <option value={PigSex.Male}>Machos (Verracos)</option>
              <option value={PigSex.CastratedMale}>Machos Castrados</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              className="block w-full rounded-lg border border-slate-300 text-xs py-2 px-3 bg-white"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value ? (Number(e.target.value) as PigStatus) : '')}
            >
              <option value="">Todos los Estados</option>
              <option value={PigStatus.Active}>Solo Activos</option>
              <option value={PigStatus.Sold}>Vendidos</option>
              <option value={PigStatus.Dead}>Bajas por Muerte</option>
              <option value={PigStatus.Culled}>Descartados</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="overflow-hidden border border-slate-200">
        <Table>
          <Thead>
            <Tr>
              <Th>Arete / Código</Th>
              <Th>Sexo / Raza</Th>
              <Th>Genealogía (P / M)</Th>
              <Th>Ubicación Actual</Th>
              <Th>Edad / Peso</Th>
              <Th>Estado Reproductivo</Th>
              <Th>Estado</Th>
              <Th className="text-right">Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={8} className="text-center py-10 text-xs text-slate-400">
                  Cargando plantel porcino...
                </Td>
              </Tr>
            ) : pigs.length === 0 ? (
              <Tr>
                <Td colSpan={8} className="text-center py-12 text-slate-400">
                  <p className="text-sm font-semibold text-slate-700">No se encontraron animales registrados</p>
                  <p className="text-xs text-slate-500 mt-1">Haga clic en "Registrar Animal" para ingresar el primero.</p>
                </Td>
              </Tr>
            ) : (
              pigs.map((p) => (
                <Tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <Td>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{p.identificationCode}</span>
                    </div>
                    {p.electronicId && (
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">RFID: {p.electronicId}</p>
                    )}
                  </Td>
                  <Td>
                    <div className="space-y-1">
                      {getSexBadge(p.sex)}
                      <p className="text-xs font-semibold text-slate-700">{p.breed}</p>
                      {p.geneticLine && <p className="text-[10px] text-slate-400">{p.geneticLine}</p>}
                    </div>
                  </Td>
                  <Td>
                    <div className="text-xs space-y-0.5">
                      <p className="text-slate-600">
                        <span className="font-semibold text-slate-400">P:</span> {p.sireCode || <span className="text-slate-400 italic">Desc.</span>}
                      </p>
                      <p className="text-slate-600">
                        <span className="font-semibold text-slate-400">M:</span> {p.damCode || <span className="text-slate-400 italic">Desc.</span>}
                      </p>
                    </div>
                  </Td>
                  <Td>
                    {p.penCode ? (
                      <div>
                        <span className="font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {p.penCode}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{p.shedName} • {p.areaName}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sin ubicación</span>
                    )}
                  </Td>
                  <Td>
                    <div className="text-xs">
                      <p className="font-semibold text-slate-800">{p.ageInDays} días ({Math.round(p.ageInDays / 30)}m)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {p.currentWeightKg ? (
                          <span className="text-emerald-600 font-bold">{p.currentWeightKg} kg</span>
                        ) : (
                          <span className="text-slate-400 italic">Sin pesajes</span>
                        )}
                      </p>
                    </div>
                  </Td>
                  <Td>
                    <span className="text-xs font-medium text-slate-700">{p.reproductiveStatusName}</span>
                    {p.parity > 0 && <p className="text-[10px] text-slate-400">{p.parity} partos</p>}
                  </Td>
                  <Td>{getStatusBadge(p.status)}</Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Ver Ficha Técnica"
                        onClick={() => navigate(`/pigs/${p.id}`)}
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Trasladar de Corral"
                        onClick={() => setMovingPig(p)}
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-sky-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Editar"
                        onClick={() => setEditingPig(p)}
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Eliminar"
                        onClick={() => setDeletingPig(p)}
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
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Mostrando página {pageIndex} de {totalPages} ({totalCount} animales)</span>
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
      <PigModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data);
        }}
        farmId={activeFarm.farmId}
        isLoading={createMutation.isPending}
      />

      {editingPig && (
        <PigModal
          isOpen={!!editingPig}
          onClose={() => setEditingPig(null)}
          onSubmit={async (data) => {
            await updateMutation.mutateAsync({ id: editingPig.id, data });
          }}
          pig={editingPig}
          farmId={activeFarm.farmId}
          isLoading={updateMutation.isPending}
        />
      )}

      {movingPig && (
        <PigMovementModal
          isOpen={!!movingPig}
          onClose={() => setMovingPig(null)}
          onSubmit={async (data) => {
            await moveMutation.mutateAsync({ id: movingPig.id, data });
          }}
          pig={movingPig}
          farmId={activeFarm.farmId}
          isLoading={moveMutation.isPending}
        />
      )}

      {deletingPig && (
        <ConfirmDialog
          isOpen={!!deletingPig}
          onClose={() => setDeletingPig(null)}
          onConfirm={() => deleteMutation.mutate(deletingPig.id)}
          title="¿Eliminar Animal del Registro?"
          message={`¿Confirma que desea eliminar el registro del animal con arete "${deletingPig.identificationCode}"?`}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};
