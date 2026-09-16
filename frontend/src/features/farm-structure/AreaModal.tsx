import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Area, AreaType } from '../../types';

const areaSchema = z.object({
  code: z.string().min(1, 'El código es obligatorio').max(50),
  name: z.string().min(2, 'El nombre es obligatorio').max(100),
  areaType: z.coerce.number().min(1, 'Seleccione un tipo de área'),
  description: z.string().optional(),
});

type AreaFormData = z.infer<typeof areaSchema>;

export interface AreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AreaFormData) => Promise<void>;
  area?: Area | null;
  farmId: string;
  isLoading?: boolean;
}

export const AreaModal: React.FC<AreaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  area,
  farmId,
  isLoading,
}) => {
  const isEditing = !!area;

  const areaTypeOptions = [
    { value: AreaType.Gestation, label: 'Gestación' },
    { value: AreaType.Maternity, label: 'Maternidad / Lactancia' },
    { value: AreaType.Nursery, label: 'Destete / Transición / Recría' },
    { value: AreaType.Finishing, label: 'Crecimiento y Cebo / Engorde' },
    { value: AreaType.GiltDevelopment, label: 'Desarrollo de Primerizas' },
    { value: AreaType.BoarStud, label: 'Centro de Inseminación / Verracos' },
    { value: AreaType.Quarantine, label: 'Cuarentena y Bioseguridad' },
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AreaFormData>({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      code: '',
      name: '',
      areaType: AreaType.Gestation,
      description: '',
    },
  });

  useEffect(() => {
    if (area) {
      reset({
        code: area.code,
        name: area.name,
        areaType: area.areaType,
        description: area.description || '',
      });
    } else {
      reset({
        code: '',
        name: '',
        areaType: AreaType.Gestation,
        description: '',
      });
    }
  }, [area, reset, isOpen]);

  const handleFormSubmit = async (data: AreaFormData) => {
    await onSubmit({ ...data, farmId } as any);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Área de Producción' : 'Nueva Área de Producción'}
      description="División macro de la granja según la etapa biológica o zootécnica"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit(handleFormSubmit)} isLoading={isLoading}>
            {isEditing ? 'Guardar Cambios' : 'Crear Área'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Código de Área"
            placeholder="ej. AREA-MAT"
            disabled={isEditing}
            error={errors.code?.message}
            {...register('code')}
          />
          <Input
            label="Nombre del Área"
            placeholder="ej. Maternidad 1"
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        <Select
          label="Tipo Zootécnico de Área"
          options={areaTypeOptions}
          error={errors.areaType?.message}
          {...register('areaType')}
        />

        <Input
          label="Descripción u Observaciones"
          placeholder="Notas operativas del área"
          error={errors.description?.message}
          {...register('description')}
        />
      </form>
    </Modal>
  );
};
