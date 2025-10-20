// components/dashboard/dashboard-layout-wrapper.tsx
'use client';

import React from 'react';
import { SessionManager } from '@/components/auth/session-manager';
import { DashboardLayoutClient } from '@/components/dashboard/dashboard-layout-client';

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
}

export function DashboardLayoutWrapper({ children }: DashboardLayoutWrapperProps) {
  const handleSessionExpired = () => {
    console.log('Session expired');
  };

  const handleSessionWarning = (minutesLeft: number) => {
    console.log(`Session warning: ${minutesLeft} minutes left`);
  };

  return (
    <SessionManager
      warningTimeMinutes={5}
      onSessionExpired={handleSessionExpired}
      onSessionWarning={handleSessionWarning}
    >
      <DashboardLayoutClient>
        {children}
      </DashboardLayoutClient>
    </SessionManager>
  );
}