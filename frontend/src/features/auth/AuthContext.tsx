import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserFarmAssignment } from '../../types';
import { authService } from './authService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeFarm: UserFarmAssignment | null;
  setActiveFarm: (farm: UserFarmAssignment) => void;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permissionCode: string) => boolean;
  hasRole: (roleName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeFarm, setActiveFarmState] = useState<UserFarmAssignment | null>(() => {
    const savedFarm = localStorage.getItem('activeFarm');
    return savedFarm ? JSON.parse(savedFarm) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setActiveFarm = (farm: UserFarmAssignment) => {
    setActiveFarmState(farm);
    localStorage.setItem('activeFarm', JSON.stringify(farm));
    localStorage.setItem('activeFarmId', farm.farmId);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await authService.getCurrentUser();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));

            // Si no tiene granja activa seleccionada, seleccionar la default o la primera
            if (!activeFarm && res.data.assignedFarms.length > 0) {
              const defaultFarm = res.data.assignedFarms.find((f) => f.isDefault) || res.data.assignedFarms[0];
              setActiveFarm(defaultFarm);
            }
          }
        } catch (err) {
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await authService.login(identifier, password);
    if (res.success && res.data) {
      const { token, refreshToken, user: profile } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(profile));
      setUser(profile);

      if (profile.assignedFarms && profile.assignedFarms.length > 0) {
        const defaultFarm = profile.assignedFarms.find((f) => f.isDefault) || profile.assignedFarms[0];
        setActiveFarm(defaultFarm);
      }
    } else {
      throw new Error(res.message || 'Credenciales inválidas');
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('activeFarm');
    localStorage.removeItem('activeFarmId');
    setUser(null);
    setActiveFarmState(null);
  };

  const hasPermission = (permissionCode: string) => {
    if (!user) return false;
    if (user.roles.includes('Administrador')) return true;
    return user.permissions?.includes(permissionCode) ?? false;
  };

  const hasRole = (roleName: string) => {
    if (!user) return false;
    return user.roles.includes(roleName);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        activeFarm,
        setActiveFarm,
        login,
        logout,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
