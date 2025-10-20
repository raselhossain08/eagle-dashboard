import { useEffect } from 'react'

export function usePerformanceMonitoring() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Track page load performance
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          console.log('Page Load Performance:', {
            dns: navEntry.domainLookupEnd - navEntry.domainLookupStart,
            tcp: navEntry.connectEnd - navEntry.connectStart,
            ttfb: navEntry.responseStart - navEntry.requestStart,
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            load: navEntry.loadEventEnd - navEntry.loadEventStart
          })
        }
      })
    })

    observer.observe({ entryTypes: ['navigation', 'paint'] })

    return () => observer.disconnect()
  }, [])
}