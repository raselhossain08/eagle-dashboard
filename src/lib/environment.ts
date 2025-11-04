/**
 * Environment configuration and validation
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  ANALYTICS_URL: process.env.NEXT_PUBLIC_ANALYTICS_API_URL || 'http://localhost:3001',
  TIMEOUT: 10000, // 10 seconds
} as const;

// Feature Flags
export const FEATURES = {
  ANALYTICS_ENABLED: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
  REALTIME_ENABLED: process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true',
  EXPORTS_ENABLED: process.env.NEXT_PUBLIC_ENABLE_EXPORTS === 'true',
  NOTIFICATIONS_ENABLED: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
} as const;

// Update Intervals (in milliseconds)
export const UPDATE_INTERVALS = {
  REALTIME: parseInt(process.env.NEXT_PUBLIC_REALTIME_UPDATE_INTERVAL || '30000'),
  ANALYTICS: 5 * 60 * 1000, // 5 minutes
  HEALTH_CHECK: 60 * 1000, // 1 minute
} as const;

// Validation
export const isValidEnvironment = (): boolean => {
  const required = ['NEXT_PUBLIC_API_URL'];
  return required.every(key => process.env[key]);
};

// Debug info
export const getEnvironmentInfo = () => ({
  NODE_ENV: process.env.NODE_ENV,
  API_BASE_URL: API_CONFIG.BASE_URL,
  ANALYTICS_URL: API_CONFIG.ANALYTICS_URL,
  FEATURES_ENABLED: Object.entries(FEATURES).filter(([_, enabled]) => enabled).map(([key]) => key),
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
});

export default {
  API_CONFIG,
  FEATURES,
  UPDATE_INTERVALS,
  isValidEnvironment,
  getEnvironmentInfo,
};