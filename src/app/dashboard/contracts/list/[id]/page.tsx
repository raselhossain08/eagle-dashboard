'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { ContractDetailsPanel } from '@/components/contracts/contract-details-panel'
import { useContract } from '@/hooks/use-contracts'
import { useEvidencePackage } from '@/hooks/use-signatures'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Send, FileX } from 'lucide-react'
import Link from 'next/link'

export default function ContractDetailsPage() {
  const params = useParams()
  const contractId = params.id as string

  const { data: contract, isLoading: contractLoading } = useContract(contractId)
  const { data: evidencePackage, isLoading: evidenceLoading } = useEvidencePackage(contractId)

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'All Contracts', href: '/dashboard/contracts/list' },
    { label: contract?.title || 'Contract Details' }
  ]

  const handleSendContract = async () => {
    // Implement send contract logic
    console.log('Send contract:', contractId)
  }

  const handleVoidContract = async (reason: string) => {
    // Implement void contract logic
    console.log('Void contract:', contractId, reason)
  }

  const handleDownloadContract = async () => {
    // Implement download contract logic
    console.log('Download contract:', contractId)
  }

  const handleViewEvidence = () => {
    // Implement view evidence logic
    console.log('View evidence for contract:', contractId)
  }

  if (contractLoading) {
    return (
      <ContractsDashboardShell
        title="Loading..."
        description="Loading contract details"
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading contract details...</p>
          </div>
        </div>
      </ContractsDashboardShell>
    )
  }

  if (!contract) {
    return (
      <ContractsDashboardShell
        title="Contract Not Found"
        description="The requested contract could not be found"
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Contract not found</h3>
            <p className="text-muted-foreground mt-2">
              The contract you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/contracts/list">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Contracts
              </Link>
            </Button>
          </div>
        </div>
      </ContractsDashboardShell>
    )
  }

  return (
    <ContractsDashboardShell
      title={contract.title}
      description={`Contract ID: ${contract.id}`}
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownloadContract}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          
          {contract.status === 'draft' && (
            <Button onClick={handleSendContract}>
              <Send className="h-4 w-4 mr-2" />
              Send Contract
            </Button>
          )}
          
          {contract.status !== 'void' && contract.status !== 'signed' && (
            <Button variant="outline" onClick={() => handleVoidContract('Manual void')}>
              <FileX className="h-4 w-4 mr-2" />
              Void Contract
            </Button>
          )}
        </div>
      }
    >
      <ContractDetailsPanel
        contract={contract}
        customer={{ id: contract.userId, name: 'Customer Name', email: 'customer@example.com' }} // Mock data
        template={{ 
          id: contract.templateId, 
          name: 'Template Name', 
          content: '',
          type: 'standard',
          locale: 'en-US',
          variables: [],
          termsVersion: '1.0',
          privacyVersion: '1.0',
          isActive: true,
          isDefault: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }} // Mock data
        signature={contract.signatureId ? {
          id: contract.signatureId,
          userId: contract.userId,
          contractId: contract.id,
          fullName: 'Signed Name',
          email: 'signed@example.com',
          signatureType: 'typed',
          consents: {
            terms: true,
            privacy: true,
            cancellation: true
          },
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          contentHash: 'hash',
          signedAt: new Date()
        } : undefined} // Mock data
        evidencePackage={evidencePackage}
        onSend={handleSendContract}
        onVoid={handleVoidContract}
        onDownload={handleDownloadContract}
        onViewEvidence={handleViewEvidence}
      />
    </ContractsDashboardShell>
  )
}