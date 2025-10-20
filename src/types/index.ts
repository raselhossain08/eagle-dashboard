// Core types
export interface DateRange {
  startDate: Date
  endDate: Date
}

export interface OverviewStats {
  totalUsers: number
  totalSessions: number
  totalPageViews: number
  bounceRate: number
  avgSessionDuration: number
  newUsers: number
  returningUsers: number
  conversionRate: number
  revenue: number
}

export interface EventTrendsData {
  date: string
  count: number
  event: string
  uniqueUsers: number
}

export interface TopPagesData {
  page: string
  visits: number
  uniqueVisitors: number
  bounceRate: number
  avgTimeOnPage: number
}

export interface ChannelPerformanceData {
  channel: string
  sessions: number
  users: number
  bounceRate: number
  conversionRate: number
  revenue: number
}

export interface GeographicData {
  country: string
  region: string
  city: string
  sessions: number
  users: number
  newUsers: number
}

export interface FunnelStep {
  step: string
  count: number
  conversionRate: number
  dropOff: number
  avgTime: number
}

export interface FunnelData {
  id: string
  name: string
  steps: FunnelStep[]
  totalConversion: number
  createdAt: Date
}

// API Parameter types
export interface EventTrendsParams {
  startDate: Date
  endDate: Date
  event?: string
  groupBy: 'hour' | 'day' | 'week' | 'month'
}

export interface TopPagesParams {
  startDate: Date
  endDate: Date
  limit: number
}

export interface DateRangeParams {
  startDate: Date
  endDate: Date
}

// Store types
export interface AnalyticsFilters {
  channels?: string[]
  devices?: string[]
  countries?: string[]
  events?: string[]
  segments?: string[]
}

export interface DashboardState {
  dateRange: DateRange
  selectedMetrics: string[]
  filters: AnalyticsFilters
  dashboardLayout: string
}

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  requiresTwoFactor: boolean;
  user: AdminUser;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'finance_admin' | 'growth_marketing' | 'support' | 'read_only';
  isActive: boolean;
  lastLogin?: Date;
  twoFactorSecret?: string;
  isTwoFactorEnabled: boolean;
  allowedIPs?: string[];
  currentSessionId?: string;
}

export interface SecurityAlert {
  id: string;
  type: 'suspicious_login' | 'new_device' | 'location_change' | 'multiple_sessions';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}