import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Shed } from '../../types';

const shedSchema = z.object({
  code: z.string().min(1, 'El código es obligatorio').max(50),
  name: z.string().min(2, 'El nombre es obligatorio').max(100),
  ventilationType: z.coerce.number().min(1),
  totalCapacity: z.coerce.number().min(0),
});

type ShedFormData = z.infer<typeof shedSchema>;

export interface ShedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ShedFormData) => Promise<void>;
  shed?: Shed | null;
  areaId: string;
  isLoading?: boolean;
}

export const ShedModal: React.FC<ShedModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  shed,
  areaId,
  isLoading,
}) => {
  const isEditing = !!shed;
  const [serverError, setServerError] = useState<string | null>(null);

  const ventilationOptions = [
    { value: 1, label: 'Ventilación Natural (Cortinas)' },
    { value: 2, label: 'Túnel de Viento (Extractores + Paneles evaporativos)' },
    { value: 3, label: 'Presión Negativa / Climatizado' },
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShedFormData>({
    resolver: zodResolver(shedSchema),
    defaultValues: {
      code: '',
      name: '',
      ventilationType: 1,
      totalCapacity: 0,
    },
  });

  useEffect(() => {
    setServerError(null);
    if (shed) {
      reset({
        code: shed.code,
        name: shed.name,
        ventilationType: shed.ventilationType,
        totalCapacity: shed.totalCapacity,
      });
    } else {
      reset({
        code: '',
        name: '',
        ventilationType: 1,
        totalCapacity: 0,
      });
    }
  }, [shed, reset, isOpen]);

  const handleFormSubmit = async (data: ShedFormData) => {
    try {
      setServerError(null);
      await onSubmit({ ...data, areaId } as any);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.detail || err?.message || 'Error al guardar el galpón. Verifique los datos.';
      setServerError(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Galpón / Nave' : 'Nuevo Galpón / Nave'}
      description="Estructura física techada dentro del área seleccionada"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit(handleFormSubmit)} isLoading={isLoading}>
            {isEditing ? 'Guardar Cambios' : 'Crear Galpón'}
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
            label="Código del Galpón"
            placeholder="ej. GAL-01"
            disabled={isEditing}
            error={errors.code?.message}
            {...register('code')}
          />
          <Input
            label="Nombre del Galpón"
            placeholder="ej. Galpón Gestación 1"
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        <Select
          label="Sistema de Ventilación / Climatización"
          options={ventilationOptions}
          error={errors.ventilationType?.message}
          {...register('ventilationType')}
        />

        <Input
          label="Capacidad Nominal Máxima (Cabezas)"
          type="number"
          placeholder="ej. 500"
          error={errors.totalCapacity?.message}
          {...register('totalCapacity')}
        />
      </form>
    </Modal>
  );
};
