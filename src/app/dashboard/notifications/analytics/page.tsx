'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Mail, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  MousePointer,
  AlertTriangle
} from 'lucide-react';
import { useEmailStats, useEmailLogs } from '@/hooks/useNotifications';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function NotificationAnalyticsPage() {
  const { data: emailStats, isLoading: statsLoading } = useEmailStats();
  const { data: recentEmails, isLoading: emailsLoading } = useEmailLogs({ 
    limit: 100 
  });

  const stats = [
    {
      title: 'Total Emails Sent',
      value: emailStats?.totalSent || 0,
      icon: Mail,
      description: 'All time',
      color: 'text-blue-500',
    },
    {
      title: 'Delivery Rate',
      value: emailStats ? `${emailStats.deliveryRate.toFixed(1)}%` : '0%',
      icon: CheckCircle,
      description: 'Successfully delivered',
      color: 'text-green-500',
    },
    {
      title: 'Open Rate',
      value: emailStats ? `${emailStats.openRate.toFixed(1)}%` : '0%',
      icon: Eye,
      description: 'Emails opened',
      color: 'text-purple-500',
    },
    {
      title: 'Click Rate',
      value: emailStats ? `${emailStats.clickRate.toFixed(1)}%` : '0%',
      icon: MousePointer,
      description: 'Links clicked',
      color: 'text-orange-500',
    },
  ];

  // Prepare data for charts
  const statusData = emailStats ? [
    { name: 'Delivered', value: emailStats.delivered, color: '#10B981' },
    { name: 'Failed', value: emailStats.totalSent - emailStats.delivered, color: '#EF4444' },
  ] : [];

  const templateData = emailStats?.topTemplates?.map((template, index) => ({
    name: template.template,
    sent: template.sentCount,
    color: COLORS[index % COLORS.length],
  })) || [];

  // Mock trend data (in real app, this would come from backend)
  const trendData = [
    { date: '2024-01', sent: 120, delivered: 115, opened: 89 },
    { date: '2024-02', sent: 150, delivered: 143, opened: 110 },
    { date: '2024-03', sent: 180, delivered: 172, opened: 135 },
    { date: '2024-04', sent: 200, delivered: 195, opened: 156 },
    { date: '2024-05', sent: 225, delivered: 218, opened: 175 },
    { date: '2024-06', sent: 190, delivered: 185, opened: 148 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Analytics</h1>
          <p className="text-muted-foreground">
            Monitor email performance and engagement metrics
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Delivery Status */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Status</CardTitle>
                <CardDescription>
                  Email delivery success rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest email sending activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {emailsLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentEmails?.logs.slice(0, 5).map((email) => (
                  <div key={email.id} className="flex items-center gap-3 py-2">
                    <div className={`w-2 h-2 rounded-full ${
                      email.status === 'delivered' ? 'bg-green-500' :
                      email.status === 'failed' ? 'bg-red-500' :
                      email.status === 'sent' ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{email.to}</p>
                      <p className="text-xs text-muted-foreground">{email.subject}</p>
                    </div>
                    <Badge variant={
                      email.status === 'delivered' ? 'default' :
                      email.status === 'failed' ? 'destructive' :
                      'secondary'
                    }>
                      {email.status}
                    </Badge>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Performance</CardTitle>
              <CardDescription>
                Most used email templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : templateData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={templateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sent" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No template data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Trends</CardTitle>
              <CardDescription>
                Email sending and engagement trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sent" stroke="#8884d8" name="Sent" />
                  <Line type="monotone" dataKey="delivered" stroke="#82ca9d" name="Delivered" />
                  <Line type="monotone" dataKey="opened" stroke="#ffc658" name="Opened" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Deliverability</span>
                  <span className="text-sm text-green-600">
                    {emailStats ? `${emailStats.deliveryRate.toFixed(1)}%` : '0%'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Open Rate</span>
                  <span className="text-sm text-purple-600">
                    {emailStats ? `${emailStats.openRate.toFixed(1)}%` : '0%'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Click Rate</span>
                  <span className="text-sm text-blue-600">
                    {emailStats ? `${emailStats.clickRate.toFixed(1)}%` : '0%'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Bounce Rate</span>
                  <span className="text-sm text-red-600">
                    {emailStats ? `${emailStats.bounceRate.toFixed(1)}%` : '0%'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  Suggestions to improve performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Good delivery rate</p>
                    <p className="text-xs text-muted-foreground">
                      Your emails are reaching recipients successfully
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Eye className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Optimize subject lines</p>
                    <p className="text-xs text-muted-foreground">
                      Try A/B testing subject lines to improve open rates
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Send time optimization</p>
                    <p className="text-xs text-muted-foreground">
                      Consider sending emails at peak engagement times
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}