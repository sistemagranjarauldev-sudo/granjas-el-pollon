import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Pen, PenType, PenStatus } from '../../types';

const penSchema = z.object({
  code: z.string().min(1, 'El código es obligatorio').max(50),
  penType: z.coerce.number().min(1, 'Seleccione un tipo de corral'),
  maxCapacity: z.coerce.number().min(1, 'La capacidad mínima es 1'),
  dimensionsM2: z.coerce.number().optional(),
  status: z.coerce.number().optional(),
});

type PenFormData = z.infer<typeof penSchema>;

export interface PenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PenFormData) => Promise<void>;
  pen?: Pen | null;
  shedId: string;
  isLoading?: boolean;
}

export const PenModal: React.FC<PenModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  pen,
  shedId,
  isLoading,
}) => {
  const isEditing = !!pen;
  const [serverError, setServerError] = useState<string | null>(null);

  const penTypeOptions = [
    { value: PenType.IndividualGestationCrate, label: 'Jaula Individual de Gestación' },
    { value: PenType.GroupGestationPen, label: 'Corral Grupal de Gestación' },
    { value: PenType.FarrowingCrate, label: 'Jaula de Maternidad / Paridera' },
    { value: PenType.NurseryPen, label: 'Corral de Destete / Recría' },
    { value: PenType.GrowerFinisherPen, label: 'Corral de Crecimiento / Ceba' },
    { value: PenType.BoarPen, label: 'Corral de Verraco' },
    { value: PenType.HospitalPen, label: 'Corral Hospital' },
    { value: PenType.QuarantinePen, label: 'Corral de Cuarentena' },
  ];

  const statusOptions = [
    { value: PenStatus.Empty, label: 'Vacío (Disponible)' },
    { value: PenStatus.Occupied, label: 'Ocupado' },
    { value: PenStatus.Maintenance, label: 'En Mantenimiento' },
    { value: PenStatus.Sanitizing, label: 'En Sanitización / Vacío Sanitario' },
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PenFormData>({
    resolver: zodResolver(penSchema),
    defaultValues: {
      code: '',
      penType: PenType.IndividualGestationCrate,
      maxCapacity: 1,
      dimensionsM2: undefined,
      status: PenStatus.Empty,
    },
  });

  useEffect(() => {
    setServerError(null);
    if (pen) {
      reset({
        code: pen.code,
        penType: pen.penType,
        maxCapacity: pen.maxCapacity,
        dimensionsM2: pen.dimensionsM2,
        status: pen.status,
      });
    } else {
      reset({
        code: '',
        penType: PenType.IndividualGestationCrate,
        maxCapacity: 1,
        dimensionsM2: undefined,
        status: PenStatus.Empty,
      });
    }
  }, [pen, reset, isOpen]);

  const handleFormSubmit = async (data: PenFormData) => {
    try {
      setServerError(null);
      await onSubmit({ ...data, shedId } as any);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.detail || err?.message || 'Error al guardar el corral. Verifique los datos.';
      setServerError(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Corral / Jaula' : 'Nuevo Corral / Jaula'}
      description="Unidad mínima de alojamiento físico para cerdos o lotes"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit(handleFormSubmit)} isLoading={isLoading}>
            {isEditing ? 'Guardar Cambios' : 'Crear Corral'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
        {serverError && (
          <Alert type="error">{serverError}</Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Código / Identificador"
            placeholder="ej. JAU-001 ó COR-12"
            disabled={isEditing}
            error={errors.code?.message}
            {...register('code')}
          />
          <Select
            label="Tipo de Alojamiento"
            options={penTypeOptions}
            error={errors.penType?.message}
            {...register('penType')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Capacidad Máxima (Animales)"
            type="number"
            placeholder="ej. 1 (jaula) o 25 (corral)"
            error={errors.maxCapacity?.message}
            {...register('maxCapacity')}
          />
          <Input
            label="Dimensiones (m²)"
            type="number"
            step="0.1"
            placeholder="ej. 3.5"
            error={errors.dimensionsM2?.message}
            {...register('dimensionsM2')}
          />
        </div>

        {isEditing && (
          <Select
            label="Estado Operativo / Sanitario"
            options={statusOptions}
            error={errors.status?.message}
            {...register('status')}
          />
        )}
      </form>
    </Modal>
  );
};
