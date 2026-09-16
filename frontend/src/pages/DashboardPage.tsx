import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { farmStructureService } from '../features/farm-structure/farmStructureService';
import { userService } from '../features/users/userService';
import { useAuth } from '../features/auth/AuthContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import {
  Building2,
  Layers,
  Warehouse,
  Grid,
  Users,
  Activity,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const { user, activeFarm } = useAuth();

  const { data: farmsData } = useQuery({
    queryKey: ['farms-summary'],
    queryFn: () => farmStructureService.getFarms(1, 50),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users-summary'],
    queryFn: () => userService.getUsers(1, 50),
  });

  const { data: areasData } = useQuery({
    queryKey: ['areas-summary', activeFarm?.farmId],
    queryFn: () => farmStructureService.getAreasByFarm(activeFarm!.farmId),
    enabled: !!activeFarm?.farmId,
  });

  const farms = farmsData?.data?.items || [];
  const users = usersData?.data?.items || [];
  const areas = areasData?.data || [];

  const totalCapacity = farms.reduce((sum, f) => sum + f.totalCapacity, 0);
  const currentOccupancy = farms.reduce((sum, f) => sum + f.currentOccupancy, 0);
  const occupancyPercent = totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Centro de Control Operativo — Fase 1 (Core)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bienvenido, {user?.fullName || 'Administrador'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Sistema Integral de Gestión Porcina operativo con Clean Architecture en backend .NET 8 y frontend modular con React & TypeScript.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/farm-structure">
              <Button variant="primary" size="md" icon={<Layers className="w-4 h-4" />}>
                Ver Topología
              </Button>
            </Link>
            <Link to="/farms">
              <Button variant="secondary" size="md" icon={<Building2 className="w-4 h-4" />}>
                Granjas
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Granjas Activas</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{farms.length}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Unidades registradas</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Stat 2 */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Capacidad Total</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{formatNumber(totalCapacity)}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Plazas nominales</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Grid className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Stat 3 */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Censo / Ocupación</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{formatNumber(currentOccupancy)}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{occupancyPercent}% ocupado</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Stat 4 */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Usuarios Activos</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{users.length}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Control de acceso RBAC</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Active Farm Structure & Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Farm Overview (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <Warehouse className="w-5 h-5 text-emerald-600" />
                  <span>Granja de Trabajo Activa</span>
                </div>
              }
              description={activeFarm ? `${activeFarm.farmName} (${activeFarm.farmCode})` : 'Sin granja seleccionada'}
              action={
                <Link to="/farm-structure">
                  <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                    Explorar Detalle
                  </Button>
                </Link>
              }
            />
            <CardContent>
              {areas.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No hay áreas configuradas en la granja activa. Ingrese a "Topología" para agregar áreas y galpones.
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Áreas de Producción Configuradas
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {areas.map((area) => (
                      <div
                        key={area.id}
                        className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{area.name}</p>
                          <p className="text-[11px] text-slate-400">{area.areaTypeName}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-700">{area.totalSheds}</span>
                          <span className="text-[11px] text-slate-400 block">galpones</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Roadmap Progress Widget (1 col) */}
        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Estado del Roadmap"
              description="Evolución de módulos del sistema"
            />
            <CardContent className="space-y-3">
              {/* Phase 0 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-emerald-950">Fase 0: Análisis y Arquitectura</p>
                  <p className="text-[10px] text-emerald-700">Documentación y modelos completados</p>
                </div>
              </div>

              {/* Phase 1 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-emerald-950">Fase 1: Core del Sistema</p>
                  <p className="text-[10px] text-emerald-700">Clean Architecture, Auth, Usuarios, Topología y Auditoría</p>
                </div>
              </div>

              {/* Phase 2 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Fase 2: Plantel Porcino y Lotes</p>
                  <p className="text-[10px] text-slate-500">Ficha animal, genealogía, pesajes (Próxima)</p>
                </div>
              </div>

              {/* Phase 3 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 opacity-60">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Fase 3: Reproducción y Maternidad</p>
                  <p className="text-[10px] text-slate-500">Celos, inseminación, partos, destete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
