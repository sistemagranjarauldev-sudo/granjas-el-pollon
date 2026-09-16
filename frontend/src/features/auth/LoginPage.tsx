import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { ShieldCheck, User, Lock, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  identifier: z.string().min(1, 'El usuario o correo es obligatorio'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setErrorMsg(null);
      await login(data.identifier, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    }
  };

  const handleFillDemo = () => {
    setValue('identifier', 'admin');
    setValue('password', 'Admin123*');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background grid and blurs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 ring-1 ring-white/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">PorciTech</h2>
            <p className="text-xs text-emerald-400 font-medium">Gestión Porcina Integral</p>
          </div>
        </div>
        <p className="mt-3 text-center text-sm text-slate-400">
          Plataforma empresarial de trazabilidad y producción zootécnica
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200/80">
          {errorMsg && (
            <div className="mb-5">
              <Alert type="error">{errorMsg}</Alert>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Usuario o Correo"
              placeholder="admin@granja.com"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.identifier?.message}
              {...register('identifier')}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full shadow-emerald-600/20"
                isLoading={isSubmitting}
              >
                Iniciar Sesión
              </Button>
            </div>
          </form>

          {/* Demo helper */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>¿Ambiente de prueba?</span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Cargar demo (admin)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
