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
import { pigsService } from './pigsService';
import { farmStructureService } from '../farm-structure/farmStructureService';
import { Pig, PigSex, PigEntryType, ReproductiveStatus, Area, Shed, Pen } from '../../types';

const pigSchema = z.object({
  identificationCode: z.string().min(1, 'El arete/código es obligatorio').max(50),
  electronicId: z.string().optional(),
  sex: z.coerce.number().min(1, 'Seleccione el sexo'),
  breed: z.string().min(2, 'La raza es obligatoria').max(100),
  geneticLine: z.string().optional(),
  birthDate: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
  entryDate: z.string().min(1, 'La fecha de ingreso es obligatoria'),
  entryType: z.coerce.number().min(1),
  sireId: z.string().optional(),
  damId: z.string().optional(),
  currentPenId: z.string().optional(),
  reproductiveStatus: z.coerce.number().min(1),
  notes: z.string().optional(),
});

type PigFormData = z.infer<typeof pigSchema>;

export interface PigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  pig?: Pig | null;
  farmId: string;
  isLoading?: boolean;
}

export const PigModal: React.FC<PigModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  pig,
  farmId,
  isLoading,
}) => {
  const isEditing = !!pig;
  const [serverError, setServerError] = useState<string | null>(null);

  // Queries para padres/madres disponibles y corrales
  const { data: siresData } = useQuery({
    queryKey: ['breeding-sires', farmId],
    queryFn: () => pigsService.getAvailableBreedingPigs(PigSex.Male),
    enabled: isOpen && !!farmId,
  });

  const { data: damsData } = useQuery({
    queryKey: ['breeding-dams', farmId],
    queryFn: () => pigsService.getAvailableBreedingPigs(PigSex.Female),
    enabled: isOpen && !!farmId,
  });

  const { data: areasData } = useQuery({
    queryKey: ['areas', farmId],
    queryFn: () => farmStructureService.getAreasByFarm(farmId),
    enabled: isOpen && !!farmId,
  });

  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [selectedShedId, setSelectedShedId] = useState<string>('');

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

  const sexOptions = [
    { value: PigSex.Female, label: 'Hembra (Reproductora / Primeriza)' },
    { value: PigSex.Male, label: 'Macho (Verraco Reproductor)' },
    { value: PigSex.CastratedMale, label: 'Macho Castrado (Cebón)' },
  ];

  const entryTypeOptions = [
    { value: PigEntryType.BornInFarm, label: 'Nacido en la Granja' },
    { value: PigEntryType.Purchased, label: 'Comprado de Cabaña Externa' },
    { value: PigEntryType.Transferred, label: 'Trasladado de otra Granja' },
  ];

  const reproStatusOptions = [
    { value: ReproductiveStatus.Gilt, label: 'Primeriza (Nulípara)' },
    { value: ReproductiveStatus.Open, label: 'Vacía / En espera de servicio' },
    { value: ReproductiveStatus.Inseminated, label: 'Inseminada / Servida' },
    { value: ReproductiveStatus.Pregnant, label: 'Gestante Confirmada' },
    { value: ReproductiveStatus.Lactating, label: 'Lactante (En Maternidad)' },
    { value: ReproductiveStatus.Dry, label: 'Seca / Destetada' },
  ];

  const sireOptions = [
    { value: '', label: 'Sin padre registrado / Desconocido' },
    ...(siresData?.data?.map((s: Pig) => ({ value: s.id, label: `${s.identificationCode} (${s.breed})` })) || []),
  ];

  const damOptions = [
    { value: '', label: 'Sin madre registrada / Desconocida' },
    ...(damsData?.data?.map((d: Pig) => ({ value: d.id, label: `${d.identificationCode} (${d.breed})` })) || []),
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PigFormData>({
    resolver: zodResolver(pigSchema),
    defaultValues: {
      identificationCode: '',
      electronicId: '',
      sex: PigSex.Female,
      breed: 'Landrace x Large White',
      geneticLine: '',
      birthDate: new Date().toISOString().split('T')[0],
      entryDate: new Date().toISOString().split('T')[0],
      entryType: PigEntryType.BornInFarm,
      sireId: '',
      damId: '',
      currentPenId: '',
      reproductiveStatus: ReproductiveStatus.Gilt,
      notes: '',
    },
  });

  useEffect(() => {
    setServerError(null);
    if (pig) {
      reset({
        identificationCode: pig.identificationCode,
        electronicId: pig.electronicId || '',
        sex: pig.sex,
        breed: pig.breed,
        geneticLine: pig.geneticLine || '',
        birthDate: pig.birthDate.split('T')[0],
        entryDate: pig.entryDate.split('T')[0],
        entryType: pig.entryType,
        sireId: pig.sireId || '',
        damId: pig.damId || '',
        currentPenId: pig.currentPenId || '',
        reproductiveStatus: pig.reproductiveStatus,
        notes: pig.notes || '',
      });
    } else {
      reset({
        identificationCode: '',
        electronicId: '',
        sex: PigSex.Female,
        breed: 'Camborough',
        geneticLine: 'PIC',
        birthDate: new Date().toISOString().split('T')[0],
        entryDate: new Date().toISOString().split('T')[0],
        entryType: PigEntryType.BornInFarm,
        sireId: '',
        damId: '',
        currentPenId: '',
        reproductiveStatus: ReproductiveStatus.Gilt,
        notes: '',
      });
    }
  }, [pig, reset, isOpen]);

  const handleFormSubmit = async (data: PigFormData) => {
    try {
      setServerError(null);
      const payload = {
        ...data,
        farmId,
        sireId: data.sireId ? data.sireId : null,
        damId: data.damId ? data.damId : null,
        currentPenId: data.currentPenId ? data.currentPenId : null,
      };
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.detail || err?.message || 'Error al guardar el animal. Verifique los datos.';
      setServerError(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Ficha de Animal' : 'Registrar Nuevo Animal'}
      description="Ficha individual del reproductor o animal del plantel"
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit(handleFormSubmit)} isLoading={isLoading}>
            {isEditing ? 'Guardar Cambios' : 'Registrar Animal'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
        {serverError && <Alert type="error">{serverError}</Alert>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Código / Arete"
            placeholder="ej. CER-1045"
            disabled={isEditing}
            error={errors.identificationCode?.message}
            {...register('identificationCode')}
          />
          <Input
            label="RFID / Chip (Opcional)"
            placeholder="ej. 982000412389"
            error={errors.electronicId?.message}
            {...register('electronicId')}
          />
          <Select
            label="Sexo"
            options={sexOptions}
            disabled={isEditing}
            error={errors.sex?.message}
            {...register('sex')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Raza o Genética"
            placeholder="ej. Landrace, Large White, Pietrain"
            error={errors.breed?.message}
            {...register('breed')}
          />
          <Input
            label="Línea Comercial (Opcional)"
            placeholder="ej. Camborough, DanBred, Hypor"
            error={errors.geneticLine?.message}
            {...register('geneticLine')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Fecha de Nacimiento"
            type="date"
            error={errors.birthDate?.message}
            {...register('birthDate')}
          />
          <Input
            label="Fecha de Ingreso"
            type="date"
            error={errors.entryDate?.message}
            {...register('entryDate')}
          />
          <Select
            label="Tipo de Ingreso"
            options={entryTypeOptions}
            error={errors.entryType?.message}
            {...register('entryType')}
          />
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Genealogía (Padre y Madre)</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Padre (Verraco Macho)"
              options={sireOptions}
              error={errors.sireId?.message}
              {...register('sireId')}
            />
            <Select
              label="Madre (Cerda Hembra)"
              options={damOptions}
              error={errors.damId?.message}
              {...register('damId')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Estado Reproductivo"
            options={reproStatusOptions}
            error={errors.reproductiveStatus?.message}
            {...register('reproductiveStatus')}
          />

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
                  {areasData?.data?.map((a: Area) => (
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
                  {shedsData?.data?.map((s: Shed) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>

                <select
                  className="block w-full rounded-lg border border-slate-300 text-xs py-2 px-2 bg-white"
                  disabled={!selectedShedId}
                  {...register('currentPenId')}
                >
                  <option value="">3. Corral</option>
                  {pensData?.data?.map((p: Pen) => (
                    <option key={p.id} value={p.id}>{p.code} ({p.currentOccupancy}/{p.maxCapacity})</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <Input
          label="Observaciones Zootécnicas"
          placeholder="Notas de conformación, vacunas aplicadas al ingreso..."
          error={errors.notes?.message}
          {...register('notes')}
        />
      </form>
    </Modal>
  );
};
