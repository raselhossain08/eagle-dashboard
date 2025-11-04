'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Users, 
  ChevronDown,
  Activity,
  Shield,
  CreditCard,
  FileCheck,
  Tag,
  FolderOpen,
  Heart,
  Bell,
  Search,
  HelpCircle,
  Settings,
  UserCheck,
  X
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'

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
      { title: "Overview", href: "/dashboard/analytics" },
      { title: "Events", href: "/dashboard/analytics/events" },
      { title: "Funnels", href: "/dashboard/analytics/funnels" },
      { title: "Real-time", href: "/dashboard/analytics/real-time" },
      { title: "Reports", href: "/dashboard/analytics/reports", items: [
        { title: "Overview", href: "/dashboard/analytics/reports" },
        { title: "Revenue", href: "/dashboard/analytics/reports/revenue" },
        { title: "Cohorts", href: "/dashboard/analytics/reports/cohorts" },
        { title: "Goals", href: "/dashboard/analytics/reports/goals" }
      ]},
      { title: "Audience", href: "/dashboard/analytics/audience", items: [
        { title: "Overview", href: "/dashboard/analytics/audience" },
        { title: "Geographic", href: "/dashboard/analytics/audience/geographic" },
        { title: "Devices", href: "/dashboard/analytics/audience/devices" }
      ]}
    ]
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
    items: [
      { title: "Overview", href: "/dashboard/users" },
      { title: "Analytics", href: "/dashboard/users/analytics", items: [
        { title: "Overview", href: "/dashboard/users/analytics" },
        { title: "Growth", href: "/dashboard/users/analytics/growth" }
      ]},
      { title: "Segments", href: "/dashboard/users/segments" },
      { title: "Create User", href: "/dashboard/users/create" }
    ]
  },
  {
    title: "Subscribers",
    href: "/dashboard/subscribers",
    icon: UserCheck,
    items: [
      { title: "Overview", href: "/dashboard/subscribers" },
      { title: "Analytics", href: "/dashboard/subscribers/analytics" },
      { title: "Segments", href: "/dashboard/subscribers/segments" },
      { title: "Create Subscriber", href: "/dashboard/subscribers/create" }
    ]
  },
  {
    title: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
    items: [
      { title: "Overview", href: "/dashboard/billing" },
      { title: "Invoices", href: "/dashboard/billing/invoices", items: [
        { title: "All Invoices", href: "/dashboard/billing/invoices" },
        { title: "New Invoice", href: "/dashboard/billing/invoices/new" },
        { title: "Overdue", href: "/dashboard/billing/invoices/overdue" }
      ]},
      { title: "Plans", href: "/dashboard/billing/plans", items: [
        { title: "All Plans", href: "/dashboard/billing/plans" },
        { title: "New Plan", href: "/dashboard/billing/plans/new" }
      ]},
      { title: "Subscriptions", href: "/dashboard/billing/subscriptions", items: [
        { title: "All Subscriptions", href: "/dashboard/billing/subscriptions" },
        { title: "Analytics", href: "/dashboard/billing/subscriptions/analytics" }
      ]},
      { title: "Reports", href: "/dashboard/billing/reports", items: [
        { title: "Overview", href: "/dashboard/billing/reports" },
        { title: "Customer Cohort", href: "/dashboard/billing/reports/customer-cohort" },
        { title: "Invoice Summary", href: "/dashboard/billing/reports/invoice-summary" },
        { title: "MRR", href: "/dashboard/billing/reports/mrr" },
        { title: "Plan Performance", href: "/dashboard/billing/reports/plan-performance" },
        { title: "Revenue", href: "/dashboard/billing/reports/revenue" }
      ]}
    ]
  },
  {
    title: "Support",
    href: "/dashboard/support",
    icon: HelpCircle,
    items: [
      { title: "Overview", href: "/dashboard/support" },
      { title: "Analytics", href: "/dashboard/support/analytics", items: [
        { title: "Overview", href: "/dashboard/support/analytics" },
        { title: "Performance", href: "/dashboard/support/analytics/performance" },
        { title: "Reports", href: "/dashboard/support/analytics/reports" }
      ]},
      { title: "Tickets", href: "/dashboard/support/tickets", items: [
        { title: "All Tickets", href: "/dashboard/support/tickets" },
        { title: "Create Ticket", href: "/dashboard/support/tickets/create" }
      ]},
      { title: "Customers", href: "/dashboard/support/customers" },
      { title: "Impersonation", href: "/dashboard/support/impersonation", items: [
        { title: "Overview", href: "/dashboard/support/impersonation" },
        { title: "Active Sessions", href: "/dashboard/support/impersonation/active" },
        { title: "History", href: "/dashboard/support/impersonation/history" }
      ]},
      { title: "Saved Replies", href: "/dashboard/support/saved-replies", items: [
        { title: "All Replies", href: "/dashboard/support/saved-replies" },
        { title: "Create Reply", href: "/dashboard/support/saved-replies/create" }
      ]}
    ]
  },
  {
    title: "Contracts",
    href: "/dashboard/contracts",
    icon: FileCheck,
    items: [
      { title: "Overview", href: "/dashboard/contracts" },
      { title: "List", href: "/dashboard/contracts/list" },
      { title: "Create", href: "/dashboard/contracts/create" },
      { title: "Templates", href: "/dashboard/contracts/templates", items: [
        { title: "All Templates", href: "/dashboard/contracts/templates" },
        { title: "New Template", href: "/dashboard/contracts/templates/new" }
      ]},
      { title: "Signatures", href: "/dashboard/contracts/signatures" },
      { title: "Analytics", href: "/dashboard/contracts/analytics", items: [
        { title: "Overview", href: "/dashboard/contracts/analytics" },
        { title: "Compliance", href: "/dashboard/contracts/analytics/compliance" }
      ]}
    ]
  },
  {
    title: "Discounts",
    href: "/dashboard/discounts",
    icon: Tag,
    items: [
      { title: "Overview", href: "/dashboard/discounts" },
      { title: "Codes", href: "/dashboard/discounts/codes", items: [
        { title: "All Codes", href: "/dashboard/discounts/codes" },
        { title: "New Code", href: "/dashboard/discounts/codes/new" },
        { title: "Bulk Create", href: "/dashboard/discounts/codes/bulk" }
      ]},
      { title: "Campaigns", href: "/dashboard/discounts/campaigns", items: [
        { title: "All Campaigns", href: "/dashboard/discounts/campaigns" },
        { title: "New Campaign", href: "/dashboard/discounts/campaigns/new" }
      ]},
      { title: "Redemptions", href: "/dashboard/discounts/redemptions", items: [
        { title: "All Redemptions", href: "/dashboard/discounts/redemptions" },
        { title: "Analytics", href: "/dashboard/discounts/redemptions/analytics" },
        { title: "Suspicious", href: "/dashboard/discounts/redemptions/suspicious" }
      ]},
      { title: "Reports", href: "/dashboard/discounts/reports", items: [
        { title: "Overview", href: "/dashboard/discounts/reports" },
        { title: "Performance", href: "/dashboard/discounts/reports/performance" }
      ]},
      { title: "Validation", href: "/dashboard/discounts/validation" }
    ]
  },
  {
    title: "Files",
    href: "/dashboard/files",
    icon: FolderOpen,
    items: [
      { title: "Overview", href: "/dashboard/files" },
      { title: "Documents", href: "/dashboard/files/documents" },
      { title: "Gallery", href: "/dashboard/files/gallery" },
      { title: "Folders", href: "/dashboard/files/folders" },
      { title: "Admin", href: "/dashboard/files/admin", items: [
        { title: "Overview", href: "/dashboard/files/admin" },
        { title: "Analytics", href: "/dashboard/files/admin/analytics" }
      ]}
    ]
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
    items: [
      { title: "Overview", href: "/dashboard/reports" },
      { title: "Custom", href: "/dashboard/reports/custom" },
      { title: "Financial", href: "/dashboard/reports/financial", items: [
        { title: "Overview", href: "/dashboard/reports/financial" },
        { title: "Revenue", href: "/dashboard/reports/financial/revenue" },
        { title: "Subscriptions", href: "/dashboard/reports/financial/subscriptions" }
      ]},
      { title: "Users", href: "/dashboard/reports/users", items: [
        { title: "Overview", href: "/dashboard/reports/users" },
        { title: "Acquisition", href: "/dashboard/reports/users/acquisition" },
        { title: "Activity", href: "/dashboard/reports/users/activity" },
        { title: "Retention", href: "/dashboard/reports/users/retention" }
      ]}
    ]
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    items: [
      { title: "Overview", href: "/dashboard/notifications" },
      { title: "Analytics", href: "/dashboard/notifications/analytics" },
      { title: "Templates", href: "/dashboard/notifications/templates", items: [
        { title: "All Templates", href: "/dashboard/notifications/templates" },
        { title: "Create Template", href: "/dashboard/notifications/templates/create" }
      ]},
      { title: "Email", href: "/dashboard/notifications/email", items: [
        { title: "Overview", href: "/dashboard/notifications/email" },
        { title: "Send", href: "/dashboard/notifications/email/send" }
      ]}
    ]
  },
  {
    title: "Audit",
    href: "/dashboard/audit",
    icon: Shield,
    items: [
      { title: "Overview", href: "/dashboard/audit" },
      { title: "Logs", href: "/dashboard/audit/logs" },
      { title: "Admin Activity", href: "/dashboard/audit/admin-activity" },
      { title: "System Activity", href: "/dashboard/audit/system-activity" },
      { title: "Resource History", href: "/dashboard/audit/resource-history" }
    ]
  },
  {
    title: "System",
    href: "/dashboard/system",
    icon: Settings,
    items: [
      { title: "Overview", href: "/dashboard/system" },
      { title: "Health", href: "/dashboard/system/health", items: [
        { title: "Overview", href: "/dashboard/system/health" },
        { title: "Alerts", href: "/dashboard/system/health/alerts" },
        { title: "Metrics", href: "/dashboard/system/health/metrics" }
      ]},
      { title: "Settings", href: "/dashboard/system/settings", items: [
        { title: "Overview", href: "/dashboard/system/settings" },
        { title: "Feature Flags", href: "/dashboard/system/settings/feature-flags" }
      ]},
      { title: "Maintenance", href: "/dashboard/system/maintenance", items: [
        { title: "Overview", href: "/dashboard/system/maintenance" },
        { title: "Backups", href: "/dashboard/system/maintenance/backups" },
        { title: "Cleanup", href: "/dashboard/system/maintenance/cleanup" },
        { title: "Schedule", href: "/dashboard/system/maintenance/schedule" }
      ]},
      { title: "Webhooks", href: "/dashboard/system/webhooks", items: [
        { title: "Overview", href: "/dashboard/system/webhooks" },
        { title: "Endpoints", href: "/dashboard/system/webhooks/endpoints" },
        { title: "Events", href: "/dashboard/system/webhooks/events" },
        { title: "Logs", href: "/dashboard/system/webhooks/logs" }
      ]}
    ]
  },
  {
    title: "Health",
    href: "/dashboard/health",
    icon: Heart,
    description: "System health monitoring"
  },
  {
    title: "Security",
    href: "/dashboard/security",
    icon: Shield,
    description: "Security dashboard"
  },
  {
    title: "Search",
    href: "/dashboard/search",
    icon: Search,
    description: "Advanced search"
  },
  {
    title: "API Docs",
    href: "http://localhost:5000/api/docs",
    icon: FileText,
    description: "Backend API documentation",
    external: true
  }
]

