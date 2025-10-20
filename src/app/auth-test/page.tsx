'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/lib/api/auth.service';
import { AuthService } from '@/lib/services/auth.service';
import { TokenStorageService } from '@/lib/auth/token-storage.service';
import { SessionStorageService } from '@/lib/auth/session-storage.service';

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

interface AuthStatus {
  token: string;
  user: any;
  isAuthenticated: boolean;
}

interface TestResults {
  currentAuth?: AuthStatus;
  [key: string]: TestResult | AuthStatus | null | undefined;
}

export default function AuthTestPage() {
  const [results, setResults] = useState<TestResults>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [loginData, setLoginData] = useState({
    email: 'admin@eagle.com',
    password: 'password123'
  });

  useEffect(() => {
    // Check current auth status
    const token = TokenStorageService.getAccessToken();
    const user = SessionStorageService.getUserSession();
    setResults(prev => ({
      ...prev,
      currentAuth: {
        token: token ? 'Present' : 'None',
        user: user || 'None',
        isAuthenticated: !!token
      }
    }));
  }, []);

  const handleTest = async (testType: string) => {
    setLoading(testType);
    setResults(prev => ({ ...prev, [testType]: null }));

    try {
      let result: any;
      const authSvc = new AuthService();
      
      switch (testType) {
        case 'login':
          result = await authSvc.login({
            email: loginData.email,
            password: loginData.password,
            rememberMe: false
          });
          
          // Store tokens and user info
          if (result.accessToken) {
            TokenStorageService.setTokens(result.accessToken, result.refreshToken);
            SessionStorageService.setUserSession(result.user);
          }
          
          setResults(prev => ({ 
            ...prev, 
            [testType]: { 
              success: true, 
              data: result,
              message: 'Login successful'
            } 
          }));
          break;
          
        case 'logout':
          await authSvc.logout();
          setResults(prev => ({ 
            ...prev, 
            [testType]: { 
              success: true, 
              message: 'Logout successful' 
            } 
          }));
          break;
          
        case 'validateSession':
          result = await authSvc.validateSession();
          setResults(prev => ({ 
            ...prev, 
            [testType]: { 
              success: true, 
              data: result,
              message: 'Session is valid'
            } 
          }));
          break;
          
        default:
          result = { success: false, error: 'Unknown test type' };
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResults(prev => ({ 
        ...prev, 
        [testType]: { 
          success: false, 
          error: errorMessage 
        } 
      }));
    } finally {
      setLoading(null);
      
      // Update current auth status
      const token = TokenStorageService.getAccessToken();
      const user = SessionStorageService.getUserSession();
      setResults(prev => ({
        ...prev,
        currentAuth: {
          token: token ? 'Present' : 'None',
          user: user || 'None',
          isAuthenticated: !!token
        }
      }));
    }
  };

  const ResultBox = ({ title, result, loading }: { title: string; result: any; loading: boolean }) => (
    <div className="border rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {loading && <p className="text-blue-500">Loading...</p>}
      {result && (
        <div className={`p-3 rounded ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            Status: {result.success ? 'Success' : 'Failed'}
          </p>
          {result.message && <p className="text-sm mt-1">{result.message}</p>}
          {result.error && <p className="text-red-600 mt-1">Error: {result.error}</p>}
          {result.data && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm">Response Data</summary>
              <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Authentication Test</h1>
      
      {/* Current Auth Status */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Current Authentication Status</h2>
        {results.currentAuth && (
          <div className="space-y-2 text-sm">
            <p><strong>Token:</strong> {results.currentAuth.token}</p>
            <p><strong>Authenticated:</strong> {results.currentAuth.isAuthenticated ? 'Yes' : 'No'}</p>
            {results.currentAuth.user !== 'None' && (
              <details>
                <summary className="cursor-pointer">User Details</summary>
                <pre className="text-xs mt-1 p-2 bg-white rounded overflow-auto">
                  {JSON.stringify(results.currentAuth.user, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
      
      {/* Login Form */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Login Credentials</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </div>
      
      {/* Test Buttons */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <button
          onClick={() => handleTest('login')}
          disabled={loading === 'login'}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Login
        </button>
        
        <button
          onClick={() => handleTest('validateSession')}
          disabled={loading === 'validateSession'}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Validate Session
        </button>
        
        <button
          onClick={() => handleTest('logout')}
          disabled={loading === 'logout'}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Test Logout
        </button>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <ResultBox 
          title="Login Test" 
          result={results.login} 
          loading={loading === 'login'} 
        />
        
        <ResultBox 
          title="Session Validation" 
          result={results.validateSession} 
          loading={loading === 'validateSession'} 
        />
        
        <ResultBox 
          title="Logout Test" 
          result={results.logout} 
          loading={loading === 'logout'} 
        />
      </div>
      
      {/* API Endpoints Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">API Endpoints:</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• Backend Server: http://localhost:5000</li>
          <li>• Login: POST /api/v1/auth/login</li>
          <li>• Logout: POST /api/v1/auth/logout</li>
          <li>• Validate: GET /api/v1/auth/validate</li>
          <li>• Refresh: POST /api/v1/auth/refresh</li>
        </ul>
      </div>
      
      {/* Navigation */}
      <div className="mt-6 flex gap-4">
        <a href="/login" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Go to Login Page
        </a>
        <a href="/dashboard" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}