import { useCallback, useMemo } from 'react';
import { HealthMetrics, Alert } from '@/types/health';

export function useHealthOptimizations() {
  const memoizedHealthScore = useCallback((services: any[], metrics: any) => {
    // Memoized health score calculation
    return calculateDynamicHealthScore(services, metrics);
  }, []);

  const filteredAlerts = useCallback((alerts: Alert[], filters: any) => {
    return alerts.filter(alert => {
      if (filters.severity && alert.severity !== filters.severity) return false;
      if (filters.service && alert.service !== filters.service) return false;
      if (filters.acknowledged && alert.acknowledged !== filters.acknowledged) return false;
      return true;
    });
  }, []);

  const memoizedServices = useMemo(() => {
    return (services: any[]) => services.map(service => ({
      ...service,
      displayName: service.name.replace(/([A-Z])/g, ' $1').trim()
    }));
  }, []);

  return {
    memoizedHealthScore,
    filteredAlerts,
    memoizedServices
  };
}

// Virtual scrolling hook for large datasets
export function useVirtualScroll(items: any[], itemHeight: number, containerHeight: number) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(visibleStart + Math.ceil(containerHeight / itemHeight) + 1, items.length);
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  const offsetY = visibleStart * itemHeight;

  return {
    visibleItems,
    offsetY,
    totalHeight: items.length * itemHeight,
    onScroll: (e: React.UIEvent) => setScrollTop(e.currentTarget.scrollTop)
  };
}