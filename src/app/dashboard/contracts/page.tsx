'use client'

import React from 'react'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { ContractsOverviewCards } from '@/components/contracts/contracts-overview-cards'
import { ContractStatusFlowChart } from '@/components/contracts/contract-status-flow-chart'
import { SigningActivityChart } from '@/components/contracts/signing-activity-chart'
import { useContractMetrics } from '@/hooks/use-contracts'
import { useContractsStore } from '@/store/contracts-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function ContractsOverviewPage() {
  const { dateRange } = useContractsStore()
  const { data: metrics, isLoading } = useContractMetrics(dateRange)

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts' }
  ]

  const actions = (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      New Contract
    </Button>
  )

  return (
    <ContractsDashboardShell
      title="Contracts Overview"
      description="Manage and track your contracts and signatures"
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      {/* Overview Cards */}
      <ContractsOverviewCards
        data={metrics || {
          totalContracts: 0,
          draftContracts: 0,
          sentContracts: 0,
          signedContracts: 0,
          expiredContracts: 0,
          signatureRate: 0,
          averageSigningTime: 0,
          pendingSignatures: 0
        }}
        dateRange={dateRange}
        isLoading={isLoading}
      />

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Flow Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Status</CardTitle>
            <CardDescription>
              Distribution of contracts by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContractStatusFlowChart
              data={[
                { status: 'draft', count: metrics?.draftContracts || 0, percentage: 0 },
                { status: 'sent', count: metrics?.sentContracts || 0, percentage: 0 },
                { status: 'signed', count: metrics?.signedContracts || 0, percentage: 0 },
                { status: 'expired', count: metrics?.expiredContracts || 0, percentage: 0 },
              ]}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Signing Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Signing Activity</CardTitle>
            <CardDescription>
              Contract activity over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SigningActivityChart
              data={[]}
              period="weekly"
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest contract actions and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add recent activity list here */}
            <p className="text-sm text-muted-foreground text-center py-8">
              Recent activity will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    </ContractsDashboardShell>
  )
}