interface NavItemProps {
  item: typeof navigationItems[0]
  isActive: boolean
  pathname: string
  onLinkClick?: () => void
}

interface SubNavItemProps {
  subItem: { title: string; href: string; items?: { title: string; href: string }[] }
  pathname: string
  onLinkClick?: () => void
}

function SubNavItem({ subItem, pathname, onLinkClick }: SubNavItemProps) {
  const isSubActive = pathname === subItem.href || 
    (subItem.items && subItem.items.some(nestedItem => pathname === nestedItem.href))
  const [isSubExpanded, setIsSubExpanded] = useState(isSubActive)
  
  const handleSubClick = (e: React.MouseEvent) => {
    if (subItem.items) {
      e.preventDefault()
      setIsSubExpanded(!isSubExpanded)
    } else {
      onLinkClick?.()
    }
  }
  
  return (
    <div className="space-y-1">
      <Link
        href={subItem.href}
        onClick={handleSubClick}
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
                onClick={() => onLinkClick?.()}
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
}

function NavItem({ item, isActive, pathname, onLinkClick }: NavItemProps) {
  const [isExpanded, setIsExpanded] = useState(isActive)
  const Icon = item.icon

  const handleClick = (e: React.MouseEvent) => {
    if (item.items) {
      e.preventDefault()
      setIsExpanded(!isExpanded)
    } else if ((item as any).external) {
      // Handle external links
      e.preventDefault()
      window.open(item.href, '_blank', 'noopener,noreferrer')
      onLinkClick?.()
    } else {
      onLinkClick?.()
    }
  }

  return (
    <div className="space-y-1">
      <Link
        href={item.href}
        onClick={handleClick}
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
          {item.items.map((subItem) => (
            <SubNavItem
              key={subItem.href}
              subItem={subItem}
              pathname={pathname}
              onLinkClick={onLinkClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface SidebarNavProps {
  onClose?: () => void;
}

export function SidebarNav({ onClose }: SidebarNavProps) {
  const pathname = usePathname()
  const { user, clearUser } = useAuthStore();

  const handleLogout = () => {
    clearUser();
    // Redirect to login page
    window.location.href = '/auth/login';
  };

  const handleLinkClick = () => {
    // Close mobile sidebar when a link is clicked
    onClose?.();
  };

  return (
    <div className="w-full h-full bg-background border-r flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 p-6 border-b">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Eagle Dashboard</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto lg:hidden p-1 rounded-lg hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.items && item.items.some(subItem => 
                pathname === subItem.href || 
                (subItem.items && subItem.items.some(nestedItem => pathname === nestedItem.href))
              ))
            
            return (
              <NavItem
                key={item.href}
                item={item}
                isActive={!!isActive}
                pathname={pathname}
                onLinkClick={handleLinkClick}
              />
            )
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.email || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.role || 'User'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}