'use client'

import React, { useState, useCallback } from 'react'
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
import { Download, Filter, BarChart3, TrendingUp, AlertTriangle, FileCheck, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function SignaturesOverviewPage() {
  const { dateRange } = useContractsStore()
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isExporting, setIsExporting] = useState(false)
  const pageSize = 10

  // Fetch data using real hooks
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useSignatureAnalytics(dateRange)
  const { data: signaturesData, isLoading: signaturesLoading, error: signaturesError, refetch: refetchSignatures } = useSignatures({
    page: currentPage,
    limit: pageSize,
    search: search || undefined,
  })
  const { data: typesDistribution, isLoading: typesLoading, error: typesError } = useSignatureTypesDistribution(dateRange)

  // Mutations for actions
  const validateEvidence = useValidateEvidence()
  const exportEvidence = useExportEvidence()
  const exportSignatures = useExportSignatures()

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'Digital Signatures', href: '/dashboard/contracts/signatures' }
  ]

  const handleValidate = useCallback(async (signatureId: string) => {
    try {
      toast.info('Validating signature evidence...')
      
      // First we need to get the evidence package ID for this signature
      // For now, we'll use the signature ID as evidence package ID
      // In a real scenario, you'd need to fetch the signature details first
      const result = await validateEvidence.mutateAsync(signatureId)
      
      if (result.isValid) {
        toast.success('Signature evidence validated successfully')
      } else {
        toast.error(`Validation failed: ${result.message || 'Unknown error'}`)
      }
      
    } catch (error) {
      console.error('Validation failed:', error)
      toast.error(error instanceof Error ? error.message : 'Validation failed')
    }
  }, [validateEvidence])

  const handleExport = useCallback(async (signatureId: string) => {
    try {
      toast.info('Exporting signature evidence...')
      
      // Export evidence for this signature
      await exportEvidence.mutateAsync(signatureId)
      
      toast.success('Evidence package exported successfully')
      
    } catch (error) {
      console.error('Export failed:', error)
      toast.error(error instanceof Error ? error.message : 'Export failed')
    }
  }, [exportEvidence])

  const handleExportAll = useCallback(async () => {
    try {
      setIsExporting(true)
      toast.info('Exporting all signatures...')
      
      await exportSignatures.mutateAsync({ 
        format: 'csv', 
        dateRange 
      })
      
      toast.success('Signatures exported successfully')
      
    } catch (error) {
      console.error('Export failed:', error)
      toast.error(error instanceof Error ? error.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }, [exportSignatures, dateRange])

  // Refetch data when date range changes
  React.useEffect(() => {
    refetchAnalytics()
    refetchSignatures()
  }, [dateRange, refetchAnalytics, refetchSignatures])

  const actions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <Filter className="h-4 w-4 mr-2" />
        Filter
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExportAll}
        disabled={isExporting || exportSignatures.isPending}
      >
        <Download className="h-4 w-4 mr-2" />
        {(isExporting || exportSignatures.isPending) ? 'Exporting...' : 'Export All'}
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
      {(analyticsError || signaturesError || typesError) && (
        <Alert className="mb-6" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {analyticsError && `Analytics: ${analyticsError.message}`}
            {signaturesError && `Signatures: ${signaturesError.message}`}
            {typesError && `Types: ${typesError.message}`}
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
            <Clock className="h-4 w-4 text-muted-foreground" />
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
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Digital Signatures
          </CardTitle>
          <CardDescription>
            Comprehensive signature management with evidence packages and validation
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