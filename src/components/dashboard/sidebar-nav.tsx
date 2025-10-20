'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Users, 
  ChevronDown,
  Activity
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navigationItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: BarChart3,
    description: "General analytics overview"
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: TrendingUp,
    items: [
      { title: "Events", href: "/dashboard/analytics/events" },
      { title: "Funnels", href: "/dashboard/analytics/funnels" },
      { title: "Real-time", href: "/dashboard/analytics/real-time" },
      { title: "Reports", href: "/dashboard/analytics/reports", items: [
        { title: "Revenue", href: "/dashboard/analytics/reports/revenue" },
        { title: "Cohorts", href: "/dashboard/analytics/reports/cohorts" },
        { title: "Goals", href: "/dashboard/analytics/reports/goals" }
      ]},
      { title: "Audience", href: "/dashboard/analytics/audience", items: [
        { title: "Geographic", href: "/dashboard/analytics/audience/geographic" },
        { title: "Devices", href: "/dashboard/analytics/audience/devices" }
      ]}
    ]
  }

]

interface NavItemProps {
  item: typeof navigationItems[0]
  isActive: boolean
  pathname: string
}

function NavItem({ item, isActive, pathname }: NavItemProps) {
  const [isExpanded, setIsExpanded] = useState(isActive)
  const Icon = item.icon

  return (
    <div className="space-y-1">
      <Link
        href={item.href}
        onClick={() => item.items && setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground"
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1">{item.title}</span>
        {item.items && (
          <ChevronDown 
            className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-180"
            )} 
          />
        )}
      </Link>
      
      {item.items && isExpanded && (
        <div className="ml-6 space-y-1">
          {item.items.map((subItem) => {
            const isSubActive = pathname === subItem.href || 
              (subItem.items && subItem.items.some(nestedItem => pathname === nestedItem.href))
            const [isSubExpanded, setIsSubExpanded] = useState(isSubActive)
            
            return (
              <div key={subItem.href} className="space-y-1">
                <Link
                  href={subItem.href}
                  onClick={(e) => {
                    if (subItem.items) {
                      e.preventDefault()
                      setIsSubExpanded(!isSubExpanded)
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                    isSubActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  <span className="flex-1">{subItem.title}</span>
                  {subItem.items && (
                    <ChevronDown 
                      className={cn(
                        "h-3 w-3 transition-transform",
                        isSubExpanded && "rotate-180"
                      )} 
                    />
                  )}
                </Link>
                
                {subItem.items && isSubExpanded && (
                  <div className="ml-4 space-y-1">
                    {subItem.items.map((nestedItem) => {
                      const isNestedActive = pathname === nestedItem.href
                      return (
                        <Link
                          key={nestedItem.href}
                          href={nestedItem.href}
                          className={cn(
                            "block rounded-lg px-3 py-1.5 text-xs transition-all hover:bg-accent hover:text-accent-foreground",
                            isNestedActive
                              ? "bg-accent text-accent-foreground font-medium"
                              : "text-muted-foreground"
                          )}
                        >
                          {nestedItem.title}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 top-0 z-30 w-64 h-screen bg-background border-r flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 p-6 border-b">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Eagle Analytics</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.items && item.items.some(subItem => pathname === subItem.href))
            
            return (
              <NavItem
                key={item.href}
                item={item}
                isActive={!!isActive}
                pathname={pathname}
              />
            )
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">User Name</p>
            <p className="text-xs text-muted-foreground truncate">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}