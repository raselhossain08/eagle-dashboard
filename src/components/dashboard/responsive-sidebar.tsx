'use client'

import { useState } from 'react'
import { SidebarNav } from './sidebar-nav'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResponsiveSidebarProps {
  children: React.ReactNode
}

export function ResponsiveSidebar({ children }: ResponsiveSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 w-64 h-screen bg-background border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarNav onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-4 left-4 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-white shadow-lg border hover:bg-gray-50"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {children}
      </div>
    </>
  )
}