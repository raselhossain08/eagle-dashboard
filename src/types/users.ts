// types/users.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'active' | 'inactive' | 'suspended';
  emailVerified: boolean;
  phone?: string;
  company?: string;
  address?: Address;
  preferences: UserPreferences;
  kycStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  language: string;
  timezone: string;
}

export interface UsersResponse {
  users: User[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UsersParams {
  page?: number;
  search?: string;
  status?: string;
  kycStatus?: string;
  sort?: string;
  pageSize?: number;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  userGrowthRate: number;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  address?: Address;
  preferences?: Partial<UserPreferences>;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  address?: Address;
  preferences?: Partial<UserPreferences>;
  status?: 'active' | 'inactive' | 'suspended';
}