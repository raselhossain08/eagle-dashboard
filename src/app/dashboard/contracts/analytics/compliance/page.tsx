'use client'

import React from 'react'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { useComplianceMetrics } from '@/hooks/use-contract-analytics'
import { useContractsStore } from '@/store/contracts-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Download, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
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

export default function ContractsCompliancePage() {
  const { dateRange, setDateRange } = useContractsStore()
  const { data: complianceMetrics, isLoading, error } = useComplianceMetrics(dateRange)

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'Analytics', href: '/dashboard/contracts/analytics' },
    { label: 'Compliance' }
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

  if (isLoading) {
    return (
      <ContractsDashboardShell
        title="Compliance Analytics"
        description="Monitor contract compliance and audit results"
        breadcrumbs={breadcrumbs}
        actions={actions}
      >
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </ContractsDashboardShell>
    )
  }

  if (error) {
    return (
      <ContractsDashboardShell
        title="Compliance Analytics"
        description="Monitor contract compliance and audit results"
        breadcrumbs={breadcrumbs}
        actions={actions}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Failed to load compliance data</h3>
            <p className="text-muted-foreground">Please try again later</p>
          </div>
        </div>
      </ContractsDashboardShell>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 90) return 'default'
    if (score >= 70) return 'secondary'
    return 'destructive'
  }

  return (
    <ContractsDashboardShell
      title="Compliance Analytics"
      description="Monitor contract compliance and audit results"
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(complianceMetrics?.overallScore || 0)}`}>
              {complianceMetrics?.overallScore || 0}%
            </div>
            <Progress 
              value={complianceMetrics?.overallScore || 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceMetrics?.totalAudits || 0}</div>
            <p className="text-xs text-muted-foreground">
              {complianceMetrics?.passedAudits || 0} passed, {complianceMetrics?.failedAudits || 0} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {complianceMetrics?.criticalIssues || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceMetrics?.warningIssues || 0} warnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceMetrics?.totalAudits ? 
                Math.round((complianceMetrics.passedAudits / complianceMetrics.totalAudits) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Audit success rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Compliance by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance by Category</CardTitle>
            <CardDescription>
              Audit results broken down by compliance category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceMetrics?.auditsByCategory?.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {category.category.replace('_', ' ')}
                    </span>
                    <Badge variant={getScoreBadgeVariant(
                      category.total ? (category.passed / category.total) * 100 : 0
                    )}>
                      {category.total ? Math.round((category.passed / category.total) * 100) : 0}%
                    </Badge>
                  </div>
                  <Progress 
                    value={category.total ? (category.passed / category.total) * 100 : 0}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{category.passed} passed</span>
                    <span>{category.failed} failed</span>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No compliance data available for the selected period
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Compliance History */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Trend</CardTitle>
            <CardDescription>
              Compliance score over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceMetrics?.complianceHistory?.map((point, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">
                    {new Date(point.date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress value={point.score} className="w-20 h-2" />
                    <span className={`text-sm font-medium ${getScoreColor(point.score)}`}>
                      {point.score}%
                    </span>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No historical data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Audits */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Audits</CardTitle>
          <CardDescription>
            Latest compliance audit results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {complianceMetrics?.recentAudits && complianceMetrics.recentAudits.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issues</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complianceMetrics.recentAudits.map((audit) => (
                  <TableRow key={audit.id}>
                    <TableCell className="font-mono text-sm">
                      {audit.contractId.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        audit.status === 'passed' ? 'default' :
                        audit.status === 'warning' ? 'secondary' : 'destructive'
                      }>
                        {audit.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {audit.issues.length > 0 ? (
                        <span className="text-sm">{audit.issues.join(', ')}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(audit.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent audits available
            </p>
          )}
        </CardContent>
      </Card>
    </ContractsDashboardShell>
  )
}
