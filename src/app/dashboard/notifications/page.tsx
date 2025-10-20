'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, FileText, BarChart3 } from 'lucide-react';
import { useNotifications, useUnreadCount, useEmailStats } from '@/hooks/useNotifications';
import NotificationsList from '@/components/notifications/NotificationsList';
import EmailLogsTable from '@/components/notifications/EmailLogsTable';
import NotificationStats from '@/components/notifications/NotificationStats';
import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationsDashboard() {
  const [activeTab, setActiveTab] = useState('notifications');
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications();
  const { data: unreadCount, isLoading: unreadCountLoading } = useUnreadCount();
  const { data: emailStats, isLoading: emailStatsLoading } = useEmailStats();

  const stats = [
    {
      title: 'Unread Notifications',
      value: unreadCountLoading ? '...' : unreadCount?.toString() || '0',
      icon: Bell,
      description: 'Requires attention',
      color: 'text-red-500',
    },
    {
      title: 'Total Emails',
      value: emailStatsLoading ? '...' : emailStats?.totalSent.toString() || '0',
      icon: Mail,
      description: 'This month',
      color: 'text-blue-500',
    },
    {
      title: 'Delivery Rate',
      value: emailStatsLoading ? '...' : `${emailStats ? ((emailStats.delivered / emailStats.totalSent) * 100).toFixed(1) : '0'}%`,
      icon: BarChart3,
      description: 'Successful deliveries',
      color: 'text-green-500',
    },
    {
      title: 'Open Rate',
      value: emailStatsLoading ? '...' : `${emailStats?.openRate.toFixed(1) || '0'}%`,
      icon: FileText,
      description: 'Email engagement',
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your notifications, emails, and templates in one place
          </p>
        </div>
        <Button>
          <Bell className="w-4 h-4 mr-2" />
          New Notification
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
            {unreadCount && unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Emails
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {notificationsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <NotificationsList notifications={notificationsData?.notifications || []} />
          )}
        </TabsContent>

        <TabsContent value="emails" className="space-y-4">
          <EmailLogsTable />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Manage your email templates and create new ones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Template Management</h3>
                <p className="text-muted-foreground mt-2">
                  Create and manage email templates for automated communications
                </p>
                <Button className="mt-4">Create Template</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <NotificationStats />
        </TabsContent>
      </Tabs>
    </div>
  );
}