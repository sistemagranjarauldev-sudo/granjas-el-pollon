import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { farmStructureService } from './farmStructureService';
import { useAuth } from '../auth/AuthContext';
import { Farm } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { FarmModal } from './FarmModal';
import { FarmConfigModal } from './FarmConfigModal';
import { Plus, Edit2, Trash2, Sliders, CheckCircle, Search } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { formatNumber } from '../../utils/formatters';

export const FarmsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeFarm, setActiveFarm } = useAuth();
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;

  // Modals state
  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['farms', pageIndex, search],
    queryFn: () => farmStructureService.getFarms(pageIndex, pageSize, search),
  });

  const createMutation = useMutation({
    mutationFn: (newFarm: any) => farmStructureService.createFarm(newFarm),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['farms'] }),
  });

  const updateMutation = useMutation({
    mutationFn: (updated: any) => farmStructureService.updateFarm(selectedFarm!.id, updated),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['farms'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => farmStructureService.deleteFarm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farms'] });
      setIsDeleteOpen(false);
    },
  });

  const handleSaveFarm = async (formData: any) => {
    if (selectedFarm) {
      await updateMutation.mutateAsync(formData);
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const columns: Column<Farm>[] = [
    {
      header: 'Granja',
      cell: (farm) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs ring-1 ring-emerald-200">
            {farm.code.substring(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{farm.name}</span>
              {activeFarm?.farmId === farm.id && (
                <Badge variant="brand" className="text-[10px] py-0 px-1.5">
                  Activa
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono">{farm.code}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Ubicación / Fiscal',
      cell: (farm) => (
        <div className="text-xs">
          <p className="text-slate-700 font-medium">{farm.location || '—'}</p>
          <p className="text-slate-400 text-[11px]">{farm.taxId ? `RIF/Tax: ${farm.taxId}` : 'Sin ID fiscal'}</p>
        </div>
      ),
    },
    {
      header: 'Capacidad & Ocupación',
      cell: (farm) => {
        const percent = farm.totalCapacity > 0 ? Math.round((farm.currentOccupancy / farm.totalCapacity) * 100) : 0;
        return (
          <div className="w-36 space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>{formatNumber(farm.currentOccupancy)} cabezas</span>
              <span className="text-slate-400">{percent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  percent > 90 ? 'bg-rose-500' : percent > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, percent)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Estructura',
      cell: (farm) => (
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span><strong className="text-slate-900">{farm.totalAreas}</strong> áreas</span>
          <span>•</span>
          <span><strong className="text-slate-900">{farm.totalSheds}</strong> galpones</span>
          <span>•</span>
          <span><strong className="text-slate-900">{farm.totalPens}</strong> corrales</span>
        </div>
      ),
    },
    {
      header: 'Estado',
      cell: (farm) => (
        <Badge variant={farm.isActive ? 'success' : 'neutral'} dot>
          {farm.isActive ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      className: 'text-right',
      cell: (farm) => (
        <div className="flex items-center justify-end gap-1.5">
          {activeFarm?.farmId !== farm.id && (
            <Button
              variant="outline"
              size="sm"
              title="Establecer como granja de trabajo activa"
              onClick={() => setActiveFarm({ farmId: farm.id, farmCode: farm.code, farmName: farm.name, isDefault: false })}
              icon={<CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
            >
              Usar
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            title="Parámetros Zootécnicos"
            onClick={() => {
              setSelectedFarm(farm);
              setIsConfigOpen(true);
            }}
            icon={<Sliders className="w-4 h-4 text-slate-600" />}
          />

          <Button
            variant="ghost"
            size="sm"
            title="Editar Granja"
            onClick={() => {
              setSelectedFarm(farm);
              setIsFarmModalOpen(true);
            }}
            icon={<Edit2 className="w-4 h-4 text-slate-600" />}
          />

          <Button
            variant="ghost"
            size="sm"
            title="Eliminar Granja"
            onClick={() => {
              setSelectedFarm(farm);
              setIsDeleteOpen(true);
            }}
            icon={<Trash2 className="w-4 h-4 text-rose-600" />}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestión de Granjas</h1>
          <p className="text-xs text-slate-500 mt-1">
            Administración centralizada de unidades productivas porcinas
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setSelectedFarm(null);
            setIsFarmModalOpen(true);
          }}
        >
          Nueva Granja
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 max-w-md">
        <Input
          placeholder="Buscar por nombre o código..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPageIndex(1);
          }}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={data?.data?.items || []}
        isLoading={isLoading}
        emptyMessage="No se encontraron granjas registradas."
        pagination={{
          pageIndex: data?.data?.pageIndex || 1,
          pageSize: data?.data?.pageSize || 10,
          totalCount: data?.data?.totalCount || 0,
          totalPages: data?.data?.totalPages || 1,
          hasPreviousPage: data?.data?.hasPreviousPage || false,
          hasNextPage: data?.data?.hasNextPage || false,
          onPageChange: (p) => setPageIndex(p),
        }}
      />

      {/* Modals */}
      <FarmModal
        isOpen={isFarmModalOpen}
        onClose={() => setIsFarmModalOpen(false)}
        onSubmit={handleSaveFarm}
        farm={selectedFarm}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {selectedFarm && (
        <FarmConfigModal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          farmId={selectedFarm.id}
          farmName={selectedFarm.name}
        />
      )}

      {selectedFarm && (
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={() => deleteMutation.mutate(selectedFarm.id)}
          title="¿Eliminar Granja?"
          message={`¿Está seguro de que desea eliminar la granja "${selectedFarm.name}" (${selectedFarm.code})? Esta acción se registrará en auditoría.`}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};
