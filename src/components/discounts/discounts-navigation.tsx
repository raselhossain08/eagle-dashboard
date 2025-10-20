// components/discounts/discounts-navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Tag,
  Ticket,
  Megaphone,
  Receipt,
  CheckCircle,
  BarChart3
} from 'lucide-react';

const navigationItems = [
  {
    title: "Overview",
    href: "/dashboard/discounts",
    icon: Tag,
    description: "Discounts overview and metrics"
  },
  {
    title: "Discount Codes",
    href: "/dashboard/discounts/codes",
    icon: Ticket,
    description: "Manage discount codes"
  },
  {
    title: "Campaigns",
    href: "/dashboard/discounts/campaigns",
    icon: Megaphone,
    description: "Marketing campaigns"
  },
  {
    title: "Redemptions",
    href: "/dashboard/discounts/redemptions",
    icon: Receipt,
    description: "Redemption tracking"
  },
  {
    title: "Validation",
    href: "/dashboard/discounts/validation",
    icon: CheckCircle,
    description: "Code validation tool"
  },
  {
    title: "Reports",
    href: "/dashboard/discounts/reports",
    icon: BarChart3,
    description: "Performance reports"
  }
];

export function DiscountsNavigation() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-accent text-accent-foreground" : "transparent"
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}