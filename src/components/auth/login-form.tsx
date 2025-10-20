// components/auth/login-form.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { LoginCredentials, User } from '@/types/auth';
import { AuthService } from '@/lib/services/auth.service';
import { TokenStorageService } from '@/lib/auth/token-storage.service';
import { SessionStorageService } from '@/lib/auth/session-storage.service';

interface LoginFormProps {
  onLogin: (response: any) => void;
  onRequire2FA: (user: Partial<User>) => void;
  isLoading?: boolean;
  error?: string;
}

export function LoginForm({ onLogin, onRequire2FA, isLoading: parentLoading, error: parentError }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const isLoading = parentLoading || isSubmitting;
  const error = parentError || submitError;

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear any previous submit errors when user starts typing
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleLogin = async () => {
    if (isLoading) {
      console.log('⚠️ Already loading, aborting');
      return;
    }
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }
    
    console.log('✅ Form valid, starting auth');
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const authService = new AuthService();
      const loginData: LoginCredentials = {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      };
      
      console.log('🔄 Making API call...');
      const response = await authService.login(loginData);
      console.log('✅ API call successful');
      
      if (response.requiresTwoFactor) {
        onRequire2FA(response.user);
      } else {
        TokenStorageService.setTokens(response.accessToken, response.refreshToken);
        SessionStorageService.setUserSession(response.user);
        SessionStorageService.setRememberMe(formData.rememberMe);
        onLogin(response);
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      let errorMessage = 'Login failed. Please try again.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      console.log('Setting error message:', errorMessage);
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 login-form">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
          {formErrors.email && (
            <p className="text-sm text-red-600">{formErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
          {formErrors.password && (
            <p className="text-sm text-red-600">{formErrors.password}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            checked={formData.rememberMe}
            onCheckedChange={(checked) => handleInputChange('rememberMe', checked as boolean)}
          />
          <Label htmlFor="rememberMe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Remember me
          </Label>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <Button 
          type="button"
          className="w-full" 
          disabled={isLoading}
          onClick={handleLogin}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        <div className="text-center">
          <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
}