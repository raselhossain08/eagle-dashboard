'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TokenStorageService } from '@/lib/auth/token-storage.service';
import { CookiesService } from '@/lib/auth/cookies.service';
import { useAuthStore } from '@/store/auth-store';
import { AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';

export function AuthDebug() {
  const { user, isAuthenticated } = useAuthStore();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshTokenInfo = () => {
    const accessToken = TokenStorageService.getAccessToken();
    const refreshToken = TokenStorageService.getRefreshToken();
    const allCookies = CookiesService.getAllCookies();
    const eagleCookies = CookiesService.getEagleAuthCookies();

    let decodedToken = null;
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        decodedToken = {
          ...payload,
          exp: new Date(payload.exp * 1000),
          iat: new Date(payload.iat * 1000),
          isExpired: TokenStorageService.isTokenExpired(accessToken)
        };
      } catch (error) {
        decodedToken = { error: 'Invalid token format' };
      }
    }

    setTokenInfo({
      accessToken: accessToken ? accessToken.substring(0, 50) + '...' : null,
      refreshToken: refreshToken ? refreshToken.substring(0, 50) + '...' : null,
      decodedToken,
      allCookies,
      eagleCookies,
      hasToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    });
  };

  const testUsersMetricsEndpoint = async () => {
    setIsLoading(true);
    try {
      const token = TokenStorageService.getAccessToken();
      const response = await fetch('http://localhost:5000/api/v1/users/metrics', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('API call successful!');
        console.log('Users metrics response:', data);
      } else {
        toast.error(`API call failed: ${response.status} ${response.statusText}`);
        console.error('API error:', data);
      }
    } catch (error) {
      toast.error('Network error');
      console.error('Network error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToken = () => {
    const token = TokenStorageService.getAccessToken();
    if (token) {
      navigator.clipboard.writeText(token);
      toast.success('Token copied to clipboard');
    }
  };

  const clearAllAuth = () => {
    TokenStorageService.clearAllAuthCookies();
    CookiesService.clearEagleAuthCookies();
    useAuthStore.getState().clearUser();
    refreshTokenInfo();
    toast.success('All authentication data cleared');
  };

  useEffect(() => {
    refreshTokenInfo();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Authentication Debug
            <Button onClick={refreshTokenInfo} variant="outline" size="sm">
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auth Store Status */}
          <div>
            <h3 className="font-semibold mb-2">Auth Store Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span>User Role: </span>
                <Badge variant={user?.role ? 'default' : 'destructive'}>
                  {user?.role || 'None'}
                </Badge>
              </div>
            </div>
            {user && (
              <div className="mt-2 text-sm text-muted-foreground">
                User: {user.firstName} {user.lastName} ({user.email})
              </div>
            )}
          </div>

          {/* Token Status */}
          <div>
            <h3 className="font-semibold mb-2">Token Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {tokenInfo?.hasToken ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span>Access Token: {tokenInfo?.hasToken ? 'Present' : 'Missing'}</span>
              </div>
              <div className="flex items-center gap-2">
                {tokenInfo?.hasRefreshToken ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span>Refresh Token: {tokenInfo?.hasRefreshToken ? 'Present' : 'Missing'}</span>
              </div>
            </div>
          </div>

          {/* Decoded Token Info */}
          {tokenInfo?.decodedToken && !tokenInfo.decodedToken.error && (
            <div>
              <h3 className="font-semibold mb-2">Token Details</h3>
              <div className="bg-muted p-3 rounded text-sm space-y-1">
                <div>User ID: <code>{tokenInfo.decodedToken.sub}</code></div>
                <div>Email: <code>{tokenInfo.decodedToken.email}</code></div>
                <div>Role: <code>{tokenInfo.decodedToken.role}</code></div>
                <div>Issued: <code>{tokenInfo.decodedToken.iat?.toLocaleString()}</code></div>
                <div>Expires: <code>{tokenInfo.decodedToken.exp?.toLocaleString()}</code></div>
                <div className="flex items-center gap-2">
                  Status: 
                  <Badge variant={tokenInfo.decodedToken.isExpired ? 'destructive' : 'default'}>
                    {tokenInfo.decodedToken.isExpired ? 'Expired' : 'Valid'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Cookies */}
          <div>
            <h3 className="font-semibold mb-2">Eagle Cookies ({Object.keys(tokenInfo?.eagleCookies || {}).length})</h3>
            <div className="bg-muted p-3 rounded text-sm max-h-32 overflow-y-auto">
              {Object.keys(tokenInfo?.eagleCookies || {}).length > 0 ? (
                <pre>{JSON.stringify(tokenInfo.eagleCookies, null, 2)}</pre>
              ) : (
                <div className="text-muted-foreground">No Eagle authentication cookies found</div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={testUsersMetricsEndpoint} 
              disabled={isLoading || !tokenInfo?.hasToken}
              variant="default"
            >
              {isLoading ? 'Testing...' : 'Test Users Metrics API'}
            </Button>
            <Button 
              onClick={copyToken} 
              disabled={!tokenInfo?.hasToken}
              variant="outline"
              size="sm"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Token
            </Button>
            <Button 
              onClick={clearAllAuth} 
              variant="destructive"
              size="sm"
            >
              Clear All Auth
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
