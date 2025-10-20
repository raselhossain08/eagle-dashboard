'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

export function HealthCheck() {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking')

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health')
        if (response.ok) {
          setStatus('healthy')
        } else {
          setStatus('unhealthy')
        }
      } catch {
        setStatus('unhealthy')
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getVariant = () => {
    switch (status) {
      case 'healthy':
        return 'default'
      case 'unhealthy':
        return 'destructive'
      case 'checking':
        return 'secondary'
    }
  }

  const getText = () => {
    switch (status) {
      case 'healthy':
        return 'System Healthy'
      case 'unhealthy':
        return 'System Issues'
      case 'checking':
        return 'Checking...'
    }
  }

  return (
    <Badge variant={getVariant()} className="text-xs">
      {getText()}
    </Badge>
  )
}