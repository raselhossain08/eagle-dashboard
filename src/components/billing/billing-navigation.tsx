'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Receipt, DollarSign, CreditCard, BarChart3, Settings } from 'lucide-react';

const navigationItems = [
  {
    title: 'Overview',
    href: '/dashboard/billing',
    icon: BarChart3,
  },
  {
    title: 'Invoices',
    href: '/dashboard/billing/invoices',
    icon: Receipt,
  },
  {
    title: 'Payments',
    href: '/dashboard/billing/payments',
    icon: CreditCard,
  },
  {
    title: 'Revenue',
    href: '/dashboard/billing/revenue',
    icon: DollarSign,
  },
  {
    title: 'Settings',
    href: '/dashboard/billing/settings',
    icon: Settings,
  },
];

export function BillingNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        
        return (
          <Button
            key={item.href}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            asChild
          >
            <Link 
              href={item.href}
              className={cn(
                "flex items-center space-x-2",
                isActive && "bg-primary text-primary-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}