'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, FileText, BarChart3, Plus } from 'lucide-react';
import Link from 'next/link';
import { useNotifications, useUnreadCount, useEmailStats } from '@/hooks/useNotifications';
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
          ) : notificationsData && notificationsData.notifications.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>
                  Your latest notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notificationsData.notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.isRead ? 'bg-gray-300' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={notification.priority === 'high' ? 'destructive' : 'secondary'}>
                        {notification.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No notifications</h3>
                <p className="text-muted-foreground mt-2">
                  You're all caught up! No new notifications to show.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="emails" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Management</CardTitle>
              <CardDescription>
                Send emails and view email history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-6 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="h-8 w-8 text-blue-500" />
                    <div>
                      <h3 className="font-semibold">Send Email</h3>
                      <p className="text-sm text-muted-foreground">
                        Send emails to individuals or groups
                      </p>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link href="/dashboard/notifications/email/send">
                      Send Email
                    </Link>
                  </Button>
                </div>
                <div className="p-6 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="h-8 w-8 text-green-500" />
                    <div>
                      <h3 className="font-semibold">Email Logs</h3>
                      <p className="text-sm text-muted-foreground">
                        View email history and delivery status
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/notifications/email">
                      View Logs
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-6 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Plus className="h-8 w-8 text-blue-500" />
                    <div>
                      <h3 className="font-semibold">Create Template</h3>
                      <p className="text-sm text-muted-foreground">
                        Design new email templates
                      </p>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link href="/dashboard/notifications/templates/create">
                      Create Template
                    </Link>
                  </Button>
                </div>
                <div className="p-6 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="h-8 w-8 text-green-500" />
                    <div>
                      <h3 className="font-semibold">Manage Templates</h3>
                      <p className="text-sm text-muted-foreground">
                        Edit and organize your templates
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/notifications/templates">
                      Manage Templates
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Analytics</CardTitle>
              <CardDescription>
                Monitor email performance and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Email Analytics</h3>
                <p className="text-muted-foreground mt-2 mb-6">
                  View detailed analytics and performance metrics for your email campaigns
                </p>
                <Button asChild>
                  <Link href="/dashboard/notifications/analytics">
                    View Analytics
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}