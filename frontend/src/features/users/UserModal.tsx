import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { UserItem, RoleItem, Farm } from '../../types';

const userSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres').max(50),
  email: z.string().email('Correo inválido'),
  password: z.string().optional(),
  firstName: z.string().min(2, 'El nombre es obligatorio'),
  lastName: z.string().min(2, 'El apellido es obligatorio'),
  phone: z.string().optional(),
  roleIds: z.array(z.string()).min(1, 'Debe asignar al menos un rol'),
  farmIds: z.array(z.string()).min(1, 'Debe asignar al menos una granja'),
});

type UserFormData = z.infer<typeof userSchema>;

export interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  user?: UserItem | null;
  roles: RoleItem[];
  farms: Farm[];
  isLoading?: boolean;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  roles,
  farms,
  isLoading,
}) => {
  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      roleIds: [],
      farmIds: [],
    },
  });

  const selectedRoleIds = watch('roleIds') || [];
  const selectedFarmIds = watch('farmIds') || [];

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        roleIds: roles.filter((r) => user.roles.includes(r.name)).map((r) => r.id),
        farmIds: user.assignedFarms.map((f) => f.farmId),
      });
    } else {
      reset({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        roleIds: roles.length > 0 ? [roles[0].id] : [],
        farmIds: farms.length > 0 ? [farms[0].id] : [],
      });
    }
  }, [user, reset, isOpen, roles, farms]);

  const handleRoleToggle = (roleId: string) => {
    if (selectedRoleIds.includes(roleId)) {
      setValue('roleIds', selectedRoleIds.filter((id) => id !== roleId));
    } else {
      setValue('roleIds', [...selectedRoleIds, roleId]);
    }
  };

  const handleFarmToggle = (farmId: string) => {
    if (selectedFarmIds.includes(farmId)) {
      setValue('farmIds', selectedFarmIds.filter((id) => id !== farmId));
    } else {
      setValue('farmIds', [...selectedFarmIds, farmId]);
    }
  };

  const handleFormSubmit = async (data: UserFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Usuario' : 'Nuevo Usuario del Sistema'}
      description="Credenciales, roles de acceso y asignación de granjas autorizadas"
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit(handleFormSubmit)} isLoading={isLoading}>
            {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre"
            placeholder="ej. Carlos"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Apellido"
            placeholder="ej. Pérez"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Usuario de Acceso"
            placeholder="ej. cperez"
            disabled={isEditing}
            error={errors.username?.message}
            {...register('username')}
          />
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="ej. cperez@granja.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        {!isEditing && (
          <Input
            label="Contraseña Inicial"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
        )}

        {/* Roles Assignment */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
            Roles Asignados
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {roles.map((role) => {
              const isChecked = selectedRoleIds.includes(role.id);
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleToggle(role.id)}
                  className={`px-3 py-2 rounded-xl text-left border text-xs font-medium transition-colors ${
                    isChecked
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold">{role.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{role.description}</p>
                </button>
              );
            })}
          </div>
          {errors.roleIds && <p className="text-xs text-rose-600 font-medium">{errors.roleIds.message}</p>}
        </div>

        {/* Farms Assignment */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
            Granjas Autorizadas
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {farms.map((farm) => {
              const isChecked = selectedFarmIds.includes(farm.id);
              return (
                <button
                  key={farm.id}
                  type="button"
                  onClick={() => handleFarmToggle(farm.id)}
                  className={`px-3 py-2 rounded-xl text-left border text-xs font-medium transition-colors ${
                    isChecked
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold">{farm.name}</p>
                  <p className="text-[10px] font-mono text-slate-400">{farm.code}</p>
                </button>
              );
            })}
          </div>
          {errors.farmIds && <p className="text-xs text-rose-600 font-medium">{errors.farmIds.message}</p>}
        </div>
      </form>
    </Modal>
  );
};
