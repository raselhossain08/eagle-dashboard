// types/auth.ts
export type AdminRole = 
  | 'super_admin' 
  | 'finance_admin' 
  | 'growth_marketing' 
  | 'support' 
  | 'read_only';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  isActive: boolean;
  lastLogin?: Date;
  twoFactorSecret?: string;
  isTwoFactorEnabled: boolean;
  allowedIPs?: string[];
  currentSessionId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
  twoFactorCode?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  requiresTwoFactor: boolean;
  user: User;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SecurityAlert {
  id: string;
  type: 'suspicious_login' | 'new_device' | 'location_change' | 'multiple_sessions';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export interface Session {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: Date;
  current: boolean;
}

export interface SecurityEvent {
  id: string;
  type: string;
  userId: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  details: Record<string, any>;
}

export interface DeviceInfo {
  browser: string;
  os: string;
  device: string;
  ip: string;
}

export interface LoginAttempt {
  email: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
}