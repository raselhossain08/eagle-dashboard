// app/dashboard/billing/layout.tsx
import React from 'react';
import { BillingNavigation } from '@/components/billing/billing-navigation';

interface BillingLayoutProps {
  children: React.ReactNode;
}

export default function BillingLayout({ children }: BillingLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <div className="hidden w-64 lg:block border-r bg-muted/40">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Billing</h2>
            <p className="text-sm text-muted-foreground">
              Manage your billing and subscriptions
            </p>
          </div>
          <BillingNavigation />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50">
        <div className="flex justify-around p-2">
          <BillingNavigation className="flex-row w-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 pb-16 lg:pb-0">
        {children}
      </div>
    </div>
  );
}