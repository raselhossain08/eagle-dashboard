'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { ContractsOverviewCards } from '@/components/contracts/contracts-overview-cards'
import { ContractStatusFlowChart } from '@/components/contracts/contract-status-flow-chart'
import { SigningActivityChart } from '@/components/contracts/signing-activity-chart'
import { useContractMetrics, useContracts, useContractsDashboard } from '@/hooks/use-contracts'
import { useContractsStore } from '@/store/contracts-store'
import type { Contract } from '@/lib/types/contracts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  TrendingUp,
  Users,
  Activity,
  RefreshCw,
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function ContractsOverviewPage() {
  const router = useRouter()
  const { dateRange } = useContractsStore()
  
  // State management
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Use enhanced dashboard hook that combines all necessary data
  const {
    metrics,
    recentContracts,
    expiringContracts,
    isLoading: dashboardLoading,
    isError: dashboardError,
    error: dashboardErrorDetails
  } = useContractsDashboard(dateRange)

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts Overview' }
  ]

  // Event handlers
  const handleCreateContract = useCallback(() => {
    router.push('/dashboard/contracts/new')
  }, [router])

  const handleRefreshData = useCallback(async () => {
    try {
      setIsRefreshing(true)
      toast.info('Refreshing dashboard data...', { duration: 1000 })
      
      await Promise.all([
        metrics.refetch(),
        recentContracts.refetch(),
        expiringContracts.refetch()
      ])
      
      toast.success('Dashboard data refreshed successfully')
      
    } catch (error) {
      console.error('Failed to refresh data:', error)
      toast.error('Failed to refresh dashboard data')
    } finally {
      setIsRefreshing(false)
    }
  }, [metrics, recentContracts, expiringContracts])

  const handleViewAllContracts = useCallback(() => {
    router.push('/dashboard/contracts/list')
  }, [router])

  const handleViewTemplates = useCallback(() => {
    router.push('/dashboard/contracts/templates')
  }, [router])

  const handleViewSignatures = useCallback(() => {
    router.push('/dashboard/contracts/signatures')
  }, [router])

  // Auto-refresh is handled automatically by the hooks
  // No need for manual useEffect

  const actions = (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleRefreshData}
        disabled={isRefreshing || dashboardLoading}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      <Button onClick={handleCreateContract}>
        <Plus className="h-4 w-4 mr-2" />
        New Contract
      </Button>
    </div>
  )

  return (
    <ContractsDashboardShell
      title="Contracts Overview"
      description="Comprehensive contract management and analytics dashboard"
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      {/* Error States */}
      {dashboardError && (
        <Alert className="mb-6" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data: {dashboardErrorDetails?.message || 'Unknown error'}
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={handleViewAllContracts}
          >
            <FileText className="h-4 w-4 mr-2" />
            View All Contracts
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={handleViewTemplates}
          >
            <Activity className="h-4 w-4 mr-2" />
            Manage Templates
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={handleViewSignatures}
          >
            <Users className="h-4 w-4 mr-2" />
            Digital Signatures
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <ContractsOverviewCards
        data={metrics.data || {
          totalContracts: 0,
          draftContracts: 0,
          sentContracts: 0,
          viewedContracts: 0,
          signedContracts: 0,
          expiredContracts: 0,
          voidedContracts: 0,
          signatureRate: 0,
          averageSigningTime: 0,
          conversionFunnel: {
            sent: 0,
            viewed: 0,
            signed: 0
          }
        }}
        dateRange={dateRange}
        isLoading={metrics.isLoading}
      />

      {/* Analytics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Contract Status
            </CardTitle>
            <CardDescription>
              Distribution by current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <ContractStatusFlowChart
                data={[
                  { 
                    status: 'draft', 
                    count: metrics.data?.draftContracts || 0, 
                    percentage: metrics.data?.totalContracts ? Math.round((metrics.data.draftContracts / metrics.data.totalContracts) * 100) : 0 
                  },
                  { 
                    status: 'sent', 
                    count: metrics.data?.sentContracts || 0, 
                    percentage: metrics.data?.totalContracts ? Math.round((metrics.data.sentContracts / metrics.data.totalContracts) * 100) : 0 
                  },
                  { 
                    status: 'signed', 
                    count: metrics.data?.signedContracts || 0, 
                    percentage: metrics.data?.totalContracts ? Math.round((metrics.data.signedContracts / metrics.data.totalContracts) * 100) : 0 
                  },
                  { 
                    status: 'expired', 
                    count: metrics.data?.expiredContracts || 0, 
                    percentage: metrics.data?.totalContracts ? Math.round((metrics.data.expiredContracts / metrics.data.totalContracts) * 100) : 0 
                  },
                ]}
                isLoading={metrics.isLoading}
              />
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Performance
            </CardTitle>
            <CardDescription>
              Success rates and timing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Signature Rate</span>
                  <Badge variant={
                    (metrics.data?.signatureRate ?? 0) >= 80 
                      ? "default" 
                      : (metrics.data?.signatureRate ?? 0) >= 60 
                        ? "secondary" 
                        : "destructive"
                  }>
                    {metrics.data?.signatureRate || 0}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg. Signing Time</span>
                  <span className="text-sm font-medium">
                    {metrics.data?.averageSigningTime ? `${metrics.data.averageSigningTime}h` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Period</span>
                  <span className="text-sm font-medium">
                    {dateRange.from && dateRange.to 
                      ? `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
                      : 'Select date range'
                    }
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Chart */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Trend
            </CardTitle>
            <CardDescription>
              Contract activity over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SigningActivityChart
              data={metrics.data?.activityData || []}
              period="weekly"
              isLoading={metrics.isLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Contracts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Contracts
              </CardTitle>
              <CardDescription>
                Latest contract activity
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/contracts/new')}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Contract
            </Button>
          </CardHeader>
          <CardContent>
            {recentContracts.isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[140px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentContracts.error ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Failed to load recent contracts
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => recentContracts.refetch()}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Try Again
                </Button>
              </div>
            ) : recentContracts?.data && recentContracts.data.data && recentContracts.data.data.length > 0 ? (
              <div className="space-y-2">
                {recentContracts.data.data.slice(0, 5).map((contract: Contract) => (
                  <div 
                    key={contract.id} 
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => router.push(`/dashboard/contracts/${contract.id}`)}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      contract.status === 'signed' ? 'bg-green-500' :
                      contract.status === 'sent' ? 'bg-blue-500' :
                      contract.status === 'draft' ? 'bg-gray-500' :
                      'bg-red-500'
                    }`}>
                      {contract.title?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{contract.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge 
                          variant={
                            contract.status === 'signed' ? 'default' :
                            contract.status === 'sent' ? 'secondary' :
                            contract.status === 'draft' ? 'outline' :
                            'destructive'
                          }
                          className="text-xs"
                        >
                          {contract.status}
                        </Badge>
                        <span>•</span>
                        <span>{contract.recipientEmail || 'No recipient'}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {contract.createdAt ? format(new Date(contract.createdAt), 'MMM dd') : 'Unknown'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  No contracts found
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard/contracts/new')}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create First Contract
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Quick Stats
            </CardTitle>
            <CardDescription>
              Key performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center p-3 rounded-lg border">
                    <Skeleton className="h-8 w-16 mx-auto mb-1" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics.data?.totalContracts || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="text-center p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.data?.signedContracts || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Signed</div>
                </div>
                <div className="text-center p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-orange-600">
                    {metrics.data?.sentContracts || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
                <div className="text-center p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-gray-600">
                    {metrics.data?.draftContracts || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Drafts</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ContractsDashboardShell>
  )
}