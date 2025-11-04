'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

export function ReactQueryProviderOptimized({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Reduce stale time for faster updates but keep reasonable cache
            staleTime: 2 * 60 * 1000, // 2 minutes
            // Increase cache time to reduce refetches
            gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
            
            // Smarter retry logic
            retry: (failureCount, error: any) => {
              // Don't retry client errors or auth errors
              if (error?.status === 404) return false
              if (error?.status === 403) return false
              if (error?.status === 401) return false
              if (error?.status >= 400 && error?.status < 500) return false
              
              // Only retry server errors up to 2 times
              return failureCount < 2
            },
            
            // Exponential backoff for retries
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            
            // Don't refetch on window focus in production to reduce load
            refetchOnWindowFocus: process.env.NODE_ENV === 'development',
            
            // Don't refetch on reconnect unless it's been a while
            refetchOnReconnect: 'always',
            
            // Use placeholder data to improve perceived performance
            placeholderData: (previousData) => previousData,
            
            // Network mode - fail fast on offline
            networkMode: 'online',
          },
          mutations: {
            // Reduce mutation retries
            retry: 1,
            
            // Network mode for mutations
            networkMode: 'online',
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}