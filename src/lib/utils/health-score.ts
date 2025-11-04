import { ServiceStatus, HealthStatus } from '@/types/health';

export function calculateHealthScore(services: ServiceStatus[]): number {
  const weights = {
    database: 0.3,
    redis: 0.2,
    memory: 0.25,
    disk: 0.25
  };

  let totalScore = 0;
  let totalWeight = 0;

  services.forEach(service => {
    const weight = weights[service.name as keyof typeof weights] || 0.1;
    const serviceScore = service.status === 'up' ? 100 : 
                        service.status === 'degraded' ? 50 : 0;
    
    totalScore += serviceScore * weight;
    totalWeight += weight;
  });

  return Math.round(totalScore / totalWeight);
}

export function determineOverallStatus(score: number): HealthStatus {
  if (score >= 90) return 'healthy';
  if (score >= 70) return 'warning';
  return 'critical';
}