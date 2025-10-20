// app/(auth)/layout.tsx
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Shield, Lock, Activity } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();

  const getSecurityFeatures = () => {
    const features = [
      {
        icon: Shield,
        title: 'Enterprise Security',
        description: 'Military-grade encryption and security protocols'
      },
      {
        icon: Lock,
        title: '2FA Protection',
        description: 'Two-factor authentication for all admin accounts'
      },
      {
        icon: Activity,
        title: 'Real-time Monitoring',
        description: 'Continuous security monitoring and threat detection'
      }
    ];

    return features;
  };

  const getPageTitle = (path: string) => {
    const titles: { [key: string]: string } = {
      '/login': 'Welcome Back',
      '/verify-2fa': 'Two-Factor Verification',
      '/forgot-password': 'Reset Password',
      '/session-expired': 'Session Expired'
    };
    return titles[path] || 'Authentication';
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full ">

          {/* Page Content */}
          <div className="space-y-6">

            {children}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Secure access • Encrypted connection • 24/7 Monitoring
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}