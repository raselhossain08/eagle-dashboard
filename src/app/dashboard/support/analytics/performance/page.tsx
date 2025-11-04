'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  TrendingUp, 
  Users, 
  Clock, 
  Star, 
  Target, 
  Award, 
  AlertCircle, 
  RefreshCw, 
  Filter,
  Search,
  Calendar,
  Activity,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, startOfDay, endOfDay } from 'date-fns';
import { 
  useSupportDashboard, 
  useGenerateReport,
  useTeamPerformance,
  useSupportStats
} from '@/hooks/use-support-analytics';
import { TeamAgent, TeamPerformanceSummary } from '@/types/support';
import { toast } from 'sonner';

export default function TeamPerformancePage() {
  // State for filters and controls
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState<'all' | 'excellent' | 'good' | 'needs-review'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'productivity' | 'satisfaction' | 'totalTickets' | 'avgResponseTime'>('productivity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Convert date range to API format
  const startDate = dateRange?.from ? startOfDay(dateRange.from).toISOString() : undefined;
  const endDate = dateRange?.to ? endOfDay(dateRange.to).toISOString() : undefined;

  // Fetch data using comprehensive hooks
  const {
    teamPerformance,
    supportStats,
    isLoading,
    isError,
    error,
    refetchAll
  } = useSupportDashboard(startDate, endDate, {
    enabled: true,
    autoRefresh,
    refetchInterval: autoRefresh ? 5 * 60 * 1000 : undefined, // 5 minutes
  });

  // Generate report mutation
  const generateReport = useGenerateReport();

  const handleExportReport = async () => {
    try {
      const report = await generateReport.mutateAsync({
        type: 'team-performance',
        startDate,
        endDate,
      });
      
      // Create and download the report
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `team-performance-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Team performance report exported successfully');
    } catch (error) {
      console.error('Failed to export report:', error);
      toast.error('Failed to export report');
    }
  };

  const handleRefresh = async () => {
    try {
      await refetchAll();
      toast.success('Team performance data refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    }
  };

  // Filter and sort team data
  const teamData = teamPerformance.data?.teamPerformance || [];
  const summaryData = teamPerformance.data?.summary;
  
  const filteredAndSortedTeam = teamData.filter((agent: TeamAgent) => {
    // Search filter
    if (searchQuery && !agent.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !agent.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Performance filter
    switch (performanceFilter) {
      case 'excellent':
        return agent.productivity >= 90;
      case 'good':
        return agent.productivity >= 80 && agent.productivity < 90;
      case 'needs-review':
        return agent.productivity < 80;
      default:
        return true;
    }
  }).sort((a: TeamAgent, b: TeamAgent) => {
    const aValue = a[sortBy as keyof TeamAgent];
    const bValue = b[sortBy as keyof TeamAgent];
    
    if (sortOrder === 'desc') {
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return bValue - aValue;
      }
    } else {
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return aValue - bValue;
      }
    }
    return 0;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (isError || !teamPerformance.data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Failed to load team performance data</p>
          </div>
        </div>
      </div>
    );
  }

  // Data is already extracted above as teamData and summaryData

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Performance</h1>
          <p className="text-muted-foreground">
            Detailed analytics and metrics for support team members
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportReport} disabled={generateReport.isPending}>
            <Download className="w-4 h-4 mr-2" />
            {generateReport.isPending ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>
      </div>

      {/* Advanced Filters and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>Filters & Controls</CardTitle>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="auto-refresh" 
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
                <Label htmlFor="auto-refresh">Auto Refresh</Label>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </CardHeader>
        
        {showFilters && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Date Range Filter */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <DatePickerWithRange
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  placeholder="Select date range"
                />
              </div>

              {/* Search Filter */}
              <div className="space-y-2">
                <Label>Search Agents</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Performance Filter */}
              <div className="space-y-2">
                <Label>Performance Level</Label>
                <Select value={performanceFilter} onValueChange={(value: any) => setPerformanceFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All performance levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="excellent">Excellent (90%+)</SelectItem>
                    <SelectItem value="good">Good (80-89%)</SelectItem>
                    <SelectItem value="needs-review">Needs Review (&lt;80%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Options */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="productivity">Productivity</SelectItem>
                      <SelectItem value="satisfaction">Satisfaction</SelectItem>
                      <SelectItem value="totalTickets">Total Tickets</SelectItem>
                      <SelectItem value="avgResponseTime">Response Time</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Filter Results Summary */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {filteredAndSortedTeam.length} of {teamData.length} agents
                {searchQuery && ` matching "${searchQuery}"`}
              </span>
              {(searchQuery || performanceFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setPerformanceFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Productivity</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(summaryData?.avgProductivity || 0)}%</div>
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>Team average</span>
            </div>
            <Progress value={summaryData?.avgProductivity || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(summaryData?.avgSatisfaction || 0).toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">
              Team average rating
            </p>
            <div className="flex items-center space-x-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= Math.round(summaryData?.avgSatisfaction || 0)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Handled</CardTitle>
            <Award className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData?.totalTicketsHandled || 0}</div>
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>Last 30 days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData?.totalAgents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Team members with activity
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Performance Overview</TabsTrigger>
          <TabsTrigger value="individual">Individual Metrics</TabsTrigger>
          <TabsTrigger value="training">Training Needs</TabsTrigger>
          <TabsTrigger value="kpi">KPI Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Metrics</CardTitle>
              <CardDescription>
                Key performance indicators across the support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Tickets Handled</TableHead>
                    <TableHead>Resolved</TableHead>
                    <TableHead>Avg Response Time</TableHead>
                    <TableHead>Satisfaction</TableHead>
                    <TableHead>Productivity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTeam.map((agent: TeamAgent) => (
                    <TableRow key={agent._id}>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell>{agent.role}</TableCell>
                      <TableCell>{agent.totalTickets}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span>{agent.resolvedTickets}</span>
                          <span className="text-muted-foreground">
                            ({Math.round(agent.resolutionRate)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span>{Math.round(agent.avgResponseTime)}m</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{agent.satisfaction}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-secondary rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(agent.productivity, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm">{Math.round(agent.productivity)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          agent.productivity >= 90 ? 'default' : 
                          agent.productivity >= 80 ? 'secondary' : 'destructive'
                        }>
                          {agent.productivity >= 90 ? 'Excellent' : 
                           agent.productivity >= 80 ? 'Good' : 'Needs Review'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual">
          <Card>
            <CardHeader>
              <CardTitle>Individual Performance Details</CardTitle>
              <CardDescription>
                Detailed breakdown of each team member's performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredAndSortedTeam.map((agent: TeamAgent) => (
                  <Card key={agent._id}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{agent.name}</span>
                        <Badge variant="outline">{agent.role}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{agent.totalTickets}</div>
                          <div className="text-sm text-muted-foreground">Total Handled</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{Math.round(agent.avgResponseTime)}m</div>
                          <div className="text-sm text-muted-foreground">Avg Response</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{agent.satisfaction}/5</div>
                          <div className="text-sm text-muted-foreground">Satisfaction</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{Math.round(agent.productivity)}%</div>
                          <div className="text-sm text-muted-foreground">Productivity</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle>Training & Development Needs</CardTitle>
              <CardDescription>
                Identify areas where team members need additional training and support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamData
                  .filter((agent: TeamAgent) => agent.productivity < 80 || agent.avgResponseTime > 30)
                  .map((agent: TeamAgent) => (
                  <div key={agent._id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{agent.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {agent.productivity < 80 && 'Low productivity detected'}
                          {agent.avgResponseTime > 30 && 'High response time'}
                        </p>
                      </div>
                      <Badge variant={agent.productivity < 70 ? 'destructive' : 'secondary'}>
                        {agent.productivity < 70 ? 'High Priority' : 'Medium Priority'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span>
                        Productivity: {Math.round(agent.productivity)}% | 
                        Response Time: {Math.round(agent.avgResponseTime)}m
                      </span>
                    </div>
                  </div>
                ))}
                
                {teamData.every((agent: TeamAgent) => agent.productivity >= 80 && agent.avgResponseTime <= 30) && (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-600">Excellent Team Performance!</h3>
                    <p className="text-muted-foreground">All team members are meeting performance targets.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpi">
          <Card>
            <CardHeader>
              <CardTitle>KPI Performance Tracking</CardTitle>
              <CardDescription>
                Track key performance indicators against targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Average Resolution Rate</h4>
                    <p className="text-sm text-muted-foreground">Target: 85%</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {Math.round(teamData.reduce((sum: number, agent: TeamAgent) => sum + agent.resolutionRate, 0) / teamData.length)}%
                    </div>
                    <Badge variant="default">On Target</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Customer Satisfaction Score</h4>
                    <p className="text-sm text-muted-foreground">Target: 4.5/5</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{(summaryData?.avgSatisfaction || 0).toFixed(1)}/5</div>
                    <Badge variant={(summaryData?.avgSatisfaction || 0) >= 4.5 ? 'default' : 'destructive'}>
                      {(summaryData?.avgSatisfaction || 0) >= 4.5 ? 'On Target' : 'Below Target'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Average Response Time</h4>
                    <p className="text-sm text-muted-foreground">Target: ≤ 20 minutes</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {Math.round(teamData.reduce((sum: number, agent: TeamAgent) => sum + agent.avgResponseTime, 0) / teamData.length)}m
                    </div>
                    <Badge variant="default">Good</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}