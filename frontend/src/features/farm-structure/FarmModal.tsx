import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Farm } from '../../types';

const farmSchema = z.object({
  code: z.string().min(2, 'El código debe tener al menos 2 caracteres').max(50),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(150),
  legalName: z.string().optional(),
  taxId: z.string().optional(),
  location: z.string().optional(),
  totalCapacity: z.coerce.number().min(0, 'La capacidad no puede ser negativa'),
});

type FarmFormData = z.infer<typeof farmSchema>;

export interface FarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FarmFormData) => Promise<void>;
  farm?: Farm | null;
  isLoading?: boolean;
}

export const FarmModal: React.FC<FarmModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  farm,
  isLoading,
}) => {
  const isEditing = !!farm;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FarmFormData>({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      code: '',
      name: '',
      legalName: '',
      taxId: '',
      location: '',
      totalCapacity: 0,
    },
  });

  useEffect(() => {
    if (farm) {
      reset({
        code: farm.code,
        name: farm.name,
        legalName: farm.legalName || '',
        taxId: farm.taxId || '',
        location: farm.location || '',
        totalCapacity: farm.totalCapacity,
      });
    } else {
      reset({
        code: '',
        name: '',
        legalName: '',
        taxId: '',
        location: '',
        totalCapacity: 0,
      });
    }
  }, [farm, reset, isOpen]);

  const handleFormSubmit = async (data: FarmFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Granja' : 'Nueva Granja Porcina'}
      description={isEditing ? 'Modifique los datos maestros de la granja' : 'Registre una nueva unidad productiva'}
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit(handleFormSubmit)} isLoading={isLoading}>
            {isEditing ? 'Guardar Cambios' : 'Crear Granja'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Código de Granja"
            placeholder="ej. GRA-NORTE"
            disabled={isEditing}
            error={errors.code?.message}
            {...register('code')}
          />
          <Input
            label="Nombre de la Granja"
            placeholder="ej. Granja La Esperanza"
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Razón Social (Opcional)"
            placeholder="ej. Agropecuaria del Sur S.A."
            error={errors.legalName?.message}
            {...register('legalName')}
          />
          <Input
            label="Identificador Fiscal / RIF / RFC"
            placeholder="ej. J-12345678-0"
            error={errors.taxId?.message}
            {...register('taxId')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Ubicación / Dirección"
            placeholder="ej. Km 45 Carretera Nacional"
            error={errors.location?.message}
            {...register('location')}
          />
          <Input
            label="Capacidad Máxima Teórica"
            type="number"
            placeholder="5000"
            error={errors.totalCapacity?.message}
            {...register('totalCapacity')}
          />
        </div>
      </form>
    </Modal>
  );
};
