'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface RoleBasedAccessProps {
  requiredRoles: string[];
  userRole?: string | null;
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
  showFallback?: boolean;
}

export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  requiredRoles,
  userRole,
  children,
  fallbackComponent,
  showFallback = true,
}) => {
  const router = useRouter();

  // Check if user has required role
  const hasRequiredRole = userRole && requiredRoles.includes(userRole);

  if (hasRequiredRole) {
    return <>{children}</>;
  }

  // Show custom fallback if provided
  if (fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  // Show default access denied if showFallback is true
  if (showFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-2xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You don't have the required permissions to access this page.
            </p>
            <p className="text-sm text-muted-foreground">
              Required role(s): {requiredRoles.join(', ')}
            </p>
            {userRole && (
              <p className="text-sm text-muted-foreground">
                Your current role: {userRole}
              </p>
            )}
            <div className="flex flex-col gap-2 mt-6">
              <Button onClick={() => router.back()} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render anything if showFallback is false and no access
  return null;
};

export default RoleBasedAccess;