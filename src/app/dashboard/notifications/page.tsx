'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Mail, 
  FileText, 
  BarChart3, 
  Plus, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Send,
  Eye,
  MousePointer
} from 'lucide-react';
import Link from 'next/link';
import { useNotifications, useUnreadCount, useEmailStats, useTemplates } from '@/hooks/useNotifications';
import { NotificationsDashboardSkeleton } from '@/components/notifications/NotificationsDashboardSkeleton';
import NotificationsDashboardErrorBoundary from '@/components/errors/NotificationsDashboardErrorBoundary';
import { toast } from 'sonner';

const NotificationsDashboardContent = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  
  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    error: notificationsError,
    refetch: refetchNotifications,
    isRefetching: isRefetchingNotifications
  } = useNotifications({ page: 1, limit: 10 });

  const {
    data: unreadCount,
    isLoading: unreadCountLoading,
    error: unreadCountError,
    refetch: refetchUnreadCount
  } = useUnreadCount();

  const {
    data: emailStats,
    isLoading: emailStatsLoading,
    error: emailStatsError,
    refetch: refetchEmailStats,
    isRefetching: isRefetchingEmailStats
  } = useEmailStats();

  const {
    data: templates,
    isLoading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates
  } = useTemplates();

  // Handle refresh for all data
  const handleRefreshAll = () => {
    refetchNotifications();
    refetchUnreadCount();
    refetchEmailStats();
    refetchTemplates();
    toast.success('Dashboard data refreshed');
  };

  // Stats configuration with real data
  const stats = [
    {
      title: 'Unread Notifications',
      value: unreadCountLoading ? '...' : unreadCount?.toString() || '0',
      icon: Bell,
      description: 'Requires attention',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      trend: unreadCount && unreadCount > 0 ? 'up' : 'neutral',
      isLoading: unreadCountLoading,
      error: unreadCountError
    },
    {
      title: 'Total Emails',
      value: emailStatsLoading ? '...' : emailStats?.totalSent.toLocaleString() || '0',
      icon: Mail,
      description: 'This month',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      trend: 'up',
      isLoading: emailStatsLoading,
      error: emailStatsError
    },
    {
      title: 'Delivery Rate',
      value: emailStatsLoading ? '...' : `${emailStats && emailStats.totalSent > 0 ? ((emailStats.delivered / emailStats.totalSent) * 100).toFixed(1) : '0'}%`,
      icon: CheckCircle,
      description: 'Successful deliveries',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      trend: emailStats && emailStats.deliveryRate > 95 ? 'up' : 'neutral',
      isLoading: emailStatsLoading,
      error: emailStatsError
    },
    {
      title: 'Open Rate',
      value: emailStatsLoading ? '...' : `${emailStats?.openRate.toFixed(1) || '0'}%`,
      icon: Eye,
      description: 'Email engagement',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      trend: emailStats && emailStats.openRate > 20 ? 'up' : 'down',
      isLoading: emailStatsLoading,
      error: emailStatsError
    },
  ];

  // Handle loading state
  if (notificationsLoading && unreadCountLoading && emailStatsLoading) {
    return <NotificationsDashboardSkeleton />;
  }

  // Handle critical errors
  if (notificationsError && unreadCountError && emailStatsError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-600">Failed to Load Dashboard</h3>
          <p className="text-muted-foreground mt-2">
            Unable to load notifications data. Please try refreshing.
          </p>
          <Button onClick={handleRefreshAll} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Notifications Dashboard</h1>
            {(isRefetchingNotifications || isRefetchingEmailStats) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Activity className="w-3 h-3 animate-pulse" />
                Updating...
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Manage your notifications, emails, and templates in one place
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleRefreshAll}>
            <RefreshCw className={`w-4 h-4 mr-2 ${(isRefetchingNotifications || isRefetchingEmailStats) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Bell className="w-4 h-4 mr-2" />
            New Notification
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-1 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.trend !== 'neutral' && (
                  <div className={`flex items-center gap-1 text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              {stat.error && (
                <p className="text-xs text-red-500 mt-1">Failed to load</p>
              )}
            </CardContent>
            <div className={`absolute bottom-0 left-0 right-0 h-1 ${
              stat.error ? 'bg-red-200' : 
              stat.isLoading ? 'bg-gray-200' : 
              stat.trend === 'up' ? 'bg-green-200' : 
              stat.trend === 'down' ? 'bg-red-200' : 'bg-blue-200'
            }`} />
          </Card>
        ))}
      </div>

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
            {unreadCount && unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Emails
            {emailStats && emailStats.totalSent > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {emailStats.totalSent}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
            {templates && templates.length > 0 && (
              <Badge variant="outline" className="ml-1 text-xs">
                {templates.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          {notificationsError ? (
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-red-600">Failed to Load Notifications</h3>
                <p className="text-muted-foreground mt-2">
                  {notificationsError.message}
                </p>
                <Button onClick={() => refetchNotifications()} className="mt-4" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : notificationsData && notificationsData.notifications.length > 0 ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Recent Notifications
                    </CardTitle>
                    <CardDescription>
                      Your latest notifications and alerts
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {notificationsData.total} total
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notificationsData.notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                        !notification.isRead ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        notification.isRead ? 'bg-gray-300' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-medium ${!notification.isRead ? 'text-blue-900' : ''}`}>
                            {notification.title}
                          </p>
                          <Badge 
                            variant={
                              notification.type === 'error' ? 'destructive' :
                              notification.type === 'warning' ? 'outline' :
                              notification.type === 'success' ? 'secondary' : 'default'
                            }
                            className="text-xs"
                          >
                            {notification.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                          <Badge variant={
                            notification.priority === 'critical' ? 'destructive' :
                            notification.priority === 'high' ? 'destructive' :
                            notification.priority === 'medium' ? 'secondary' : 'outline'
                          } className="text-xs">
                            {notification.priority}
                          </Badge>
                        </div>
                      </div>
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

        {/* Enhanced Email Management */}
        <TabsContent value="emails" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Email Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Email Performance
                </CardTitle>
                <CardDescription>Current month statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {emailStats ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Send className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                        <div className="text-lg font-bold text-blue-900">{emailStats.totalSent}</div>
                        <div className="text-xs text-blue-600">Sent</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 mx-auto text-green-600 mb-1" />
                        <div className="text-lg font-bold text-green-900">{emailStats.delivered}</div>
                        <div className="text-xs text-green-600">Delivered</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <Eye className="w-4 h-4 mx-auto text-purple-600 mb-1" />
                        <div className="text-lg font-bold text-purple-900">{emailStats.openRate.toFixed(1)}%</div>
                        <div className="text-xs text-purple-600">Open Rate</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <MousePointer className="w-4 h-4 mx-auto text-orange-600 mb-1" />
                        <div className="text-lg font-bold text-orange-900">{emailStats.clickRate.toFixed(1)}%</div>
                        <div className="text-xs text-orange-600">Click Rate</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No email data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Email Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Email Management</CardTitle>
                <CardDescription>Send emails and view history</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Send className="h-5 w-5 text-blue-600" />
                    </div>
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
                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Email Logs</h3>
                      <p className="text-sm text-muted-foreground">
                        View history and delivery status
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/notifications/email">
                      View Logs
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enhanced Templates */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Email Templates
                {templates && (
                  <Badge variant="secondary">{templates.length} templates</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Manage your email templates and create new ones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Plus className="h-6 w-6 text-blue-600" />
                    </div>
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
                <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Manage Templates</h3>
                      <p className="text-sm text-muted-foreground">
                        Edit and organize templates
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

        {/* Enhanced Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Email Analytics
              </CardTitle>
              <CardDescription>
                Monitor email performance and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full mb-4">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Detailed Analytics</h3>
                <p className="text-muted-foreground mb-6">
                  View comprehensive analytics and performance metrics for your email campaigns
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
};

export default function NotificationsDashboard() {
  return (
    <NotificationsDashboardErrorBoundary>
      <NotificationsDashboardContent />
    </NotificationsDashboardErrorBoundary>
  );
}