// components/auth/two-factor-form.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/types/auth';

interface TwoFactorFormProps {
  user: Partial<User>;
  onVerify: (code: string) => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
  error?: string;
  resendCode?: () => Promise<void>;
}

export function TwoFactorForm({ 
  user, 
  onVerify, 
  onBack, 
  isLoading, 
  error,
  resendCode 
}: TwoFactorFormProps) {
  const [code, setCode] = useState('');

  const handleVerify = async () => {
    if (code.length === 6) {
      await onVerify(code);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-medium">
            6-Digit Code
          </label>
          <Input
            id="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="000000"
            value={code}
            onChange={handleInputChange}
            maxLength={6}
            disabled={isLoading}
            className="text-center text-lg font-mono tracking-widest w-full"
          />
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <Button 
          onClick={handleVerify} 
          disabled={isLoading || code.length !== 6}
          className="w-full"
        >
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </Button>

        <div className="flex justify-between text-sm">
          <button
            type="button"
            onClick={onBack}
            className="text-blue-600 hover:underline"
            disabled={isLoading}
          >
            Back to Login
          </button>
          
          {resendCode && (
            <button
              type="button"
              onClick={resendCode}
              className="text-blue-600 hover:underline"
              disabled={isLoading}
            >
              Resend Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
}