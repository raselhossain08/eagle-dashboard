import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

interface PerformanceMetrics {
  routeChangeStart: number;
  routeChangeComplete: number;
  componentRenderStart: number;
  componentRenderComplete: number;
}

export function usePerformanceMonitoring(pageName: string) {
  const metrics = useRef<PerformanceMetrics>({
    routeChangeStart: 0,
    routeChangeComplete: 0,
    componentRenderStart: 0,
    componentRenderComplete: 0,
  });

  const startTime = useRef<number>(performance.now());

  useEffect(() => {
    metrics.current.componentRenderStart = performance.now();
    
    // Mark render complete after a microtask
    Promise.resolve().then(() => {
      metrics.current.componentRenderComplete = performance.now();
      
      const renderTime = metrics.current.componentRenderComplete - metrics.current.componentRenderStart;
      const totalTime = metrics.current.componentRenderComplete - startTime.current;
      
      // Log performance metrics
      console.group(`🚀 Performance Metrics - ${pageName}`);
      console.log(`Total Time: ${totalTime.toFixed(2)}ms`);
      console.log(`Render Time: ${renderTime.toFixed(2)}ms`);
      console.groupEnd();
      
      // Send to analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'page_render_time', {
          event_category: 'Performance',
          event_label: pageName,
          value: Math.round(renderTime),
        });
      }
    });
  }, [pageName]);

  // Performance optimization tips based on render time
  useEffect(() => {
    const renderTime = metrics.current.componentRenderComplete - metrics.current.componentRenderStart;
    
    if (renderTime > 1000) {
      console.warn(`⚠️ Slow render detected for ${pageName}: ${renderTime.toFixed(2)}ms`);
      console.log('💡 Consider:');
      console.log('- Lazy loading heavy components');
      console.log('- Reducing initial data fetching');
      console.log('- Using React.memo for expensive components');
      console.log('- Optimizing bundle size');
    }
  }, [pageName]);

  return {
    markStart: (event: string) => {
      performance.mark(`${pageName}-${event}-start`);
    },
    markEnd: (event: string) => {
      performance.mark(`${pageName}-${event}-end`);
      performance.measure(`${pageName}-${event}`, `${pageName}-${event}-start`, `${pageName}-${event}-end`);
    },
  };
}

// Hook for monitoring React Query performance
export function useQueryPerformanceMonitoring() {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('fetch') || entry.name.includes('xhr')) {
          console.log(`🌐 Network Request: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
          
          if (entry.duration > 2000) {
            console.warn(`⚠️ Slow network request detected: ${entry.duration.toFixed(2)}ms`);
          }
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'resource'] });

    return () => observer.disconnect();
  }, []);
}

// Custom hook for route change performance
export function useRouteChangePerformance() {
  const router = useRouter();

  useEffect(() => {
    let routeChangeStart = 0;

    const handleRouteChangeStart = () => {
      routeChangeStart = performance.now();
      console.log('🔄 Route change started');
    };

    const handleRouteChangeComplete = () => {
      const routeChangeTime = performance.now() - routeChangeStart;
      console.log(`✅ Route change completed: ${routeChangeTime.toFixed(2)}ms`);
      
      if (routeChangeTime > 3000) {
        console.warn(`⚠️ Slow route change detected: ${routeChangeTime.toFixed(2)}ms`);
        console.log('💡 Optimization tips:');
        console.log('- Use Next.js dynamic imports');
        console.log('- Implement proper loading states');
        console.log('- Reduce bundle size');
        console.log('- Optimize API calls');
      }

      // Send to analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'route_change_time', {
          event_category: 'Performance',
          event_label: router.pathname,
          value: Math.round(routeChangeTime),
        });
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router.events, router.pathname]);
}