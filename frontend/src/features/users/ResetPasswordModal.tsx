import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { UserItem } from '../../types';
import { KeyRound, Eye, EyeOff, Sparkles, Copy, Check, ShieldCheck } from 'lucide-react';

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma la contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserItem | null;
  onSubmit: (newPassword: string) => Promise<void>;
  isLoading?: boolean;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  user,
  onSubmit,
  isLoading,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const currentPassword = watch('newPassword');

  useEffect(() => {
    if (isOpen) {
      reset({ newPassword: '', confirmPassword: '' });
      setServerError(null);
      setCopied(false);
      setShowPassword(false);
      setShowConfirm(false);
    }
  }, [isOpen, reset, user]);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    const prefixes = ['Granja', 'Porcino', 'Agro', 'Cerdos', 'Control'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const year = new Date().getFullYear();
    const generated = `${prefix}#${year}!${randomPart}`;

    setValue('newPassword', generated, { shouldValidate: true });
    setValue('confirmPassword', generated, { shouldValidate: true });
    setShowPassword(true);
    setShowConfirm(true);
  };

  const handleCopyPassword = () => {
    if (currentPassword) {
      navigator.clipboard.writeText(currentPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFormSubmit = async (data: ResetPasswordFormData) => {
    setServerError(null);
    try {
      await onSubmit(data.newPassword);
      onClose();
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message || err?.message || 'Error al restablecer la contraseña.'
      );
    }
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Restablecer Contraseña"
      description="Establece una nueva clave de acceso para el usuario seleccionado"
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit(handleFormSubmit)}
            isLoading={isLoading}
            icon={<KeyRound className="w-4 h-4" />}
          >
            Actualizar Contraseña
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
        {/* User Card Summary */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold text-sm flex items-center justify-center shrink-0">
            {user.firstName?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-900 text-sm truncate">{user.fullName}</p>
              <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                @{user.username}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>

        {serverError && <Alert type="error">{serverError}</Alert>}

        {/* Action helper: Generate secure password */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Nueva Clave
          </span>
          <div className="flex items-center gap-2">
            {currentPassword && (
              <button
                type="button"
                onClick={handleCopyPassword}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 transition-colors font-medium"
                title="Copiar contraseña generada"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copiada</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={generateRandomPassword}
              className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200/60 font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Generar Segura
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div className="relative">
            <Input
              label="Nueva Contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirmar Nueva Contraseña"
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 focus:outline-none"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-2.5 text-[11px] text-amber-800 leading-relaxed">
          <span className="font-bold">Nota de seguridad:</span> Al restablecer la contraseña, el usuario deberá utilizar esta nueva clave para iniciar sesión en el sistema.
        </div>
      </form>
    </Modal>
  );
};
