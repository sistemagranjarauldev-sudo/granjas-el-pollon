import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../features/auth/LoginPage';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { DashboardPage } from '../pages/DashboardPage';
import { FarmsPage } from '../features/farm-structure/FarmsPage';
import { FarmTopologyPage } from '../features/farm-structure/FarmTopologyPage';
import { UsersPage } from '../features/users/UsersPage';
import { AuditLogsPage } from '../features/audit/AuditLogsPage';

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
      {
        path: 'farms',
        element: <FarmsPage />,
      },
      {
        path: 'farm-structure',
        element: <FarmTopologyPage />,
      },
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
