'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useEmailStats, useNotifications } from '@/hooks/useNotifications';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function NotificationStats() {
  const { data: emailStats, isLoading: statsLoading } = useEmailStats();
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications();

  // Process notification data for charts
  const categoryData = notificationsData?.notifications.reduce((acc: any[], notification) => {
    const existing = acc.find(item => item.name === notification.category);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ name: notification.category, count: 1 });
    }
    return acc;
  }, []) || [];

  const priorityData = notificationsData?.notifications.reduce((acc: any[], notification) => {
    const existing = acc.find(item => item.name === notification.priority);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ name: notification.priority, count: 1 });
    }
    return acc;
  }, []) || [];

  const typeData = notificationsData?.notifications.reduce((acc: any[], notification) => {
    const existing = acc.find(item => item.name === notification.type);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ name: notification.type, count: 1 });
    }
    return acc;
  }, []) || [];

  if (statsLoading || notificationsLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Notifications by Category</CardTitle>
          <CardDescription>
            Distribution of notifications across different categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications by Priority</CardTitle>
          <CardDescription>
            Breakdown of notification priority levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name || ''} (${((entry.percent || 0) * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Performance</CardTitle>
          <CardDescription>
            Key metrics for email delivery and engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-2xl font-bold">{emailStats?.totalSent || 0}</div>
              <div className="text-sm text-muted-foreground">Total Sent</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{emailStats?.delivered || 0}</div>
              <div className="text-sm text-muted-foreground">Delivered</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{emailStats?.failed || 0}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{emailStats?.openRate?.toFixed(1) || 0}%</div>
              <div className="text-sm text-muted-foreground">Open Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Distribution of different notification types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}