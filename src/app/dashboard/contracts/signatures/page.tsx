'use client'

import React, { useState } from 'react'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { SignaturesTable } from '@/components/contracts/signatures-table'
import { 
  useSignatureAnalytics, 
  useSignatures, 
  useSignatureTypesDistribution,
  useValidateEvidence,
  useExportEvidence,
  useExportSignatures
} from '@/hooks/use-signatures'
import { useContractsStore } from '@/store/contracts-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Filter, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

export default function SignaturesOverviewPage() {
  const { dateRange } = useContractsStore()
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Fetch data using real hooks
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useSignatureAnalytics(dateRange)
  const { data: signaturesData, isLoading: signaturesLoading, error: signaturesError } = useSignatures({
    page: currentPage,
    limit: pageSize,
    search: search || undefined,
  })
  const { data: typesDistribution, isLoading: typesLoading } = useSignatureTypesDistribution(dateRange)

  // Mutations for actions
  const validateEvidence = useValidateEvidence()
  const exportEvidence = useExportEvidence()
  const exportSignatures = useExportSignatures()

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'Signatures' }
  ]

  const handleValidate = async (signatureId: string) => {
    try {
      // We need the evidence package ID, so this might need to be handled differently
      // For now, we'll just log it
      console.log('Validate signature:', signatureId)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const handleExport = async (signatureId: string) => {
    try {
      // Similar to validate, we need the evidence package ID
      console.log('Export signature:', signatureId)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleExportAll = async () => {
    try {
      await exportSignatures.mutateAsync({ 
        format: 'csv', 
        dateRange 
      })
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const actions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <Filter className="h-4 w-4 mr-2" />
        Filters
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExportAll}
        disabled={exportSignatures.isPending}
      >
        <Download className="h-4 w-4 mr-2" />
        {exportSignatures.isPending ? 'Exporting...' : 'Export'}
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
      {/* Error States */}
      {(analyticsError || signaturesError) && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {analyticsError ? 
              `Failed to load analytics: ${analyticsError.message}` :
              `Failed to load signatures: ${signaturesError?.message}`
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Signature Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signatures</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{analytics?.totalSignatures || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              All time signatures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{analytics?.monthlySignatures || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Current month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signature Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{analytics?.signatureRate || 0}%</div>
            )}
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
            {analyticsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{analytics?.averageSigningTime || 0}h</div>
            )}
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
          {typesLoading ? (
            <div className="flex gap-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          ) : typesDistribution && typesDistribution.length > 0 ? (
            <div className="flex gap-4">
              {typesDistribution.map((type) => (
                <div key={type.type} className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {type.type === 'drawn' ? 'Hand Drawn' : 
                     type.type === 'typed' ? 'Typed' : 
                     'Uploaded'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {type.percentage}% ({type.count})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No signature data available</p>
          )}
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
            data={signaturesData?.data || []}
            onValidate={handleValidate}
            onExport={handleExport}
            isLoading={signaturesLoading}
            search={search}
            onSearchChange={setSearch}
          />
          
          {/* Pagination */}
          {signaturesData?.meta && signaturesData.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, signaturesData.meta.total)} of {signaturesData.meta.total} signatures
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, signaturesData.meta.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= signaturesData.meta.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ContractsDashboardShell>
  )
}