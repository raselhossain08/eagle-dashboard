// app/(auth)/verify-2fa/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TwoFactorForm } from '@/components/auth/two-factor-form';
import { AuthLayout } from '@/components/auth/auth-layout';
import { authApi } from '@/lib/api/auth';
import { TokenStorageService } from '@/lib/auth/token-storage.service';
import { SessionStorageService } from '@/lib/auth/session-storage.service';
import { useAuthStore } from '@/store/auth-store';
import { AdminRole } from '@/types/auth';

export default function Verify2FAPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const { setUser } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (code: string) => {
    if (!userId) {
      setError('User ID is missing. Please go back to login.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Verifying 2FA code:', code, 'for user:', userId);
      
      const response = await authApi.verify2FA({
        userId,
        code
      });

      console.log('2FA verification successful:', response);

      // Create complete user object
      const user = {
        ...response.user,
        role: response.user.role as AdminRole,
        isActive: true,
        isTwoFactorEnabled: true
      };

      // Store tokens
      TokenStorageService.setTokens(response.accessToken, response.refreshToken);
      SessionStorageService.setUserSession(user);
      
      // Update auth store
      setUser(user);

      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (err: any) {
      console.error('2FA verification error:', err);
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/login');
  };

  return (
    <AuthLayout
      title="Two-Factor Authentication"
      subtitle="Enter the verification code from your authenticator app"
    >
      <TwoFactorForm
        user={{ id: userId || '' }}
        onVerify={handleVerify}
        onBack={handleBack}
        isLoading={isLoading}
        error={error}
      />
    </AuthLayout>
  );
}