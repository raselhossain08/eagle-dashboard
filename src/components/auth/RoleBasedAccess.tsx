// components/auth/RoleBasedAccess.tsx
'use client';

import { ReactNode } from 'react';
import { useUser } from '@/hooks/use-auth';
import { AdminRole } from '@/types/auth';
import { Shield, AlertTriangle, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RoleBasedAccessProps {
  children: ReactNode;
  requiredRoles: AdminRole[];
  fallback?: ReactNode;
  showDetails?: boolean;
}

const ROLE_HIERARCHY: Record<AdminRole, number> = {
  'super_admin': 5,
  'finance_admin': 4,
  'growth_marketing': 3,
  'support': 2,
  'read_only': 1,
};

const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  'super_admin': 'Full system access with all administrative privileges',
  'finance_admin': 'Financial data and billing management access',
  'growth_marketing': 'Marketing analytics and user acquisition data',
  'support': 'Customer support and subscriber management',
  'read_only': 'View-only access to basic dashboard features',
};

export function RoleBasedAccess({ 
  children, 
  requiredRoles, 
  fallback,
  showDetails = true 
}: RoleBasedAccessProps) {
  const { data: user, isLoading, error } = useUser();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Checking permissions...</span>
      </div>
    );
  }

  // Show error state
  if (error || !user) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Authentication Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please log in to access this content.
            </AlertDescription>
          </Alert>
          <Button className="w-full mt-4" onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Check if user has required role
  const userRoleLevel = ROLE_HIERARCHY[user.role];
  const hasAccess = requiredRoles.some(role => {
    const requiredLevel = ROLE_HIERARCHY[role];
    return userRoleLevel >= requiredLevel;
  });

  // User has access - render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // User doesn't have access - show fallback or default access denied
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default access denied component
  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Lock className="h-5 w-5" />
            Access Denied
          </CardTitle>
          <CardDescription>
            You don't have sufficient permissions to access this content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Required permissions:</strong> This resource requires one of the following roles: {' '}
              {requiredRoles.map((role, index) => (
                <Badge key={role} variant="outline" className="mx-1">
                  {role.replace('_', ' ').toUpperCase()}
                </Badge>
              ))}
            </AlertDescription>
          </Alert>

          {showDetails && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Your Current Access Level:</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {user.role.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {ROLE_DESCRIPTIONS[user.role]}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">
                  Required Access Levels:
                </h4>
                <div className="space-y-2">
                  {requiredRoles.map((role) => (
                    <div key={role} className="flex items-center gap-2">
                      <Badge variant="outline" className="text-blue-700 dark:text-blue-300">
                        {role.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        {ROLE_DESCRIPTIONS[role]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-yellow-800 dark:text-yellow-200">
                  Need Higher Permissions?
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  Contact your system administrator to request elevated permissions for your account.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open('mailto:admin@yourcompany.com?subject=Access Request&body=I need access to: ' + window.location.pathname, '_blank')}
                >
                  Request Access
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="flex-1"
            >
              Go Back
            </Button>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1"
            >
              Dashboard Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function withRoleBasedAccess<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles: AdminRole[],
  options?: { 
    fallback?: ReactNode; 
    showDetails?: boolean;
  }
) {
  return function ProtectedComponent(props: P) {
    return (
      <RoleBasedAccess 
        requiredRoles={requiredRoles}
        fallback={options?.fallback}
        showDetails={options?.showDetails}
      >
        <Component {...props} />
      </RoleBasedAccess>
    );
  };
}

// Utility function to check roles programmatically
export function hasRequiredRole(userRole: AdminRole, requiredRoles: AdminRole[]): boolean {
  const userRoleLevel = ROLE_HIERARCHY[userRole];
  return requiredRoles.some(role => {
    const requiredLevel = ROLE_HIERARCHY[role];
    return userRoleLevel >= requiredLevel;
  });
}