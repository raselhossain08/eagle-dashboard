'use client';

import { ReactNode } from 'react';

interface AuditDashboardShellProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  filters?: ReactNode;
}

export function AuditDashboardShell({ 
  children, 
  title = "Audit Dashboard", 
  description, 
  actions,
  filters
}: AuditDashboardShellProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>

      {/* Filters */}
      {filters && (
        <div className="space-y-4">
          {filters}
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}