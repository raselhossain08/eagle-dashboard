'use client'

import { ReactNode } from 'react'
import { SidebarNav } from './sidebar-nav'
import { Header } from './header'
import { cn } from '@/lib/utils'

interface DashboardShellProps {
  children: ReactNode
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function DashboardShell({ 
  children, 
  title, 
  description, 
  actions,
  className 
}: DashboardShellProps) {
  return (
    <div >
   <main className="">
          <div className="  p-6">
         
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {title}
                </h1>
                {description && (
                  <p className="text-muted-foreground mt-2 max-w-2xl">
                    {description}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex items-center gap-2">
                  {actions}
                </div>
              )}
            </div>

            {/* Page Content */}
            <div className={cn("space-y-6", className)}>
              {children}
            </div>
          </div>
        </main>
    </div>
  )
}