'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/types/auth'
import { AuthService } from '@/lib/services/auth.service'
import { SessionStorageService } from '@/lib/auth/session-storage.service'

interface SessionContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const authService = new AuthService()

  const isAuthenticated = !!user

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const storedUser = SessionStorageService.getUserSession()

      if (storedUser) {
        // Validate with backend using cookie authentication
        const validatedUser = await authService.validateSession()
        setUser(validatedUser)
      }
    } catch (error) {
      console.error('Session check failed:', error)
      // Clear invalid session
      SessionStorageService.clearUserSession()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await authService.login({ 
      email, 
      password, 
      rememberMe: false 
    })
    
    if (response.requiresTwoFactor) {
      throw new Error('2FA_REQUIRED')
    }
    
    // No need to store tokens in localStorage - they're in HTTP-only cookies
    // Just store user session for quick access
    SessionStorageService.setUserSession(response.user)
    setUser(response.user)
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      SessionStorageService.clearUserSession()
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}