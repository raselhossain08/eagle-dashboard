'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, AlertTriangle } from 'lucide-react';
import { AuthService } from '@/lib/services/auth.service';

interface LogoutButtonProps {
  className?: string;
  showConfirm?: boolean;
}

export function LogoutButton({ className = '', showConfirm = true }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleLogout = async () => {
    if (showConfirm && !showConfirmDialog) {
      setShowConfirmDialog(true);
      return;
    }

    setIsLoading(true);
    try {
      const authService = new AuthService();
      await authService.logout();
      
      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, clear local storage and redirect
      localStorage.clear();
      router.push('/login');
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  if (showConfirmDialog) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-500 mr-2" />
            <h3 className="text-lg font-semibold">Confirm Logout</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Are you sure you want to sign out? You'll need to log in again to access your dashboard.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowConfirmDialog(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign Out'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 ${className}`}
    >
      <LogOut className="w-4 h-4" />
      <span>{isLoading ? 'Signing out...' : 'Sign Out'}</span>
    </button>
  );
}

// Quick logout without confirmation
export function QuickLogoutButton({ className = '' }: { className?: string }) {
  return <LogoutButton className={className} showConfirm={false} />;
}