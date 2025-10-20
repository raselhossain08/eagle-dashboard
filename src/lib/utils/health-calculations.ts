import { ServiceStatus, SystemMetrics, HealthStatus } from '@/types/health';

interface HealthWeights {
  database: number;
  redis: number;
  memory: number;
  disk: number;
}

interface TrendAnalysis {
  trend: 'improving' | 'stable' | 'deteriorating';
  change: number;
  prediction: number;
}

export function calculateDynamicHealthScore(
  services: ServiceStatus[], 
  metrics: SystemMetrics,
  historicalData?: any[]
): { score: number; overall: HealthStatus; analysis: TrendAnalysis } {
  
  const weights: HealthWeights = {
    database: 0.3,
    redis: 0.2,
    memory: 0.25,
    disk: 0.25
  };

  // Calculate service scores
  let serviceScore = 0;
  services.forEach(service => {
    const weight = weights[service.name as keyof HealthWeights] || 0.1;
    let serviceHealth = 0;

    switch (service.status) {
      case 'up':
        serviceHealth = 100;
        // Penalize high response times
        if (service.responseTime && service.responseTime > 100) {
          serviceHealth -= (service.responseTime - 100) / 10;
        }
        break;
      case 'degraded':
        serviceHealth = 50;
        break;
      case 'down':
        serviceHealth = 0;
        break;
    }
    
    serviceScore += serviceHealth * weight;
  });

  // Calculate metrics scores
  const metricsScore = calculateMetricsScore(metrics);
  
  // Combine scores with weights
  const finalScore = Math.round((serviceScore * 0.7) + (metricsScore * 0.3));
  
  // Determine overall status
  const overall = finalScore >= 90 ? 'healthy' : 
                  finalScore >= 70 ? 'warning' : 'critical';

  // Trend analysis
  const analysis = analyzeTrend(historicalData, finalScore);

  return {
    score: Math.max(0, Math.min(100, finalScore)),
    overall,
    analysis
  };
}

function calculateMetricsScore(metrics: SystemMetrics): number {
  let score = 100;

  // Memory usage penalty
  if (metrics.memory.usagePercentage > 90) score -= 30;
  else if (metrics.memory.usagePercentage > 80) score -= 15;
  else if (metrics.memory.usagePercentage > 70) score -= 5;

  // Disk usage penalty
  if (metrics.disk.usagePercentage > 90) score -= 30;
  else if (metrics.disk.usagePercentage > 80) score -= 15;
  else if (metrics.disk.usagePercentage > 70) score -= 5;

  // CPU usage penalty
  if (metrics.cpu.usage > 90) score -= 20;
  else if (metrics.cpu.usage > 80) score -= 10;
  else if (metrics.cpu.usage > 70) score -= 5;

  return Math.max(0, score);
}

function analyzeTrend(historicalData: any[] = [], currentScore: number): TrendAnalysis {
  if (historicalData.length < 2) {
    return { trend: 'stable', change: 0, prediction: currentScore };
  }

  const recentScores = historicalData
    .slice(-5)
    .map(item => item.healthScore || item.score);
  
  if (recentScores.length < 2) {
    return { trend: 'stable', change: 0, prediction: currentScore };
  }

  const previousScore = recentScores[recentScores.length - 2];
  const change = currentScore - previousScore;
  
  let trend: TrendAnalysis['trend'] = 'stable';
  if (change > 5) trend = 'improving';
  else if (change < -5) trend = 'deteriorating';

  // Simple prediction based on recent trend
  const prediction = Math.max(0, Math.min(100, currentScore + (change * 0.5)));

  return {
    trend,
    change,
    prediction: Math.round(prediction)
  };
}

export function predictServiceFailure(services: ServiceStatus[], metrics: SystemMetrics): string[] {
  const warnings: string[] = [];

  // Memory warning
  if (metrics.memory.usagePercentage > 85) {
    warnings.push('Memory usage critically high');
  }

  // Disk warning
  if (metrics.disk.usagePercentage > 88) {
    warnings.push('Disk space running low');
  }

  // CPU warning
  if (metrics.cpu.usage > 85) {
    warnings.push('CPU usage elevated');
  }

  // Service degradation detection
  services.forEach(service => {
    if (service.status === 'degraded') {
      warnings.push(`${service.name} performance degraded`);
    }
    if (service.responseTime && service.responseTime > 200) {
      warnings.push(`${service.name} response time slow`);
    }
  });

  return warnings;
}