// components/auth/session-manager.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { TokenStorageService } from '@/lib/auth/token-storage.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock, LogOut } from 'lucide-react';

interface SessionManagerProps {
  children: React.ReactNode;
  warningTimeMinutes?: number;
  onSessionExpired?: () => void;
  onSessionWarning?: (minutesLeft: number) => void;
}

export function SessionManager({ 
  children, 
  warningTimeMinutes = 5,
  onSessionExpired,
  onSessionWarning 
}: SessionManagerProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [minutesLeft, setMinutesLeft] = useState(0);
  const [isExtending, setIsExtending] = useState(false);
  const router = useRouter();
  const { user, clearUser, updateLastActivity } = useAuthStore();

  useEffect(() => {
    const checkSession = () => {
      const token = TokenStorageService.getAccessToken();
      
      if (!token) {
        handleSessionExpired();
        return;
      }

      if (TokenStorageService.isTokenExpired(token)) {
        handleSessionExpired();
        return;
      }

      const expiry = TokenStorageService.getTokenExpiry(token);
      if (expiry) {
        const timeLeft = expiry.getTime() - Date.now();
        const minutesLeft = Math.floor(timeLeft / (1000 * 60));

        if (minutesLeft <= warningTimeMinutes && minutesLeft > 0) {
          setShowWarning(true);
          setMinutesLeft(minutesLeft);
          onSessionWarning?.(minutesLeft);
        } else if (minutesLeft <= 0) {
          handleSessionExpired();
        }
      }
    };

    // Update activity on user interaction
    const updateActivity = () => {
      updateLastActivity();
    };

    const interval = setInterval(checkSession, 30000); // Check every 30 seconds
    checkSession(); // Initial check

    // Add event listeners for user activity
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('click', updateActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, [warningTimeMinutes, onSessionExpired, onSessionWarning, updateLastActivity]);

  const handleSessionExpired = () => {
    TokenStorageService.clearTokens();
    clearUser();
    onSessionExpired?.();
    router.push('/session-expired');
  };

  const handleExtendSession = async () => {
    setIsExtending(true);
    const refreshToken = TokenStorageService.getRefreshToken();
    
    if (refreshToken) {
      try {
        // Import dynamically to avoid circular dependencies
        const { AuthService } = await import('@/lib/services/auth.service');
        const { ApiClient } = await import('@/lib/api/api-client');
        
        const authService = new AuthService(new ApiClient());
        const tokens = await authService.refreshToken(refreshToken);
        TokenStorageService.setTokens(tokens.accessToken, tokens.refreshToken);
        setShowWarning(false);
        updateLastActivity();
      } catch (error) {
        console.error('Failed to extend session:', error);
        handleSessionExpired();
      }
    } else {
      handleSessionExpired();
    }
    setIsExtending(false);
  };

  const handleLogout = () => {
    TokenStorageService.clearTokens();
    clearUser();
    setShowWarning(false);
    router.push('/login');
  };

  return (
    <>
      {children}
      
      {/* Session Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-yellow-500" />
              </div>
              <CardTitle className="text-xl">Session Expiring Soon</CardTitle>
              <CardDescription>
                Your session will expire in {minutesLeft} minute{minutesLeft !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                For security reasons, your session will automatically end soon.
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleExtendSession}
                  disabled={isExtending}
                  className="w-full"
                >
                  {isExtending ? 'Extending...' : 'Extend Session'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout Now
                </Button>
              </div>
              
              <p className="text-xs text-center text-gray-500">
                Last activity: {user?.lastLogin ? new Date(user.lastLogin).toLocaleTimeString() : 'Unknown'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}