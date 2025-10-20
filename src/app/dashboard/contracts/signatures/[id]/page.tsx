'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { SignatureEvidenceViewer } from '@/components/contracts/signature-evidence-viewer'
import { useSignature } from '@/hooks/use-signatures'
import { useContract } from '@/hooks/use-contracts'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function SignatureDetailsPage() {
  const params = useParams()
  const signatureId = params.id as string
  const { data: signature, isLoading: signatureLoading } = useSignature(signatureId)
  const { data: contract, isLoading: contractLoading } = useContract(signature?.contractId || '')

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'Signatures', href: '/dashboard/contracts/signatures' },
    { label: `Signature ${signatureId.slice(0, 8)}...` }
  ]

  const handleValidateSignature = async () => {
    // Implement signature validation
    return { isValid: true, errors: [], timestamp: new Date() }
  }

  const handleExportEvidence = async () => {
    // Implement evidence export
    console.log('Exporting evidence...')
  }

  const isLoading = signatureLoading || contractLoading

  if (isLoading) {
    return (
      <ContractsDashboardShell
        title="Loading Signature..."
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ContractsDashboardShell>
    )
  }

  if (!signature || !contract) {
    return (
      <ContractsDashboardShell
        title="Signature Not Found"
        breadcrumbs={breadcrumbs}
      >
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Signature not found.</p>
          <Button asChild>
            <Link href="/dashboard/contracts/signatures">
              Back to Signatures
            </Link>
          </Button>
        </div>
      </ContractsDashboardShell>
    )
  }

  // Mock evidence package - in real app, this would come from API
  const evidencePackage = {
    id: `evd_${signature.id}`,
    contractId: signature.contractId,
    signatureId: signature.id,
    technicalEvidence: {
      ipAddress: signature.ipAddress,
      userAgent: signature.userAgent,
      deviceInfo: signature.deviceInfo || 'Unknown Device',
      timestamp: signature.signedAt
    },
    legalConsents: signature.consents,
    createdAt: signature.signedAt
  }

  return (
    <ContractsDashboardShell
      title="Signature Evidence"
      description={`Digital signature by ${signature.fullName}`}
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportEvidence}>
            <Download className="h-4 w-4 mr-2" />
            Export Evidence
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