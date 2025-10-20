// app/dashboard/layout.tsx
import React from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayoutWrapper } from '@/components/dashboard/dashboard-layout-wrapper';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute requiredRole={['super_admin', 'finance_admin', 'growth_marketing', 'support', 'read_only']}>
      <DashboardLayoutWrapper>
        {children}
      </DashboardLayoutWrapper>
    </ProtectedRoute>
  );
}