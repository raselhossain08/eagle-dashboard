'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  Download, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Clock, 
  MessageSquare, 
  AlertCircle, 
  RefreshCw,
  Calendar,
  Filter,
  FileBarChart
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { supportService } from '@/lib/api/support';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';
import { 
  SupportAnalytics, 
  ResponseTimeAnalytics, 
  TicketVolumeAnalytics, 
  CategoryAnalytics 
} from '@/types/support';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface AnalyticsState {
  analytics: SupportAnalytics | null;
  responseTimeData: ResponseTimeAnalytics[];
  volumeData: TicketVolumeAnalytics[];
  categoryData: CategoryAnalytics[];
}

export default function AnalyticsPage() {
  const [state, setState] = useState<AnalyticsState>({
    analytics: null,
    responseTimeData: [],
    volumeData: [],
    categoryData: []
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [timeFilter, setTimeFilter] = useState('30d');
  const [error, setError] = useState<string | null>(null);

  const getDateRangeFromFilter = useCallback(() => {
    const endDate = new Date();
    let startDate: Date;

    switch (timeFilter) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        return {
          startDate: dateRange?.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: dateRange?.to || new Date()
        };
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate };
  }, [timeFilter, dateRange]);

  const fetchAnalyticsData = useCallback(async (showRefresh = false) => {
    try {
      setLoading(!showRefresh);
      setRefreshing(showRefresh);
      setError(null);

      const { startDate, endDate } = getDateRangeFromFilter();
      
      const [analyticsRes, responseRes, volumeRes, categoryRes] = await Promise.all([
        supportService.getSupportAnalytics({ 
          startDate: startDate.toISOString(), 
          endDate: endDate.toISOString() 
        }),
        supportService.getResponseTimeAnalytics(
          Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        ),
        supportService.getTicketVolumeAnalytics(6),
        supportService.getCategoryAnalytics({ 
          startDate: startDate.toISOString(), 
          endDate: endDate.toISOString() 
        })
      ]);

      setState({
        analytics: analyticsRes,
        responseTimeData: responseRes,
        volumeData: volumeRes,
        categoryData: categoryRes
      });

    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      setError(error.message || 'Failed to load analytics data');
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getDateRangeFromFilter]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const handleExportReport = async () => {
    try {
      const { startDate, endDate } = getDateRangeFromFilter();
      
      const report = await supportService.generateReport('weekly-summary', { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString() 
      });
      
      // Create and download the report
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `support-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Analytics report exported successfully');
    } catch (error: any) {
      console.error('Failed to export report:', error);
      toast.error('Failed to export report');
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData(true);
  };

  const formatChartData = {
    responseTime: state.responseTimeData.map(item => ({
      name: new Date(item.date).toLocaleDateString('en', { weekday: 'short' }),
      time: item.avgResponseTime,
      count: item.ticketCount
    })),
    volume: state.volumeData.map(item => ({
      name: new Date(item.month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
      tickets: item.tickets,
      month: item.monthNum,
      year: item.year
    })),
    category: state.categoryData.map(item => ({
      name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
      value: item.count,
      percentage: item.percentage,
      resolutionRate: item.resolutionRate
    }))
  };

  if (loading && !refreshing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !state.analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Failed to load analytics</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchAnalyticsData()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Analytics</h1>
          <p className="text-muted-foreground">
            Real-time insights into support performance and metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          
          {timeFilter === 'custom' && (
            <DatePickerWithRange 
              dateRange={dateRange} 
              onDateRangeChange={setDateRange}
              className="w-64"
              placeholder="Select date range"
            />
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {state.analytics?.overview.avgResponseTime || 0}m
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              {(state.analytics?.overview.avgResponseTime || 0) <= 20 ? (
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
              )}
              Target: 20m
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(state.analytics?.overview.resolutionRate || 0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {state.analytics?.overview.resolvedTickets || 0} of {state.analytics?.overview.totalTickets || 0} resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {state.analytics?.overview.customerSatisfaction || 0}/5
            </div>
            <p className="text-xs text-muted-foreground">
              Based on resolved tickets feedback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {state.analytics?.overview.activeTickets || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {state.analytics?.overview.totalTickets || 0} total tickets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="volume">Volume Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Daily Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Analysis</CardTitle>
                <CardDescription>
                  Average response time over the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={formatChartData.responseTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        name === 'time' ? `${value} minutes` : value,
                        name === 'time' ? 'Response Time' : 'Ticket Count'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="time"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Ticket Count</CardTitle>
                <CardDescription>
                  Number of tickets handled per day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={formatChartData.responseTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} tickets`, 'Daily Count']}
                    />
                    <Bar dataKey="count" fill="#00C49F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="volume" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Ticket Volume</CardTitle>
              <CardDescription>
                Support ticket volume trends over the past months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={formatChartData.volume}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} tickets`, 'Monthly Volume']}
                  />
                  <Bar 
                    dataKey="tickets" 
                    fill="#FFBB28" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>
                  Support tickets breakdown by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={formatChartData.category}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }: any) => 
                          `${name} (${percentage}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {formatChartData.category.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} tickets`, 'Count']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resolution Rates by Category</CardTitle>
                <CardDescription>
                  How efficiently each category is being resolved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={formatChartData.category} 
                    layout="horizontal"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Resolution Rate']}
                    />
                    <Bar 
                      dataKey="resolutionRate" 
                      fill="#00C49F" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Activity Trends</CardTitle>
              <CardDescription>
                Ticket creation and resolution trends by day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={state.analytics?.trends.ticketsByDay || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => 
                      new Date(value).toLocaleDateString('en', { 
                        month: 'short', 
                        day: 'numeric' 
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => 
                      new Date(value).toLocaleDateString('en', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    }
                    formatter={(value) => [`${value} tickets`, 'Daily Count']}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    strokeWidth={3}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#8884d8', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}