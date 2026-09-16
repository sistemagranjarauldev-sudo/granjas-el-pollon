export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]> | null;
}

export interface PaginatedList<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  assignedFarms: UserFarmAssignment[];
}

export interface UserFarmAssignment {
  farmId: string;
  farmCode: string;
  farmName: string;
  isDefault: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: UserProfile;
}

// Topología de Granja
export interface Farm {
  id: string;
  code: string;
  name: string;
  legalName?: string;
  taxId?: string;
  location?: string;
  totalCapacity: number;
  currentOccupancy: number;
  totalAreas: number;
  totalSheds: number;
  totalPens: number;
  isActive: boolean;
  createdAt: string;
}

export enum AreaType {
  GiltDevelopment = 1,
  Gestation = 2,
  Maternity = 3,
  Nursery = 4,
  Finishing = 5,
  Quarantine = 6,
  BoarStud = 7,
}

export interface Area {
  id: string;
  farmId: string;
  code: string;
  name: string;
  areaType: AreaType;
  areaTypeName: string;
  description?: string;
  totalSheds: number;
  totalPens: number;
  totalCapacity: number;
  currentOccupancy: number;
  isActive: boolean;
}

export interface Shed {
  id: string;
  areaId: string;
  areaName: string;
  code: string;
  name: string;
  ventilationType: number;
  totalCapacity: number;
  currentOccupancy: number;
  totalPens: number;
  isActive: boolean;
}

export enum PenType {
  IndividualGestationCrate = 1,
  GroupGestationPen = 2,
  FarrowingCrate = 3,
  NurseryPen = 4,
  GrowerFinisherPen = 5,
  BoarPen = 6,
  HospitalPen = 7,
  QuarantinePen = 8,
}

export enum PenStatus {
  Empty = 1,
  Occupied = 2,
  Maintenance = 3,
  Sanitizing = 4,
}

export interface Pen {
  id: string;
  shedId: string;
  shedName: string;
  areaName: string;
  code: string;
  penType: PenType;
  penTypeName: string;
  maxCapacity: number;
  currentOccupancy: number;
  availableCapacity: number;
  dimensionsM2?: number;
  status: PenStatus;
  statusName: string;
  sanitizedAt?: string;
  isActive: boolean;
}

export interface FarmConfiguration {
  id: string;
  farmId: string;
  key: string;
  value: string;
  description: string;
  valueType: string;
}

// Usuarios y Roles
export interface UserItem {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  roles: string[];
  assignedFarms: UserFarmAssignment[];
}

export interface RoleItem {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  permissions: PermissionItem[];
}

export interface PermissionItem {
  id: string;
  code: string;
  module: string;
  description: string;
}

// Auditoría
export interface AuditLogItem {
  id: string;
  userId?: string;
  userName?: string;
  farmId?: string;
  action: string;
  module: string;
  entityName: string;
  entityId: string;
  oldValues?: string;
  newValues?: string;
  changedColumns?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}
