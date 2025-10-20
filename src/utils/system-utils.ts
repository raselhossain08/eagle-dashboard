// src/lib/utils/system-utils.ts
export const formatBytes = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  return `${days}d ${hours}h ${minutes}m`;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'healthy': return 'text-green-600 bg-green-100 dark:bg-green-900';
    case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
    case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900';
    default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
  }
};