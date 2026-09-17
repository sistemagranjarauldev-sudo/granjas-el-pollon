import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { farmStructureService } from '../farm-structure/farmStructureService';
import { Batch, BatchStage, BatchStatus } from '../../types';

const batchSchema = z.object({
  code: z.string().min(1, 'El código es obligatorio').max(50),
  name: z.string().min(2, 'El nombre descriptivo es obligatorio').max(150),
  stage: z.coerce.number().min(1, 'Seleccione una etapa productiva'),
  startDate: z.string().min(1, 'La fecha de inicio es obligatoria'),
  initialQuantity: z.coerce.number().min(1, 'La cantidad inicial debe ser al menos 1'),
  initialWeightKg: z.coerce.number().optional(),
  currentPenId: z.string().optional(),
  status: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type BatchFormData = z.infer<typeof batchSchema>;

export interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  batch?: Batch | null;
  farmId: string;
  isLoading?: boolean;
}

export const BatchModal: React.FC<BatchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  batch,
  farmId,
  isLoading,
}) => {
  const isEditing = !!batch;
  const [serverError, setServerError] = useState<string | null>(null);

  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [selectedShedId, setSelectedShedId] = useState<string>('');

  const { data: areasData } = useQuery({
    queryKey: ['areas', farmId],
    queryFn: () => farmStructureService.getAreasByFarm(farmId),
    enabled: isOpen && !!farmId,
  });

  const { data: shedsData } = useQuery({
    queryKey: ['sheds', selectedAreaId],
    queryFn: () => farmStructureService.getShedsByArea(selectedAreaId),
    enabled: !!selectedAreaId,
  });

  const { data: pensData } = useQuery({
    queryKey: ['pens', selectedShedId],
    queryFn: () => farmStructureService.getPensByShed(selectedShedId),
    enabled: !!selectedShedId,
  });

  const stageOptions = [
    { value: BatchStage.Nursery, label: 'Destete / Transición (Nursery)' },
    { value: BatchStage.Grower, label: 'Crecimiento / Desarrollo' },
    { value: BatchStage.Finisher, label: 'Cebo / Engorde Final' },
    { value: BatchStage.ReplacementGilt, label: 'Reemplazo de Primerizas' },
    { value: BatchStage.Lactation, label: 'Lactancia (Maternidad)' },
  ];

  const statusOptions = [
    { value: BatchStatus.Active, label: 'Activo' },
    { value: BatchStatus.Closed, label: 'Cerrado / Liquidado' },
    { value: BatchStatus.Sold, label: 'Vendido' },
    { value: BatchStatus.Transferred, label: 'Transferido' },
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      code: '',
      name: '',
      stage: BatchStage.Nursery,
      startDate: new Date().toISOString().split('T')[0],
      initialQuantity: 30,
      initialWeightKg: undefined,
      currentPenId: '',
      status: BatchStatus.Active,
      notes: '',
    },
  });

  useEffect(() => {
    setServerError(null);
    if (batch) {
      reset({
        code: batch.code,
        name: batch.name,
        stage: batch.stage,
        startDate: batch.startDate.split('T')[0],
        initialQuantity: batch.initialQuantity,
        initialWeightKg: batch.initialWeightKg,
        currentPenId: batch.currentPenId || '',
        status: batch.status,
        notes: batch.notes || '',
      });
    } else {
      reset({
        code: '',
        name: '',
        stage: BatchStage.Nursery,
        startDate: new Date().toISOString().split('T')[0],
        initialQuantity: 30,
        initialWeightKg: undefined,
        currentPenId: '',
        status: BatchStatus.Active,
        notes: '',
      });
    }
  }, [batch, reset, isOpen]);

  const handleFormSubmit = async (data: BatchFormData) => {
    try {
      setServerError(null);
      const payload = {
        ...data,
        farmId,
        currentPenId: data.currentPenId ? data.currentPenId : null,
      };
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.detail || err?.message || 'Error al guardar el lote.';
      setServerError(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Lote de Producción' : 'Nuevo Lote de Producción'}
      description="Población grupal de cerdos en etapas de transición, recría o engorde"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit(handleFormSubmit)} isLoading={isLoading}>
            {isEditing ? 'Guardar Cambios' : 'Crear Lote'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
        {serverError && <Alert type="error">{serverError}</Alert>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Código del Lote"
            placeholder="ej. LOT-2026-W12"
            disabled={isEditing}
            error={errors.code?.message}
            {...register('code')}
          />
          <Input
            label="Nombre Descriptivo"
            placeholder="ej. Lote Destete Sala B"
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Etapa Productiva"
            options={stageOptions}
            error={errors.stage?.message}
            {...register('stage')}
          />
          <Input
            label="Fecha de Inicio"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Cantidad Inicial (Cabezas)"
            type="number"
            disabled={isEditing}
            placeholder="ej. 35"
            error={errors.initialQuantity?.message}
            {...register('initialQuantity')}
          />
          <Input
            label="Peso Total al Ingreso (kg)"
            type="number"
            step="0.1"
            disabled={isEditing}
            placeholder="ej. 210.5"
            error={errors.initialWeightKg?.message}
            {...register('initialWeightKg')}
          />
        </div>

        {!isEditing && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
              Ubicación Inicial (Corral)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                className="block w-full rounded-lg border border-slate-300 text-xs py-2 px-2 bg-white"
                value={selectedAreaId}
                onChange={(e) => {
                  setSelectedAreaId(e.target.value);
                  setSelectedShedId('');
                }}
              >
                <option value="">1. Área</option>
                {areasData?.data?.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>

              <select
                className="block w-full rounded-lg border border-slate-300 text-xs py-2 px-2 bg-white"
                value={selectedShedId}
                onChange={(e) => setSelectedShedId(e.target.value)}
                disabled={!selectedAreaId}
              >
                <option value="">2. Galpón</option>
                {shedsData?.data?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <select
                className="block w-full rounded-lg border border-slate-300 text-xs py-2 px-2 bg-white"
                disabled={!selectedShedId}
                {...register('currentPenId')}
              >
                <option value="">3. Corral</option>
                {pensData?.data?.map((p) => (
                  <option key={p.id} value={p.id}>{p.code} (Libre: {p.availableCapacity})</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {isEditing && (
          <Select
            label="Estado del Lote"
            options={statusOptions}
            error={errors.status?.message}
            {...register('status')}
          />
        )}

        <Input
          label="Observaciones"
          placeholder="Procedencia, notas sanitarias..."
          error={errors.notes?.message}
          {...register('notes')}
        />
      </form>
    </Modal>
  );
};
