// app/(auth)/verify-2fa/page.tsx
'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TwoFactorForm } from '@/components/auth/two-factor-form';
import { AuthLayout } from '@/components/auth/auth-layout';

export default function Verify2FAPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const handleVerify = async (code: string) => {
    // Implementation for direct 2FA verification
    console.log('Verifying code:', code);
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
      />
    </AuthLayout>
  );
}