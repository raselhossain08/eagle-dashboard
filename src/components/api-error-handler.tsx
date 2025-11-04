'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, ArrowLeft, Shield, Network } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ApiErrorHandlerProps {
  error?: Error | null;
  isLoading?: boolean;
  onRetry?: () => void;
  fallbackMessage?: string;
  showBackButton?: boolean;
  backButtonUrl?: string;
  variant?: 'inline' | 'page' | 'card';
  className?: string;
}

export const ApiErrorHandler: React.FC<ApiErrorHandlerProps> = ({
  error,
  isLoading,
  onRetry,
  fallbackMessage,
  showBackButton = false,
  backButtonUrl = '/dashboard',
  variant = 'inline',
  className = '',
}) => {
  const router = useRouter();

  if (isLoading) return null;
  if (!error) return null;

  const isAuthError = error.message?.toLowerCase().includes('authentication') ||
                     error.message?.toLowerCase().includes('unauthorized') ||
                     error.message?.toLowerCase().includes('401');

  const isNetworkError = error.message?.toLowerCase().includes('network') ||
                        error.message?.toLowerCase().includes('fetch');

  const isPermissionError = error.message?.toLowerCase().includes('permission') ||
                           error.message?.toLowerCase().includes('forbidden') ||
                           error.message?.toLowerCase().includes('403');

  const getErrorIcon = () => {
    if (isAuthError) return Shield;
    if (isNetworkError) return Network;
    return AlertTriangle;
  };

  const getErrorTitle = () => {
    if (isAuthError) return 'Authentication Required';
    if (isNetworkError) return 'Connection Error';
    if (isPermissionError) return 'Access Denied';
    return 'Something went wrong';
  };

  const getErrorMessage = () => {
    if (isAuthError) return 'Please sign in to continue accessing this content.';
    if (isNetworkError) return 'Unable to connect to the server. Please check your internet connection.';
    if (isPermissionError) return 'You don\'t have permission to access this resource.';
    return fallbackMessage || error.message || 'An unexpected error occurred. Please try again.';
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoBack = () => {
    if (showBackButton && backButtonUrl) {
      router.push(backButtonUrl);
    } else {
      router.back();
    }
  };

  const ErrorIcon = getErrorIcon();

  if (variant === 'page') {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-background ${className}`}>
        <div className="text-center space-y-6 max-w-md mx-4">
          <ErrorIcon className="h-16 w-16 text-destructive mx-auto" />
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{getErrorTitle()}</h1>
            <p className="text-muted-foreground text-lg">{getErrorMessage()}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {showBackButton && (
              <Button variant="outline" onClick={handleGoBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            )}
            <Button onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
          {isAuthError && (
            <div className="mt-6">
              <Link href="/login">
                <Button variant="default" size="lg">
                  <Shield className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={`w-full max-w-md mx-auto ${className}`}>
        <CardHeader className="text-center">
          <ErrorIcon className="h-12 w-12 text-destructive mx-auto mb-2" />
          <CardTitle className="text-xl">{getErrorTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{getErrorMessage()}</p>
          <div className="flex flex-col gap-2">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            {showBackButton && (
              <Button variant="outline" onClick={handleGoBack} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            )}
            {isAuthError && (
              <Link href="/login">
                <Button variant="secondary" className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Inline variant (default)
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="text-center space-y-4 max-w-sm">
        <ErrorIcon className="h-10 w-10 text-destructive mx-auto" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{getErrorTitle()}</h3>
          <p className="text-sm text-muted-foreground">{getErrorMessage()}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={handleRetry} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          {showBackButton && (
            <Button variant="outline" onClick={handleGoBack} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          )}
          {isAuthError && (
            <Link href="/login">
              <Button variant="secondary" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiErrorHandler;