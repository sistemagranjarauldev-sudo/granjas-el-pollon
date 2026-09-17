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
import { Pig } from '../../types';

const moveSchema = z.object({
  targetPenId: z.string().min(1, 'Seleccione el corral de destino'),
  reason: z.string().min(2, 'El motivo del traslado es obligatorio'),
  notes: z.string().optional(),
});

type MoveFormData = z.infer<typeof moveSchema>;

export interface PigMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MoveFormData) => Promise<void>;
  pig: Pig | null;
  farmId: string;
  isLoading?: boolean;
}

export const PigMovementModal: React.FC<PigMovementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  pig,
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
  } = useForm<MoveFormData>({
    resolver: zodResolver(moveSchema),
    defaultValues: {
      targetPenId: '',
      reason: 'Traslado por cambio de etapa',
      notes: '',
    },
  });

  const handleFormSubmit = async (data: MoveFormData) => {
    try {
      setServerError(null);
      await onSubmit(data);
      reset();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.detail || err?.message || 'Error al realizar el traslado.';
      setServerError(msg);
    }
  };

  if (!pig) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Trasladar Animal: ${pig.identificationCode}`}
      description="Mover de su corral actual a una nueva ubicación física"
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
            {pig.penCode ? `${pig.penCode} (${pig.shedName || 'Galpón'} - ${pig.areaName || 'Área'})` : 'Sin Corral Asignado'}
          </span>
        </div>

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
                ?.filter((p) => p.id !== pig.currentPenId)
                ?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} ({p.currentOccupancy}/{p.maxCapacity})
                  </option>
                ))}
            </select>
          </div>
          {errors.targetPenId && <p className="text-xs text-rose-600 font-medium">{errors.targetPenId.message}</p>}
        </div>

        <Input
          label="Motivo del Traslado"
          placeholder="ej. Traslado a Maternidad para parto, Traslado a Gestación..."
          error={errors.reason?.message}
          {...register('reason')}
        />

        <Input
          label="Notas Adicionales (Opcional)"
          placeholder="Condiciones del animal, operario responsable..."
          error={errors.notes?.message}
          {...register('notes')}
        />
      </form>
    </Modal>
  );
};
