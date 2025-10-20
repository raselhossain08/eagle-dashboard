import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  FileText, 
  ScrollText, 
  Template, 
  PenTool, 
  BarChart3,
  Plus 
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigationItems = [
  {
    title: "Overview",
    href: "/dashboard/contracts",
    icon: FileText,
    description: "Contracts overview and metrics"
  },
  {
    title: "Contracts",
    href: "/dashboard/contracts/list",
    icon: ScrollText,
    description: "Manage all contracts"
  },
  {
    title: "Templates",
    href: "/dashboard/contracts/templates",
    icon: Template,
    description: "Contract templates"
  },
  {
    title: "Signatures",
    href: "/dashboard/contracts/signatures",
    icon: PenTool,
    description: "Digital signatures"
  },
  {
    title: "Analytics",
    href: "/dashboard/contracts/analytics",
    icon: BarChart3,
    description: "Contracts analytics"
  }
]

interface ContractsNavigationProps {
  className?: string
  onActionClick?: () => void
}

export function ContractsNavigation({ className, onActionClick }: ContractsNavigationProps) {
  const pathname = usePathname()

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
      
      <div className="mt-4 border-t pt-4">
        <Button 
          className="w-full" 
          onClick={onActionClick}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Contract
        </Button>
      </div>
    </div>
  )
}