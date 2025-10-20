// src/lib/utils/health-utils.ts
export const calculateHealthScore = (health: any): number => {
  let score = 100;
  
  // Deduct points based on various factors
  if (health.cpu.usage > 80) score -= 20;
  if (health.memory.percentage > 85) score -= 20;
  if (health.disk.percentage > 90) score -= 20;
  if (health.database !== 'connected') score -= 30;
  
  return Math.max(0, score);
};

export const shouldAlert = (health: any): boolean => {
  return health.cpu.usage > 90 || 
         health.memory.percentage > 95 || 
         health.disk.percentage > 95 ||
         health.database !== 'connected';
};