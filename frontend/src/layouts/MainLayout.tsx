import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { cn } from '../utils/cn';
import {
  LayoutDashboard,
  Building2,
  Layers,
  Warehouse,
  Grid,
  Users,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  GitBranch,
  FileSpreadsheet,
  Settings,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  group: string;
  items: NavItem[];
}

export const MainLayout: React.FC = () => {
  const { user, logout, activeFarm, setActiveFarm } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isFarmMenuOpen, setIsFarmMenuOpen] = useState(false);

  const navigation: NavSection[] = [
    {
      group: 'General',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Topología & Granja (Fase 1 Core)',
      items: [
        { name: 'Granjas', href: '/farms', icon: Building2 },
        { name: 'Topología y Corrales', href: '/farm-structure', icon: Layers },
      ],
    },
    {
      group: 'Administración & Seguridad',
      items: [
        { name: 'Usuarios y Roles', href: '/users', icon: Users },
        { name: 'Auditoría Forense', href: '/audit', icon: ShieldAlert },
      ],
    },
    {
      group: 'Módulos en Desarrollo (Roadmap)',
      items: [
        { name: 'Plantel Porcino', href: '#', icon: Grid, badge: 'Fase 2' },
        { name: 'Lotes y Pesajes', href: '#', icon: GitBranch, badge: 'Fase 2' },
        { name: 'Reproducción & Maternidad', href: '#', icon: Warehouse, badge: 'Fase 3' },
        { name: 'Sanidad & Bioseguridad', href: '#', icon: ShieldCheck, badge: 'Fase 4' },
        { name: 'Alimentación & Inventario', href: '#', icon: Sparkles, badge: 'Fase 5' },
        { name: 'Reportes y Analítica', href: '#', icon: FileSpreadsheet, badge: 'Fase 7' },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out flex flex-col',
          'lg:static lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 bg-slate-950/50">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">PorciTech</span>
              <span className="block text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">
                Granja v1.0
              </span>
            </div>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {navigation.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {section.group}
              </h4>
              <div className="space-y-0.5 pt-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  const isLinkDisabled = item.href === '#';

                  if (isLinkDisabled) {
                    return (
                      <div
                        key={item.name}
                        className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-500 rounded-lg cursor-not-allowed opacity-60"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                        isActive
                          ? 'bg-emerald-600/15 text-emerald-400 font-semibold border-l-2 border-emerald-500 rounded-l-none'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={cn('w-4 h-4', isActive ? 'text-emerald-400' : 'text-slate-400')}
                        />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer User Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 truncate">
              <div className="w-8 h-8 rounded-full bg-emerald-700/60 text-emerald-200 flex items-center justify-center font-bold text-xs">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.roles?.[0] || 'Usuario'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between shadow-sm relative z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Farm Context Selector */}
            <div className="relative">
              <button
                onClick={() => setIsFarmMenuOpen(!isFarmMenuOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 transition-colors shadow-sm"
              >
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-900">
                  {activeFarm ? activeFarm.farmName : 'Seleccionar Granja'}
                </span>
                {activeFarm && (
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                    {activeFarm.farmCode}
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Farm Dropdown */}
              {isFarmMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-scaleUp">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Tus Granjas Asignadas
                  </div>
                  {user?.assignedFarms && user.assignedFarms.length > 0 ? (
                    user.assignedFarms.map((f) => (
                      <button
                        key={f.farmId}
                        onClick={() => {
                          setActiveFarm(f);
                          setIsFarmMenuOpen(false);
                        }}
                        className={cn(
                          'w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors',
                          activeFarm?.farmId === f.farmId
                            ? 'bg-emerald-50 text-emerald-900 font-semibold'
                            : 'text-slate-700'
                        )}
                      >
                        <span>{f.farmName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{f.farmCode}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3.5 py-2 text-xs text-slate-400">Sin granjas asignadas</div>
                  )}
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <Link
                      to="/farms"
                      onClick={() => setIsFarmMenuOpen(false)}
                      className="w-full text-left px-3.5 py-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1.5"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Gestionar todas las granjas
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Profile Right Side */}
          <div className="flex items-center gap-3">
            <Badge variant="brand" dot>
              Sistema Operativo
            </Badge>

            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                  {user?.firstName?.charAt(0) || 'A'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{user?.fullName}</p>
                  <p className="text-[10px] text-slate-500">{user?.roles?.[0] || 'Administrador'}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-scaleUp">
                  <div className="px-3.5 py-2 border-b border-slate-100 text-xs text-slate-500">
                    Conectado como <br />
                    <span className="font-semibold text-slate-900">{user?.email}</span>
                  </div>
                  <Link
                    to="/users"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    Perfil y Usuarios
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
