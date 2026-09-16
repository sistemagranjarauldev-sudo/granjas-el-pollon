import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Spinner } from '../../components/ui/Spinner';

export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
}> = ({ children, requiredPermission, requiredRole }) => {
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-slate-500">Cargando sesión segura...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md space-y-3">
          <h2 className="text-2xl font-bold text-slate-900">Acceso No Autorizado</h2>
          <p className="text-sm text-slate-600">
            No tienes los permisos requeridos (<code className="text-rose-600 bg-rose-50 px-1 py-0.5 rounded">{requiredPermission}</code>) para ver este módulo.
          </p>
        </div>
      </div>
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md space-y-3">
          <h2 className="text-2xl font-bold text-slate-900">Acceso Restringido</h2>
          <p className="text-sm text-slate-600">
            Este módulo está reservado para usuarios con rol <span className="font-semibold">{requiredRole}</span>.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
