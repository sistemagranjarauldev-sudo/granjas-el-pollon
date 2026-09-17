import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../features/auth/LoginPage';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { DashboardPage } from '../pages/DashboardPage';
import { FarmsPage } from '../features/farm-structure/FarmsPage';
import { FarmTopologyPage } from '../features/farm-structure/FarmTopologyPage';
import { UsersPage } from '../features/users/UsersPage';
import { AuditLogsPage } from '../features/audit/AuditLogsPage';
import { PigsPage } from '../features/pigs/PigsPage';
import { PigDetailPage } from '../features/pigs/PigDetailPage';
import { BatchesPage } from '../features/batches/BatchesPage';
import { BatchDetailPage } from '../features/batches/BatchDetailPage';
import { WeighingsPage } from '../features/weighings/WeighingsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      // Fase 1: Core & Topología
      {
        path: 'farms',
        element: <FarmsPage />,
      },
      {
        path: 'farm-structure',
        element: <FarmTopologyPage />,
      },
      // Fase 2: Plantel Porcino, Lotes & Pesajes
      {
        path: 'pigs',
        element: <PigsPage />,
      },
      {
        path: 'pigs/:id',
        element: <PigDetailPage />,
      },
      {
        path: 'batches',
        element: <BatchesPage />,
      },
      {
        path: 'batches/:id',
        element: <BatchDetailPage />,
      },
      {
        path: 'weighings',
        element: <WeighingsPage />,
      },
      // Administración
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'audit',
        element: <AuditLogsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
