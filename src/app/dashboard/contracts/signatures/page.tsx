'use client'

import React from 'react'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { SignaturesTable } from '@/components/contracts/signatures-table'
import { useSignatureAnalytics } from '@/hooks/use-signatures'
import { useContractsStore } from '@/store/contracts-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Filter, BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function SignaturesOverviewPage() {
  const { dateRange } = useContractsStore()
  const { data: analytics, isLoading } = useSignatureAnalytics(dateRange)

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'Signatures' }
  ]

  const actions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <Filter className="h-4 w-4 mr-2" />
        Filters
      </Button>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
  )

  return (
    <ContractsDashboardShell
      title="Digital Signatures"
      description="Manage and track digital signatures with comprehensive evidence"
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      {/* Signature Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signatures</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalSignatures || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time signatures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.monthlySignatures || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signature Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.signatureRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Signing Time</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.averageSigningTime || 0}h</div>
            <p className="text-xs text-muted-foreground">
              From sent to signed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Signature Types Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Signature Types</CardTitle>
          <CardDescription>
            Distribution of signature methods used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Drawn</Badge>
              <span className="text-sm text-muted-foreground">45%</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Typed</Badge>
              <span className="text-sm text-muted-foreground">35%</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Uploaded</Badge>
              <span className="text-sm text-muted-foreground">20%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signatures Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Signatures</CardTitle>
          <CardDescription>
            Latest digital signatures with evidence packages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignaturesTable
            data={[]} // Will be populated from API
            onViewEvidence={(signatureId) => console.log('View evidence:', signatureId)}
            onValidate={(signatureId) => console.log('Validate:', signatureId)}
            onExport={(signatureId) => console.log('Export:', signatureId)}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </ContractsDashboardShell>
  )
}