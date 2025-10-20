'use client'

import React from 'react';
import { SecurityAlertsContainer } from '@/components/auth/security-alert';
import { ResponsiveSidebar } from '@/components/dashboard/responsive-sidebar';
import { useAuthStore } from '@/store/auth-store';

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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-semibold text-gray-900 ml-12 lg:ml-0">Admin Dashboard</h1>
              
              {/* Security Alerts Indicator */}
              {securityAlerts.length > 0 && (
                <div className="relative">
                  <div className="w-3 h-3 bg-red-500 rounded-full absolute -top-1 -right-1 animate-pulse"></div>
                  <span className="text-sm text-gray-600">
                    {securityAlerts.length} alert{securityAlerts.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

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