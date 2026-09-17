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

// ==========================================
// FASE 2: PLANTEL PORCINO, LOTES Y PESAJES
// ==========================================

export enum PigSex {
  Female = 1,
  Male = 2,
  CastratedMale = 3,
}

export enum PigStatus {
  Active = 1,
  Sold = 2,
  Dead = 3,
  Culled = 4,
  Transferred = 5,
}

export enum ReproductiveStatus {
  Gilt = 1,
  Open = 2,
  Inseminated = 3,
  Pregnant = 4,
  Lactating = 5,
  Dry = 6,
}

export enum PigEntryType {
  BornInFarm = 1,
  Purchased = 2,
  Transferred = 3,
}

export enum BatchStage {
  Lactation = 1,
  Nursery = 2,
  Grower = 3,
  Finisher = 4,
  ReplacementGilt = 5,
}

export enum BatchStatus {
  Active = 1,
  Closed = 2,
  Transferred = 3,
  Sold = 4,
}

export interface Pig {
  id: string;
  farmId: string;
  identificationCode: string;
  electronicId?: string;
  sex: PigSex;
  sexName: string;
  breed: string;
  geneticLine?: string;
  birthDate: string;
  entryDate: string;
  entryType: PigEntryType;
  entryTypeName: string;
  sireId?: string;
  sireCode?: string;
  damId?: string;
  damCode?: string;
  currentPenId?: string;
  penCode?: string;
  shedName?: string;
  areaName?: string;
  currentBatchId?: string;
  batchCode?: string;
  status: PigStatus;
  statusName: string;
  reproductiveStatus: ReproductiveStatus;
  reproductiveStatusName: string;
  parity: number;
  ageInDays: number;
  currentWeightKg?: number;
  lastWeighingDate?: string;
  exitDate?: string;
  exitReason?: string;
  notes?: string;
  createdAt: string;
}

export interface PigDetail extends Pig {
  sireBreed?: string;
  damBreed?: string;
  movements: PigMovement[];
  weighings: PigWeighingSummary[];
}

export interface PigMovement {
  id: string;
  pigId: string;
  sourcePenId?: string;
  sourcePenCode?: string;
  targetPenId: string;
  targetPenCode: string;
  movementDate: string;
  reason: string;
  responsibleUserId?: string;
  notes?: string;
  createdAt: string;
}

export interface PigWeighingSummary {
  id: string;
  weighingDate: string;
  weightKg: number;
  ageDays: number;
  stage: BatchStage;
  averageDailyGainGrams?: number;
  weightGainKg?: number;
  daysElapsed?: number;
  notes?: string;
}

export interface GenealogyNode {
  id: string;
  code: string;
  sex: PigSex;
  breed: string;
  sire?: GenealogyNode | null;
  dam?: GenealogyNode | null;
}

export interface Batch {
  id: string;
  farmId: string;
  code: string;
  name: string;
  stage: BatchStage;
  stageName: string;
  startDate: string;
  endDate?: string;
  initialQuantity: number;
  currentQuantity: number;
  initialWeightKg?: number;
  currentAverageWeightKg?: number;
  lastWeighingDate?: string;
  currentPenId?: string;
  penCode?: string;
  shedName?: string;
  areaName?: string;
  status: BatchStatus;
  statusName: string;
  daysInBatch: number;
  notes?: string;
  createdAt: string;
}

export interface BatchDetail extends Batch {
  movements: BatchMovement[];
  weighings: BatchWeighingSummary[];
}

export interface BatchMovement {
  id: string;
  batchId: string;
  sourcePenId?: string;
  sourcePenCode?: string;
  targetPenId: string;
  targetPenCode: string;
  quantity: number;
  movementDate: string;
  reason: string;
  responsibleUserId?: string;
  notes?: string;
  createdAt: string;
}

export interface BatchWeighingSummary {
  id: string;
  weighingDate: string;
  stage: BatchStage;
  sampleQuantity: number;
  totalSampleWeightKg: number;
  averageWeightKg: number;
  estimatedBatchWeightKg?: number;
  averageDailyGainGrams?: number;
  weightGainKg?: number;
  daysElapsed?: number;
  notes?: string;
}

export interface PigWeighing {
  id: string;
  pigId: string;
  pigCode: string;
  weighingDate: string;
  weightKg: number;
  ageDays: number;
  stage: BatchStage;
  stageName: string;
  averageDailyGainGrams?: number;
  weightGainKg?: number;
  daysElapsed?: number;
  responsibleUserId?: string;
  notes?: string;
  createdAt: string;
}

export interface BatchWeighing {
  id: string;
  batchId: string;
  batchCode: string;
  batchName: string;
  weighingDate: string;
  stage: BatchStage;
  stageName: string;
  sampleQuantity: number;
  totalSampleWeightKg: number;
  averageWeightKg: number;
  estimatedBatchWeightKg?: number;
  averageDailyGainGrams?: number;
  weightGainKg?: number;
  daysElapsed?: number;
  responsibleUserId?: string;
  notes?: string;
  createdAt: string;
}

export interface GrowthCurvePoint {
  date: string;
  ageDays: number;
  weightKg: number;
  averageDailyGainGrams?: number;
}
