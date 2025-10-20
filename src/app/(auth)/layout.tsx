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
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Eagle Auth</h1>
            <p className="mt-2 text-sm text-gray-600">Professional Authentication System</p>
          </div>

          {/* Page Content */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                {getPageTitle(pathname)}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {pathname === '/login' && 'Sign in to access your admin dashboard'}
                {pathname === '/verify-2fa' && 'Enter your verification code to continue'}
                {pathname === '/forgot-password' && 'We\'ll help you reset your password'}
                {pathname === '/session-expired' && 'Your session has ended for security reasons'}
              </p>
            </div>

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

      {/* Right Panel - Security Features */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="flex flex-col justify-center px-12 py-12">
          <div className="max-w-md mx-auto">
            <div className="text-white mb-12">
              <h3 className="text-4xl font-bold mb-4">Enterprise Security</h3>
              <p className="text-blue-100 text-lg">
                Advanced authentication system with military-grade security features
                for your admin dashboard.
              </p>
            </div>

            <div className="space-y-6">
              {getSecurityFeatures().map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-blue-100">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Security Stats */}
            <div className="mt-12 p-6 bg-blue-500 bg-opacity-20 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">99.9%</div>
                  <div className="text-blue-100 text-sm">Uptime</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">256-bit</div>
                  <div className="text-blue-100 text-sm">Encryption</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-blue-100 text-sm">Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}