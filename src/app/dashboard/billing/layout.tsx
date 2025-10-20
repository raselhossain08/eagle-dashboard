// app/dashboard/billing/layout.tsx
import React from 'react';
import { BillingNavigation } from '@/components/billing/billing-navigation';

interface BillingLayoutProps {
  children: React.ReactNode;
}

export default function BillingLayout({ children }: BillingLayoutProps) {
  return (
    <div className=" min-h-screen">
      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}