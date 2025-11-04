// components/errors/ApiErrorHandler.tsx
'use client';

import { ReactNode } from 'react';
import { Shield, AlertTriangle, RefreshCw, WifiOff, Server, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  requestId?: string;
}

interface ApiErrorHandlerProps {
  error: ApiError | Error | null;
  retry?: () => void;
  fallback?: ReactNode;
  className?: string;
}

export function ApiErrorHandler({ error, retry, fallback, className }: ApiErrorHandlerProps) {
  if (!error) return null;

  // Parse error if it's a generic Error object
  let apiError: ApiError;
  if (error instanceof Error) {
    try {
      const errorData = JSON.parse(error.message);
      apiError = errorData;
    } catch {
      // If parsing fails, create a generic error structure
      apiError = {
        statusCode: 500,
        message: error.message,
        error: 'Internal Error',
        timestamp: new Date().toISOString(),
        path: window.location.pathname,
      };
    }
  } else {
    apiError = error as ApiError;
  }

  // Handle different error types
  const getErrorConfig = (statusCode: number) => {
    switch (statusCode) {
      case 403:
        return {
          icon: Shield,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          borderColor: 'border-red-200 dark:border-red-800',
          title: 'Access Forbidden',
          description: 'You don\'t have permission to access this resource',
          actionable: true,
        };
      case 401:
        return {
          icon: Shield,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          title: 'Authentication Required',
          description: 'Please log in to continue',
          actionable: true,
        };
      case 404:
        return {
          icon: AlertTriangle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-950/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          title: 'Not Found',
          description: 'The requested resource was not found',
          actionable: false,
        };
      case 429:
        return {
          icon: Clock,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 dark:bg-purple-950/20',
          borderColor: 'border-purple-200 dark:border-purple-800',
          title: 'Rate Limited',
          description: 'Too many requests. Please wait before trying again',
          actionable: true,
        };
      case 500:
      case 502:
      case 503:
        return {
          icon: Server,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          borderColor: 'border-red-200 dark:border-red-800',
          title: 'Server Error',
          description: 'An internal server error occurred',
          actionable: true,
        };
      default:
        return {
          icon: WifiOff,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 dark:bg-gray-950/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          title: 'Connection Error',
          description: 'Unable to connect to the server',
          actionable: true,
        };
    }
  };

  const config = getErrorConfig(apiError.statusCode);
  const IconComponent = config.icon;

  // Handle specific 403 permission errors
  if (apiError.statusCode === 403) {
    const requiredRoles = apiError.message.includes('Required roles:') 
      ? apiError.message.split('Required roles: ')[1]?.split(', ') || []
      : ['admin', 'manager', 'support']; // Default from error message

    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className={className}>
        <Card className={`${config.bgColor} ${config.borderColor} border`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${config.color}`}>
              <IconComponent className="h-5 w-5" />
              {config.title}
            </CardTitle>
            <CardDescription>
              {config.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Permission denied:</strong> {apiError.message}
              </AlertDescription>
            </Alert>

            <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Required Permissions:</h4>
              <div className="flex flex-wrap gap-2">
                {requiredRoles.map((role) => (
                  <Badge key={role} variant="outline">
                    {role.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>

            {apiError.requestId && (
              <div className="text-xs text-muted-foreground">
                Request ID: <code className="bg-muted px-1 rounded">{apiError.requestId}</code>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/login'}
              >
                Re-authenticate
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/dashboard'}
              >
                Dashboard Home
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('mailto:admin@yourcompany.com?subject=Access Request&body=Request access to: ' + apiError.path)}
              >
                Request Access
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle other error types
  return (
    <div className={className}>
      <Card className={`${config.bgColor} ${config.borderColor} border`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${config.color}`}>
            <IconComponent className="h-5 w-5" />
            {config.title}
          </CardTitle>
          <CardDescription>
            {config.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error {apiError.statusCode}:</strong> {apiError.message}
            </AlertDescription>
          </Alert>

          <div className="bg-white/50 dark:bg-black/20 p-3 rounded text-sm">
            <p><strong>Path:</strong> {apiError.path}</p>
            <p><strong>Timestamp:</strong> {new Date(apiError.timestamp).toLocaleString()}</p>
            {apiError.requestId && (
              <p><strong>Request ID:</strong> <code className="bg-muted px-1 rounded">{apiError.requestId}</code></p>
            )}
          </div>

          <div className="flex gap-2">
            {config.actionable && retry && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={retry}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
            {apiError.statusCode === 401 && (
              <Button 
                size="sm"
                onClick={() => window.location.href = '/login'}
              >
                Login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for handling API errors consistently
export function useApiErrorHandler() {
  const handleError = (error: any) => {
    console.error('API Error:', error);
    
    // If it's already an API error object, return it
    if (error.statusCode && error.message) {
      return error;
    }

    // Try to extract error from different formats
    if (error.response?.data) {
      return error.response.data;
    }

    if (error.data) {
      return error.data;
    }

    // Create generic error structure
    return {
      statusCode: error.status || 500,
      message: error.message || 'An unexpected error occurred',
      error: error.name || 'Error',
      timestamp: new Date().toISOString(),
      path: window.location.pathname,
      requestId: error.requestId || undefined,
    };
  };

  return { handleError };
}