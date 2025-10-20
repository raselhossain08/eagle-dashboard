// components/auth/auth-layout.tsx
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  backgroundImage?: string;
}

export function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  showLogo = true,
  backgroundImage 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {showLogo && (
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Eagle Auth</h1>
              <p className="text-gray-600 mt-2">Professional Authentication System</p>
            </div>
          )}
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="text-gray-600 mt-2">{subtitle}</p>
            )}
          </div>
          
          {children}
        </div>
      </div>

      {/* Right side - Background */}
      <div 
        className="flex-1 hidden lg:block bg-cover bg-center"
        style={{
          backgroundImage: backgroundImage || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div className="h-full flex items-center justify-center bg-black bg-opacity-20">
          <div className="text-white text-center p-8">
            <h3 className="text-4xl font-bold mb-4">Secure Admin Dashboard</h3>
            <p className="text-xl opacity-90">
              Enterprise-grade authentication with advanced security features
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}