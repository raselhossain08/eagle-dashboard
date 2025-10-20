'use client'

import React from 'react'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { ContractStatusFlowChart } from '@/components/contracts/contract-status-flow-chart'
import { SigningActivityChart } from '@/components/contracts/signing-activity-chart'
import { useContractMetrics } from '@/hooks/use-contracts'
import { useSignatureAnalytics } from '@/hooks/use-signatures'
import { useContractsStore } from '@/store/contracts-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Calendar } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ContractsAnalyticsPage() {
  const { dateRange, setDateRange } = useContractsStore()
  const { data: contractMetrics, isLoading: contractsLoading } = useContractMetrics(dateRange)
  const { data: signatureAnalytics, isLoading: signaturesLoading } = useSignatureAnalytics(dateRange)

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

  const isLoading = contractsLoading || signaturesLoading

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
            <Calendar className="h-4 w-4 text-muted-foreground" />
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
            <Calendar className="h-4 w-4 text-muted-foreground" />
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
              data={[
                { status: 'draft', count: contractMetrics?.draftContracts || 0, percentage: 0 },
                { status: 'sent', count: contractMetrics?.sentContracts || 0, percentage: 0 },
                { status: 'viewed', count: 10, percentage: 0 }, // Mock data
                { status: 'signed', count: contractMetrics?.signedContracts || 0, percentage: 0 },
                { status: 'expired', count: contractMetrics?.expiredContracts || 0, percentage: 0 },
              ]}
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
              data={[
                { date: '2024-01', sent: 45, viewed: 30, signed: 25 },
                { date: '2024-02', sent: 52, viewed: 35, signed: 28 },
                { date: '2024-03', sent: 48, viewed: 32, signed: 26 },
                { date: '2024-04', sent: 60, viewed: 40, signed: 35 },
                { date: '2024-05', sent: 55, viewed: 38, signed: 32 },
                { date: '2024-06', sent: 65, viewed: 45, signed: 40 },
              ]}
              period="monthly"
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
          <div className="space-y-4">
            {/* Add template performance table/chart here */}
            <p className="text-sm text-muted-foreground text-center py-8">
              Template performance analytics will be displayed here
            </p>
          </div>
        </CardContent>
      </Card>
    </ContractsDashboardShell>
  )
}