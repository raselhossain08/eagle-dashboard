// components/auth/protected-route.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminRole, User } from '@/types/auth';
import { TokenStorageService } from '@/lib/auth/token-storage.service';
import { SessionStorageService } from '@/lib/auth/session-storage.service';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AdminRole[];
  requiredPermissions?: string[];
  fallbackComponent?: React.ComponentType;
}

export function ProtectedRoute({ 
  children, 
  requiredRole = [], 
  requiredPermissions = [],
  fallbackComponent: FallbackComponent 
}: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // Migrate any legacy cookies to the new format
      TokenStorageService.migrateLegacyCookies();
      SessionStorageService.migrateLegacyCookies();

      const token = TokenStorageService.getAccessToken();
      const user = SessionStorageService.getUserSession();

      if (!token || !user) {
        router.push('/login');
        return;
      }

      // Check token validity
      if (TokenStorageService.isTokenExpired(token)) {
        TokenStorageService.clearAllAuthCookies();
        SessionStorageService.clearAllSessionCookies();
        router.push('/login');
        return;
      }

      // Check role permissions
      if (requiredRole.length > 0 && !requiredRole.includes(user.role)) {
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);
    };

    checkAuth();
  }, [requiredRole, requiredPermissions, router]);

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return FallbackComponent ? <FallbackComponent /> : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}