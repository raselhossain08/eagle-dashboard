// src/app/dashboard/system/webhooks/page.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWebhookStats } from '@/hooks/useSystem';
import { Plus, Activity, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function WebhooksPage() {
  const { data: stats, isLoading } = useWebhookStats();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Webhook Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure and monitor webhook endpoints and events
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/system/webhooks/endpoints/new">
            <Plus className="h-4 w-4 mr-2" />
            New Endpoint
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total.toLocaleString()}</div>
            <p className="text-sm text-gray-500">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.successful.toLocaleString()}</div>
            <p className="text-sm text-gray-500">{stats?.successRate}% success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.failed}</div>
            <p className="text-sm text-gray-500">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.pending}</div>
            <p className="text-sm text-gray-500">In queue</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Endpoints</CardTitle>
            <CardDescription>Manage webhook endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Endpoints</span>
                <Badge variant="secondary">12</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Inactive Endpoints</span>
                <Badge variant="outline">3</Badge>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/system/webhooks/endpoints">Manage Endpoints</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
            <CardDescription>Monitor webhook events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Recent Events</span>
                <Badge variant="secondary">1,234</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Last 24h</span>
                <Badge variant="outline">256</Badge>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/system/webhooks/events">View Events</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logs & Analytics</CardTitle>
            <CardDescription>Delivery logs and analytics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Delivery Logs</span>
                <Badge variant="secondary">5,678</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Error Rate</span>
                <Badge variant={stats?.successRate > 95 ? 'default' : 'destructive'}>
                  {stats?.successRate}%
                </Badge>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/system/webhooks/logs">View Logs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}