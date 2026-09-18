import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from './userService';
import { farmStructureService } from '../farm-structure/farmStructureService';
import { UserItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Alert } from '../../components/ui/Alert';
import { UserModal } from './UserModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import { Plus, Edit2, Trash2, Search, KeyRound } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { formatDateTime } from '../../utils/formatters';

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;

  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ['users', pageIndex, search],
    queryFn: () => userService.getUsers(pageIndex, pageSize, search),
  });

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => userService.getRoles(),
  });

  const { data: farmsData } = useQuery({
    queryKey: ['farms-all'],
    queryFn: () => farmStructureService.getFarms(1, 100),
  });

  const roles = rolesData?.data || [];
  const farms = farmsData?.data?.items || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSuccessMessage('Usuario creado exitosamente.');
      setTimeout(() => setSuccessMessage(null), 4000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => userService.updateUser(selectedUser!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSuccessMessage('Usuario actualizado exitosamente.');
      setTimeout(() => setSuccessMessage(null), 4000);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => userService.toggleUserStatus(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsDeleteOpen(false);
      setSuccessMessage('Usuario eliminado correctamente.');
      setTimeout(() => setSuccessMessage(null), 4000);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      userService.resetPassword(id, newPassword),
    onSuccess: () => {
      setSuccessMessage(`Contraseña actualizada exitosamente para ${selectedUser?.fullName || 'el usuario'}.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    },
  });

  const handleSaveUser = async (formData: any) => {
    if (selectedUser) {
      await updateMutation.mutateAsync(formData);
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleResetPasswordSubmit = async (newPassword: string) => {
    if (!selectedUser) return;
    await resetPasswordMutation.mutateAsync({ id: selectedUser.id, newPassword });
  };

  const columns: Column<UserItem>[] = [
    {
      header: 'Usuario',
      cell: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
            {user.firstName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-tight">{user.fullName}</p>
            <p className="text-xs text-slate-400 font-mono">{user.username}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Correo / Contacto',
      cell: (user) => (
        <div className="text-xs">
          <p className="text-slate-800 font-medium">{user.email}</p>
          <p className="text-slate-400 text-[11px]">{user.phone || 'Sin teléfono'}</p>
        </div>
      ),
    },
    {
      header: 'Roles Asignados',
      cell: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles.map((r, i) => (
            <Badge key={i} variant={r === 'Administrador' ? 'brand' : 'neutral'} className="text-[10px]">
              {r}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: 'Granjas Asignadas',
      cell: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.assignedFarms.length === 0 ? (
            <span className="text-xs text-slate-400">Sin asignar</span>
          ) : (
            user.assignedFarms.map((f, i) => (
              <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                {f.farmCode}
              </span>
            ))
          )}
        </div>
      ),
    },
    {
      header: 'Último Acceso',
      cell: (user) => (
        <span className="text-xs text-slate-500 font-medium">
          {formatDateTime(user.lastLoginAt)}
        </span>
      ),
    },
    {
      header: 'Estado',
      cell: (user) => (
        <button
          onClick={() => toggleStatusMutation.mutate(user.id)}
          title="Clic para cambiar estado"
          className="cursor-pointer"
        >
          <Badge variant={user.isActive ? 'success' : 'danger'} dot>
            {user.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        </button>
      ),
    },
    {
      header: 'Acciones',
      className: 'text-right',
      cell: (user) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            title="Restablecer Contraseña"
            onClick={() => {
              setSelectedUser(user);
              setIsResetPasswordOpen(true);
            }}
            icon={<KeyRound className="w-4 h-4 text-amber-600 hover:text-amber-700" />}
          />
          <Button
            variant="ghost"
            size="sm"
            title="Editar Usuario"
            onClick={() => {
              setSelectedUser(user);
              setIsUserModalOpen(true);
            }}
            icon={<Edit2 className="w-4 h-4 text-slate-600" />}
          />
          {user.username !== 'admin' && (
            <Button
              variant="ghost"
              size="sm"
              title="Eliminar Usuario"
              onClick={() => {
                setSelectedUser(user);
                setIsDeleteOpen(true);
              }}
              icon={<Trash2 className="w-4 h-4 text-rose-600" />}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Usuarios y Accesos</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de identidades, perfiles, asignación de roles y control multi-granja
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setSelectedUser(null);
            setIsUserModalOpen(true);
          }}
        >
          Nuevo Usuario
        </Button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <Alert type="success">
          {successMessage}
        </Alert>
      )}

      {/* Search */}
      <div className="flex items-center gap-4 max-w-md">
        <Input
          placeholder="Buscar usuario por nombre o correo..."
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
        emptyMessage="No se encontraron usuarios registrados."
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
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSubmit={handleSaveUser}
        user={selectedUser}
        roles={roles}
        farms={farms}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
        onSubmit={handleResetPasswordSubmit}
        user={selectedUser}
        isLoading={resetPasswordMutation.isPending}
      />

      {selectedUser && (
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={() => deleteMutation.mutate(selectedUser.id)}
          title="¿Eliminar Usuario?"
          message={`¿Confirma que desea eliminar el usuario "${selectedUser.username}" (${selectedUser.fullName})?`}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

