'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FileText, Folder, BarChart3, Settings, Shield } from 'lucide-react';

const navigationItems = [
  {
    title: 'Overview',
    href: '/dashboard/files',
    icon: BarChart3,
  },
  {
    title: 'Documents',
    href: '/dashboard/files/documents',
    icon: FileText,
  },
  {
    title: 'Folders',
    href: '/dashboard/files/folders',
    icon: Folder,
  },
  {
    title: 'Admin',
    href: '/dashboard/files/admin',
    icon: Shield,
  },
  {
    title: 'Settings',
    href: '/dashboard/files/settings',
    icon: Settings,
  },
];

export function FilesNavigation() {
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