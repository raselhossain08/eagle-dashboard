'use client'

import { useState, useMemo, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { 
  Download, Calendar, TrendingUp, Clock, RefreshCw, Activity, 
  BarChart3, FileText, Users, Eye, EyeOff, Target, Zap,
  TrendingDown, AlertCircle, CheckCircle 
} from 'lucide-react'

// Mock UI Components for demonstration
const Card = ({ children, className = "" }: any) => <div className={`border rounded-lg p-4 ${className}`}>{children}</div>
const CardHeader = ({ children }: any) => <div className="pb-2">{children}</div>
const CardTitle = ({ children, className = "" }: any) => <h3 className={`font-semibold ${className}`}>{children}</h3>
const CardDescription = ({ children }: any) => <p className="text-gray-600 text-sm">{children}</p>
const CardContent = ({ children }: any) => <div>{children}</div>
const Button = ({ children, variant = "default", size = "default", onClick, disabled, className = "" }: any) => (
  <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded ${className}`}>{children}</button>
)
const Badge = ({ children, variant = "default", className = "" }: any) => (
  <span className={`inline-block px-2 py-1 text-xs rounded ${className}`}>{children}</span>
)
const Switch = ({ checked, onCheckedChange, id }: any) => (
  <input type="checkbox" id={id} checked={checked} onChange={(e) => onCheckedChange?.(e.target.checked)} />
)
const Skeleton = ({ className = "" }: any) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
const Select = ({ children, value, onValueChange }: any) => (
  <select value={value} onChange={(e) => onValueChange?.(e.target.value)}>{children}</select>
)
const SelectTrigger = ({ children, className = "" }: any) => <div className={className}>{children}</div>
const SelectValue = ({ placeholder }: any) => <span>{placeholder}</span>
const SelectContent = ({ children }: any) => <>{children}</>
const SelectItem = ({ children, value }: any) => <option value={value}>{children}</option>
const Table = ({ children }: any) => <table className="w-full">{children}</table>
const TableHeader = ({ children }: any) => <thead>{children}</thead>
const TableBody = ({ children }: any) => <tbody>{children}</tbody>
const TableRow = ({ children }: any) => <tr>{children}</tr>
const TableHead = ({ children }: any) => <th className="text-left p-2">{children}</th>
const TableCell = ({ children, className = "" }: any) => <td className={`p-2 ${className}`}>{children}</td>

// Mock Dashboard Shell
const DashboardShell = ({ title, description, breadcrumbs, actions, children }: any) => (
  <div className="container mx-auto p-6">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>
      {actions}
    </div>
    {children}
  </div>
)

// Chart colors for professional visualization
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function ContractsAnalyticsPage() {
  // Enhanced state management for real-time analytics
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock data state for demonstration (replace with real API calls)
  const [dateRange, setDateRange] = useState({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() })
  
  // Mock contract metrics data
  const contractMetrics = {
    totalContracts: 245,
    signedContracts: 189,
    signatureRate: 77.1,
    averageSigningTime: 18.5,
    draftContracts: 12,
    sentContracts: 34,
    viewedContracts: 28,
    expiredContracts: 5,
    monthlyGrowth: 12.3
  }
  
  // Mock signature analytics data
  const signatureAnalytics = {
    totalSignatures: 189,
    monthlySignatures: 45,
    complianceScore: 94.5,
    evidencePackagesGenerated: 189,
    signaturesByTemplate: [],
    signaturesByDay: [
      { date: '2024-01-01', count: 12 },
      { date: '2024-01-02', count: 8 },
      { date: '2024-01-03', count: 15 }
    ]
  }
  
  // Mock template performance data
  const templatePerformance = [
    {
      templateId: '1',
      templateName: 'Service Agreement',
      category: 'services',
      totalContracts: 67,
      signatureRate: 84.2,
      averageSigningTime: 14.2,
      popularityScore: 87
    },
    {
      templateId: '2', 
      templateName: 'Employment Contract',
      category: 'hr',
      totalContracts: 43,
      signatureRate: 91.2,
      averageSigningTime: 8.7,
      popularityScore: 72
    }
  ]
  
  // Loading state
  const isLoading = false
  const hasError = false

  // Mock contract analytics data
  const contractAnalytics = {
    recentActivity: [],
    securityCompliance: 95,
    legalCompliance: 92,
    dataProtection: 88,
    auditTrail: 96
  }

  // Enhanced contract analytics calculations with real data
  const enhancedContractMetrics = useMemo(() => {
    if (!contractMetrics && !signatureAnalytics && !contractAnalytics) return null;

    const baseMetrics = contractMetrics || {} as any;
    const sigAnalytics = signatureAnalytics || {} as any;
    const analytics = contractAnalytics || {} as any;

    // Calculate enhanced metrics
    const totalContracts = baseMetrics?.totalContracts || 0;
    const signedContracts = baseMetrics?.signedContracts || 0;
    const signatureRate = baseMetrics?.signatureRate || 0;
    const averageSigningTime = baseMetrics?.averageSigningTime || 0;
    
    // Advanced calculations
    const conversionFunnel = { 
      sent: baseMetrics?.sentContracts || 0, 
      viewed: baseMetrics?.viewedContracts || 0, 
      signed: baseMetrics?.signedContracts || 0 
    };
    const conversionRate = conversionFunnel.sent > 0 ? (conversionFunnel.signed / conversionFunnel.sent) * 100 : 0;
    const viewToSignRate = conversionFunnel.viewed > 0 ? (conversionFunnel.signed / conversionFunnel.viewed) * 100 : 0;
    
    // Performance scoring
    const performanceScore = Math.min(100, (signatureRate * 0.4) + (conversionRate * 0.3) + 
                                     (viewToSignRate * 0.2) + (averageSigningTime < 24 ? 10 : 0));
    
    // Health assessment
    const healthStatus = performanceScore >= 80 ? 'excellent' : 
                        performanceScore >= 60 ? 'good' : 
                        performanceScore >= 40 ? 'fair' : 'needs_improvement';

    return {
      ...baseMetrics,
      performanceScore,
      healthStatus,
      conversionRate,
      viewToSignRate,
      totalSignatures: sigAnalytics?.totalSignatures || 0,
      monthlySignatures: sigAnalytics?.monthlySignatures || 0,
      complianceScore: sigAnalytics?.complianceScore || 0,
      evidencePackages: sigAnalytics?.evidencePackagesGenerated || 0,
      signaturesByTemplate: sigAnalytics?.signaturesByTemplate || []
    };
  }, [contractMetrics, signatureAnalytics, contractAnalytics]);

  // Comprehensive refresh functionality
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API refresh delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh analytics data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        handleRefreshAll();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'Analytics' }
  ]

  const actions = (
    <div className="flex items-center gap-2">
      <Select
        value="30d"
        onValueChange={(value: string) => {
          const days = parseInt(value)
          const to = new Date()
          const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          setDateRange({ from, to })
        }}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
          <SelectItem value="1y">Last year</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
      >
        {showAdvancedMetrics ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
        {showAdvancedMetrics ? 'Hide' : 'Show'} Advanced
      </Button>

      <Button 
        variant="outline" 
        size="sm"
        onClick={handleRefreshAll}
        disabled={isRefreshing}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </Button>

      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export Report
      </Button>
    </div>
  )

  if (isLoading) {
    return (
      <DashboardShell
        title="Contracts Analytics"
        description="Comprehensive contract analytics and performance insights"
        breadcrumbs={breadcrumbs}
        actions={actions}
      >
        <div className="space-y-6">
          {/* Loading skeleton for metrics cards */}
          <div className={`grid gap-4 ${showAdvancedMetrics ? 'md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
            {Array.from({ length: showAdvancedMetrics ? 8 : 4 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Loading skeleton for charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
          
          {/* Loading skeleton for table */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    )
  }

  // Calculate status flow data from contract metrics
  const statusFlowData = [
    { status: 'draft', count: contractMetrics?.draftContracts || 0, percentage: 0 },
    { status: 'sent', count: contractMetrics?.sentContracts || 0, percentage: 0 },
    { status: 'viewed', count: contractMetrics?.viewedContracts || 0, percentage: 0 },
    { status: 'signed', count: contractMetrics?.signedContracts || 0, percentage: 0 },
    { status: 'expired', count: contractMetrics?.expiredContracts || 0, percentage: 0 },
  ]

  // Calculate percentages
  const totalContracts = statusFlowData.reduce((sum, item) => sum + item.count, 0)
  if (totalContracts > 0) {
    statusFlowData.forEach(item => {
      item.percentage = Math.round((item.count / totalContracts) * 100)
    })
  }

  // Generate signing activity data from signature analytics
  const signingActivityData = signatureAnalytics?.signaturesByDay?.map(item => ({
    date: item.date,
    sent: contractMetrics?.sentContracts || 0, // This would need to be by day
    viewed: contractMetrics?.viewedContracts || 0, // This would need to be by day
    signed: item.count
  })) || []

  return (
    <DashboardShell
      title="Contracts Analytics"
      description="Comprehensive analytics and insights for your contracts"
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractMetrics?.totalContracts || 0}</div>
            <p className="text-xs text-muted-foreground">
              All contracts created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signed Contracts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractMetrics?.signedContracts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Successfully signed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signature Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractMetrics?.signatureRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Signing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractMetrics?.averageSigningTime || 0}h</div>
            <p className="text-xs text-muted-foreground">
              From sent to signed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contract Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Status Distribution</CardTitle>
            <CardDescription>
              Current status of all contracts in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Signing Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Signing Activity</CardTitle>
            <CardDescription>
              Contract signing activity over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={signingActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="signed" fill="#0088FE" />
                <Bar dataKey="viewed" fill="#00C49F" />
                <Bar dataKey="sent" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Template Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Template Performance</CardTitle>
          <CardDescription>
            Performance metrics by contract template
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templatePerformance && templatePerformance.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Total Contracts</TableHead>
                  <TableHead>Signature Rate</TableHead>
                  <TableHead>Avg. Signing Time</TableHead>
                  <TableHead>Popularity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templatePerformance.map((template) => (
                  <TableRow key={template.templateId}>
                    <TableCell className="font-medium">{template.templateName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {template.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{template.totalContracts}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${
                          template.signatureRate >= 70 ? 'text-green-600' :
                          template.signatureRate >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {template.signatureRate.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{template.averageSigningTime.toFixed(1)}h</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(template.popularityScore, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {template.popularityScore.toFixed(0)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No template performance data available for the selected period
            </p>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  )
}