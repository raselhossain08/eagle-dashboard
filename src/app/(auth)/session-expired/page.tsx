// app/(auth)/session-expired/page.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Clock, LogIn, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export default function SessionExpiredPage() {
  const router = useRouter();
  const { clearUser } = useAuthStore();

  const handleRefresh = () => {
    // Clear any stale data
    clearUser();
    localStorage.removeItem('pending2FAUser');
    sessionStorage.clear();
    
    router.push('/login');
  };

  return (
    <AuthLayout
      title="Session Expired"
      subtitle="Your session has ended for security reasons"
      showLogo={true}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Clock className="h-12 w-12 text-orange-500" />
          </div>
          <CardTitle>Session Expired</CardTitle>
          <CardDescription>
            For security reasons, your session has automatically ended due to inactivity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p>This could be because:</p>
            <ul className="list-disc list-inside space-y-1 text-left">
              <li>You were inactive for too long</li>
              <li>Your token has expired</li>
              <li>You logged in from another device</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleRefresh} className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In Again
            </Button>
            
            <Link href="/login">
              <Button variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Return to Login
              </Button>
            </Link>
          </div>

          <div className="text-xs text-center text-gray-500 pt-4">
            <p>Need help? Contact your system administrator.</p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}