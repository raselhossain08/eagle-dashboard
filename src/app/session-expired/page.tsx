'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, LogIn } from 'lucide-react';

export default function SessionExpiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
          </div>
          <CardTitle className="text-xl">Session Expired</CardTitle>
          <CardDescription>
            Your session has expired for security reasons. Please log in again to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 text-center">
            For your security, sessions automatically expire after a period of inactivity.
          </div>
          
          <Link href="/login" className="block">
            <Button className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              Login Again
            </Button>
          </Link>
          
          <div className="text-xs text-center text-gray-500">
            If you continue to experience issues, please contact support.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}