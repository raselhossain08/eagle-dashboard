// app/(auth)/login/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { TwoFactorForm } from '@/components/auth/two-factor-form';
import { AuthLayout } from '@/components/auth/auth-layout';
import { User } from '@/types/auth';
import { AuthService } from '@/lib/services/auth.service';
import { ApiClient } from '@/lib/api/api-client';

export default function LoginPage() {
  const router = useRouter();
  const [requires2FA, setRequires2FA] = useState(false);
  const [pendingUser, setPendingUser] = useState<Partial<User> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSuccess = (response: any) => {
    router.push('/dashboard');
  };

  const handleRequire2FA = (user: Partial<User>) => {
    setPendingUser(user);
    setRequires2FA(true);
    setError('');
  };

  const handle2FABack = () => {
    setRequires2FA(false);
    setPendingUser(null);
    setError('');
  };

  const handle2FAVerify = async (code: string) => {
    if (!pendingUser?.id) return;

    setIsLoading(true);
    setError('');

    try {
      const authService = new AuthService(new ApiClient());
      const response = await authService.verify2FA(pendingUser.id, code);
      
      TokenStorageService.setTokens(response.accessToken, response.refreshToken);
      SessionStorageService.setUserSession(response.user);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={requires2FA ? "Two-Factor Verification" : "Welcome Back"}
      subtitle={requires2FA ? "Enter your verification code" : "Sign in to your admin account"}
    >
      {requires2FA && pendingUser ? (
        <TwoFactorForm
          user={pendingUser}
          onVerify={handle2FAVerify}
          onBack={handle2FABack}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <LoginForm
          onLogin={handleLoginSuccess}
          onRequire2FA={handleRequire2FA}
          isLoading={isLoading}
          error={error}
        />
      )}
    </AuthLayout>
  );
}