import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { farmStructureService } from '../farm-structure/farmStructureService';
import { Batch } from '../../types';

const moveBatchSchema = z.object({
  targetPenId: z.string().min(1, 'Seleccione el corral de destino'),
  quantity: z.coerce.number().min(1, 'La cantidad debe ser al menos 1'),
  reason: z.string().min(2, 'El motivo del traslado es obligatorio'),
  notes: z.string().optional(),
});

type MoveBatchFormData = z.infer<typeof moveBatchSchema>;

export interface BatchMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MoveBatchFormData) => Promise<void>;
  batch: Batch | null;
  farmId: string;
  isLoading?: boolean;
}

export const BatchMovementModal: React.FC<BatchMovementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  batch,
  farmId,
  isLoading,
}) => {
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MoveBatchFormData>({
    resolver: zodResolver(moveBatchSchema),
    defaultValues: {
      targetPenId: '',
      quantity: batch?.currentQuantity || 1,
      reason: 'Pase a etapa de crecimiento / engorde',
      notes: '',
    },
  });

  const handleFormSubmit = async (data: MoveBatchFormData) => {
    try {
      setServerError(null);
      await onSubmit(data);
      reset();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.detail || err?.message || 'Error al trasladar el lote.';
      setServerError(msg);
    }
  };

  if (!batch) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Trasladar Lote: ${batch.code} (${batch.name})`}
      description={`Saldo actual del lote: ${batch.currentQuantity} animales vivos`}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit(handleFormSubmit)} isLoading={isLoading}>
            Confirmar Traslado
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
        {serverError && <Alert type="error">{serverError}</Alert>}

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex justify-between">
          <span>Ubicación Actual:</span>
          <span className="font-bold text-slate-800">
            {batch.penCode ? `${batch.penCode} (${batch.shedName || 'Galpón'} - ${batch.areaName || 'Área'})` : 'Sin Corral Asignado'}
          </span>
        </div>

        <Input
          label="Cantidad de Animales a Mover"
          type="number"
          placeholder={`Máximo ${batch.currentQuantity}`}
          error={errors.quantity?.message}
          {...register('quantity')}
        />

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
            Corral de Destino
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
              <option value="">1. Área Destino</option>
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
              {...register('targetPenId')}
            >
              <option value="">3. Corral</option>
              {pensData?.data
                ?.filter((p) => p.id !== batch.currentPenId)
                ?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} (Libre: {p.availableCapacity})
                  </option>
                ))}
            </select>
          </div>
          {errors.targetPenId && <p className="text-xs text-rose-600 font-medium">{errors.targetPenId.message}</p>}
        </div>

        <Input
          label="Motivo del Traslado"
          placeholder="ej. Traslado por finalización de destete, Pase a engorde..."
          error={errors.reason?.message}
          {...register('reason')}
        />

        <Input
          label="Notas Adicionales (Opcional)"
          placeholder="Observaciones de bioseguridad, lote..."
          error={errors.notes?.message}
          {...register('notes')}
        />
      </form>
    </Modal>
  );
};
