'use client'

import React from 'react'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { ContractStatusFlowChart } from '@/components/contracts/contract-status-flow-chart'
import { SigningActivityChart } from '@/components/contracts/signing-activity-chart'
import { useContractMetrics } from '@/hooks/use-contracts'
import { useSignatureAnalytics } from '@/hooks/use-signatures'
import { useTemplatePerformance } from '@/hooks/use-contract-analytics'
import { useContractsStore } from '@/store/contracts-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Calendar, TrendingUp, Clock } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/loading-spinner'

export default function ContractsAnalyticsPage() {
  const { dateRange, setDateRange } = useContractsStore()
  const { data: contractMetrics, isLoading: contractsLoading } = useContractMetrics(dateRange)
  const { data: signatureAnalytics, isLoading: signaturesLoading } = useSignatureAnalytics(dateRange)
  const { data: templatePerformance, isLoading: templatesLoading } = useTemplatePerformance(dateRange)

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'Analytics' }
  ]

  const actions = (
    <div className="flex items-center gap-2">
      <Select
        value="30d"
        onValueChange={(value) => {
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

      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export Report
      </Button>
    </div>
  )

  const isLoading = contractsLoading || signaturesLoading || templatesLoading

  if (isLoading) {
    return (
      <ContractsDashboardShell
        title="Contracts Analytics"
        description="Comprehensive analytics and insights for your contracts"
        breadcrumbs={breadcrumbs}
        actions={actions}
      >
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </ContractsDashboardShell>
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
    <ContractsDashboardShell
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
            <ContractStatusFlowChart
              data={statusFlowData}
              isLoading={isLoading}
            />
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
            <SigningActivityChart
              data={signingActivityData}
              period="daily"
              isLoading={isLoading}
            />
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
    </ContractsDashboardShell>
  )
}