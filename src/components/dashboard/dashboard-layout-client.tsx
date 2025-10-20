'use client'

import React from 'react';
import { SecurityAlertsContainer } from '@/components/auth/security-alert';
import { ResponsiveSidebar } from '@/components/dashboard/responsive-sidebar';
import { useAuthStore } from '@/store/auth-store';
import { Header } from './header';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const { securityAlerts, dismissSecurityAlert } = useAuthStore();

  const handleAlertAction = (alertId: string) => {
    console.log('Alert action triggered:', alertId);
    // Navigate to security settings or show details
  };

  return (
    <ResponsiveSidebar>
      <div className="min-h-screen bg-gray-50 w-full">
        <div className="w-full"><Header/></div>
        {/* Security Alerts Panel */}
        {securityAlerts.length > 0 && (
          <div className="bg-yellow-50 border-b border-yellow-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <SecurityAlertsContainer
                alerts={securityAlerts}
                onDismissAlert={dismissSecurityAlert}
                onActionAlert={handleAlertAction}
                maxAlerts={3}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="p-6">{children}</main>
      </div>
    </ResponsiveSidebar>
  );
}