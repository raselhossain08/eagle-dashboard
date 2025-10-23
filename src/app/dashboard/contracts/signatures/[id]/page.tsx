'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { SignatureEvidenceViewer } from '@/components/contracts/signature-evidence-viewer'
import { useSignature, useValidateEvidence, useExportEvidence, useEvidencePackageBySignature } from '@/hooks/use-signatures'
import { useContract } from '@/hooks/use-contracts'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, CheckCircle, Loader2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SignatureDetailsPage() {
  const params = useParams()
  const signatureId = params.id as string
  
  // Fetch signature details
  const { data: signature, isLoading: signatureLoading, error: signatureError } = useSignature(signatureId)
  
  // Fetch evidence package using signatureId
  const { data: evidencePackage, isLoading: evidenceLoading, error: evidenceError } = useEvidencePackageBySignature(
    signatureId
  )
  
  // Fetch contract details
  const { data: contract, isLoading: contractLoading } = useContract(signature?.contractId || '')
  
  // Validation and export mutations
  const validateEvidence = useValidateEvidence()
  const exportEvidence = useExportEvidence()

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'Signatures', href: '/dashboard/contracts/signatures' },
    { label: `Signature ${signatureId.slice(0, 8)}...` }
  ]

  const handleValidateSignature = async () => {
    if (!evidencePackage?.id) return { isValid: false, errors: ['Evidence package not found'], timestamp: new Date(), message: 'No evidence package available' }
    
    try {
      return await validateEvidence.mutateAsync(evidencePackage.id)
    } catch (error) {
      console.error('Validation error:', error)
      return { 
        isValid: false, 
        errors: ['Validation failed due to network error'], 
        timestamp: new Date(),
        message: 'Failed to validate evidence package'
      }
    }
  }

  const handleExportEvidence = async () => {
    if (!evidencePackage?.id) {
      console.error('No evidence package ID available')
      return
    }
    
    try {
      await exportEvidence.mutateAsync(evidencePackage.id)
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const isLoading = signatureLoading || evidenceLoading || contractLoading
  const hasError = signatureError || evidenceError

  if (isLoading) {
    return (
      <ContractsDashboardShell
        title="Loading Signature..."
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading signature evidence...</span>
        </div>
      </ContractsDashboardShell>
    )
  }

  if (hasError) {
    return (
      <ContractsDashboardShell
        title="Error Loading Signature"
        breadcrumbs={breadcrumbs}
      >
        <Card>
          <CardContent className="p-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {signatureError ? 
                  `Failed to load signature: ${signatureError.message}` :
                  `Failed to load evidence: ${evidenceError?.message}`
                }
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button asChild>
                <Link href="/dashboard/contracts/signatures">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Signatures
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </ContractsDashboardShell>
    )
  }

  if (!signature) {
    return (
      <ContractsDashboardShell
        title="Signature Not Found"
        breadcrumbs={breadcrumbs}
      >
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Signature Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The signature you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button asChild>
                <Link href="/dashboard/contracts/signatures">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Signatures
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </ContractsDashboardShell>
    )
  }

  if (!evidencePackage) {
    return (
      <ContractsDashboardShell
        title="Evidence Package Not Found"
        description={`Signature by ${signature.fullName}`}
        breadcrumbs={breadcrumbs}
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/contracts/signatures">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Signatures
            </Link>
          </Button>
        }
      >
        <Card>
          <CardContent className="p-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No evidence package found for this signature. The evidence may still be generating or there was an error during signature creation.
              </AlertDescription>
            </Alert>
            
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold">Signature Information:</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Signer:</span>
                  <span>{signature.fullName} ({signature.email})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Signed At:</span>
                  <span>{new Date(signature.signedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Signature Type:</span>
                  <span className="capitalize">{signature.signatureType}</span>
                </div>
                {signature.company && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company:</span>
                    <span>{signature.company}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </ContractsDashboardShell>
    )
  }

  return (
    <ContractsDashboardShell
      title="Signature Evidence"
      description={`Digital signature by ${signature.fullName}${contract ? ` for "${contract.title}"` : ''}`}
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportEvidence}
            disabled={exportEvidence.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            {exportEvidence.isPending ? 'Exporting...' : 'Export Evidence'}
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/contracts/signatures">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Signatures
            </Link>
          </Button>
        </div>
      }
    >
      <SignatureEvidenceViewer
        signature={signature}
        evidencePackage={evidencePackage}
        onValidate={handleValidateSignature}
        onExport={handleExportEvidence}
        showTechnicalDetails={true}
      />
    </ContractsDashboardShell>
  )
}