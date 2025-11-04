'use client';

import { Suspense, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  Mail, 
  TrendingUp, 
  TrendingDown,
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  MousePointer,
  AlertTriangle,
  RefreshCw,
  Calendar,
  BarChart3,
  FileText
} from 'lucide-react';
import { useEmailStats, useEmailLogs, useEmailTrends, useTemplateStats } from '@/hooks/useNotifications';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationAnalyticsErrorBoundary } from '@/components/notifications/NotificationAnalyticsErrorBoundary';
import { NotificationAnalyticsSkeleton } from '@/components/notifications/NotificationAnalyticsSkeleton';
import { AnalyticsProcessor } from '@/lib/analytics-processor';
import { toast } from 'sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B', '#4ECDC4', '#45B7D1'];

function NotificationAnalyticsContent() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // API calls with error handling
  const { 
    data: emailStats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useEmailStats();
  
  const { 
    data: recentEmailsData, 
    isLoading: emailsLoading, 
    error: emailsError,
    refetch: refetchEmails 
  } = useEmailLogs({ 
    limit: 100 
  });
  
  const { 
    data: emailTrends, 
    isLoading: trendsLoading, 
    error: trendsError,
    refetch: refetchTrends 
  } = useEmailTrends(selectedPeriod);
  
  const { 
    data: templateStats, 
    isLoading: templateStatsLoading, 
    error: templateStatsError,
    refetch: refetchTemplateStats 
  } = useTemplateStats();

  // Handle refresh all data
  const handleRefreshAll = () => {
    setRefreshKey(prev => prev + 1);
    refetchStats();
    refetchEmails();
    refetchTrends();
    refetchTemplateStats();
    toast.success('Analytics data refreshed');
  };

  // Check for critical errors
  const hasErrors = statsError || emailsError || trendsError || templateStatsError;
  
  if (hasErrors) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Email Analytics</h1>
            <p className="text-muted-foreground">
              Monitor email performance and engagement metrics
            </p>
          </div>
          <Button onClick={handleRefreshAll} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Analytics Error:</strong> {
              statsError?.message || 
              emailsError?.message || 
              trendsError?.message || 
              templateStatsError?.message || 
              'Failed to load analytics data'
            }
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div>
              <p className="text-lg font-medium text-muted-foreground mb-2">Analytics Unavailable</p>
              <p className="text-sm text-muted-foreground">
                Unable to load analytics data. Please check your connection and try again.
              </p>
            </div>
            <Button onClick={handleRefreshAll}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Process data for display
  const recentEmails = recentEmailsData?.logs ? AnalyticsProcessor.processRecentActivity(recentEmailsData.logs) : [];
  const statusData = emailStats ? AnalyticsProcessor.processStatusDistribution([
    ...Array(emailStats.delivered).fill({ status: 'delivered' }),
    ...Array(emailStats.failed).fill({ status: 'failed' }),
  ]) : [];
  
  const templatePerformanceData = templateStats ? AnalyticsProcessor.processTemplatePerformance(templateStats) : [];
  const trendData = emailTrends ? AnalyticsProcessor.formatTrendData(emailTrends) : [];
  const recommendations = emailStats ? AnalyticsProcessor.generateRecommendations(emailStats) : [];

  const stats = [
    {
      title: 'Total Emails Sent',
      value: emailStats?.totalSent.toLocaleString() || '0',
      icon: Mail,
      description: 'All time',
      color: 'text-blue-500',
      change: '+12.5%',
      trend: 'up' as const,
    },
    {
      title: 'Delivery Rate',
      value: emailStats ? `${emailStats.deliveryRate.toFixed(1)}%` : '0%',
      icon: CheckCircle,
      description: 'Successfully delivered',
      color: 'text-green-500',
      change: '+2.1%',
      trend: 'up' as const,
    },
    {
      title: 'Open Rate',
      value: emailStats ? `${emailStats.openRate.toFixed(1)}%` : '0%',
      icon: Eye,
      description: 'Emails opened',
      color: 'text-purple-500',
      change: '-0.8%',
      trend: 'down' as const,
    },
    {
      title: 'Click Rate',
      value: emailStats ? `${emailStats.clickRate.toFixed(1)}%` : '0%',
      icon: MousePointer,
      description: 'Links clicked',
      color: 'text-orange-500',
      change: '+1.3%',
      trend: 'up' as const,
    },
  ];

  return (
    <div className="space-y-6" key={refreshKey}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Analytics</h1>
          <p className="text-muted-foreground">
            Monitor email performance and engagement metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefreshAll} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod as (value: string) => void}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                    <Badge 
                      variant={stat.trend === 'up' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {stat.change}
                    </Badge>
                  </div>
                </>
              )}
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
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Delivery Status
                </CardTitle>
                <CardDescription>
                  Email delivery success rate breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Emails']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No delivery data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest email sending activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {emailsLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                        <Skeleton className="h-5 w-16" />
                      </div>
                    ))}
                  </div>
                ) : recentEmails.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {recentEmails.slice(0, 8).map((email: any) => (
                      <div key={email.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          email.status === 'delivered' ? 'bg-green-500' :
                          email.status === 'failed' ? 'bg-red-500' :
                          email.status === 'sent' ? 'bg-blue-500' :
                          email.status === 'opened' ? 'bg-purple-500' :
                          email.status === 'clicked' ? 'bg-orange-500' :
                          'bg-yellow-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{email.to}</p>
                          <p className="text-xs text-muted-foreground truncate">{email.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(email.sentAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            email.status === 'delivered' ? 'default' :
                            email.status === 'failed' ? 'destructive' :
                            email.status === 'opened' ? 'secondary' :
                            'outline'
                          }
                          className="text-xs"
                        >
                          {email.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                    <p className="text-xs mt-1">Email activity will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Template Performance
              </CardTitle>
              <CardDescription>
                Most used email templates and their performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templateStatsLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : templatePerformanceData.length > 0 ? (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={templatePerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          value.toLocaleString(), 
                          name === 'sent' ? 'Emails Sent' : name
                        ]}
                      />
                      <Bar dataKey="sent" fill="#3B82F6" name="sent" />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  {/* Template Stats Table */}
                  <div className="border rounded-lg">
                    <div className="grid grid-cols-5 gap-4 p-3 border-b bg-muted/50 text-sm font-medium">
                      <div>Template Name</div>
                      <div className="text-center">Sent</div>
                      <div className="text-center">Delivery Rate</div>
                      <div className="text-center">Open Rate</div>
                      <div className="text-center">Click Rate</div>
                    </div>
                    {templatePerformanceData.slice(0, 5).map((template, index) => (
                      <div key={index} className="grid grid-cols-5 gap-4 p-3 border-b last:border-0 text-sm">
                        <div className="font-medium truncate">{template.name}</div>
                        <div className="text-center">{template.sent.toLocaleString()}</div>
                        <div className="text-center">{template.deliveryRate.toFixed(1)}%</div>
                        <div className="text-center">{template.openRate.toFixed(1)}%</div>
                        <div className="text-center">{template.clickRate.toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No template data available</p>
                    <p className="text-xs mt-1">Template performance will appear here</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Email Trends ({selectedPeriod})
              </CardTitle>
              <CardDescription>
                Email sending and engagement trends over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trendsLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : trendData.length > 0 ? (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          value.toLocaleString(), 
                          name.charAt(0).toUpperCase() + name.slice(1)
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sent" 
                        stroke="#3B82F6" 
                        fillOpacity={1} 
                        fill="url(#colorSent)" 
                        name="sent"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="delivered" 
                        stroke="#10B981" 
                        fillOpacity={1} 
                        fill="url(#colorDelivered)" 
                        name="delivered"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="opened" 
                        stroke="#8B5CF6" 
                        fillOpacity={1} 
                        fill="url(#colorOpened)" 
                        name="opened"
                      />
                    </AreaChart>
                  </ResponsiveContainer>

                  {/* Trend Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    {[
                      { label: 'Avg. Sent', value: trendData.reduce((sum, d) => sum + d.sent, 0) / trendData.length, color: 'text-blue-600' },
                      { label: 'Avg. Delivered', value: trendData.reduce((sum, d) => sum + d.delivered, 0) / trendData.length, color: 'text-green-600' },
                      { label: 'Avg. Opened', value: trendData.reduce((sum, d) => sum + d.opened, 0) / trendData.length, color: 'text-purple-600' },
                      { label: 'Peak Day', value: Math.max(...trendData.map(d => d.sent)), color: 'text-orange-600' },
                    ].map((metric, index) => (
                      <div key={index} className="text-center p-3 border rounded-lg">
                        <div className={`text-lg font-bold ${metric.color}`}>
                          {metric.value.toFixed(0)}
                        </div>
                        <div className="text-xs text-muted-foreground">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No trend data available</p>
                    <p className="text-xs mt-1">Trends will appear as you send more emails</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  Key performance indicators and benchmarks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {statsLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Deliverability</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-green-600">
                          {emailStats ? `${emailStats.deliveryRate.toFixed(1)}%` : '0%'}
                        </span>
                        <div className={`text-xs px-2 py-1 rounded ${
                          (emailStats?.deliveryRate || 0) >= 95 ? 'bg-green-100 text-green-700' :
                          (emailStats?.deliveryRate || 0) >= 85 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {(emailStats?.deliveryRate || 0) >= 95 ? 'Excellent' :
                           (emailStats?.deliveryRate || 0) >= 85 ? 'Good' : 'Needs Work'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium">Open Rate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-purple-600">
                          {emailStats ? `${emailStats.openRate.toFixed(1)}%` : '0%'}
                        </span>
                        <div className={`text-xs px-2 py-1 rounded ${
                          (emailStats?.openRate || 0) >= 25 ? 'bg-green-100 text-green-700' :
                          (emailStats?.openRate || 0) >= 15 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {(emailStats?.openRate || 0) >= 25 ? 'Great' :
                           (emailStats?.openRate || 0) >= 15 ? 'Average' : 'Low'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Click Rate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-blue-600">
                          {emailStats ? `${emailStats.clickRate.toFixed(1)}%` : '0%'}
                        </span>
                        <div className={`text-xs px-2 py-1 rounded ${
                          (emailStats?.clickRate || 0) >= 5 ? 'bg-green-100 text-green-700' :
                          (emailStats?.clickRate || 0) >= 2 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {(emailStats?.clickRate || 0) >= 5 ? 'High' :
                           (emailStats?.clickRate || 0) >= 2 ? 'Normal' : 'Low'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium">Bounce Rate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-red-600">
                          {emailStats ? `${emailStats.bounceRate.toFixed(1)}%` : '0%'}
                        </span>
                        <div className={`text-xs px-2 py-1 rounded ${
                          (emailStats?.bounceRate || 0) <= 2 ? 'bg-green-100 text-green-700' :
                          (emailStats?.bounceRate || 0) <= 5 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {(emailStats?.bounceRate || 0) <= 2 ? 'Excellent' :
                           (emailStats?.bounceRate || 0) <= 5 ? 'Acceptable' : 'High'}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* AI-Generated Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Smart Recommendations
                </CardTitle>
                <CardDescription>
                  AI-powered suggestions to improve performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {statsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recommendations.length > 0 ? (
                  recommendations.map((rec, index) => {
                    const IconComponent = 
                      rec.icon === 'TrendingUp' ? TrendingUp :
                      rec.icon === 'Eye' ? Eye :
                      rec.icon === 'MousePointer' ? MousePointer :
                      rec.icon === 'CheckCircle' ? CheckCircle :
                      AlertTriangle;
                    
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <IconComponent className={`h-4 w-4 mt-0.5 ${
                          rec.type === 'success' ? 'text-green-500' :
                          rec.type === 'warning' ? 'text-orange-500' :
                          'text-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{rec.title}</p>
                          <p className="text-xs text-muted-foreground">{rec.message}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No specific recommendations</p>
                    <p className="text-xs">Your email performance looks good!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function NotificationAnalyticsPage() {
  return (
    <NotificationAnalyticsErrorBoundary>
      <Suspense fallback={<NotificationAnalyticsSkeleton />}>
        <NotificationAnalyticsContent />
      </Suspense>
    </NotificationAnalyticsErrorBoundary>
  );
}