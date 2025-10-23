'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { ContractDetailsPanel } from '@/components/contracts/contract-details-panel'
import { useContract } from '@/hooks/use-contracts'
import { useUser } from '@/hooks/use-users'
import { useTemplate } from '@/hooks/use-templates'
import { useSignature, useEvidencePackage } from '@/hooks/use-signatures'
import { useSendContract, useVoidContract, useDownloadContract } from '@/hooks/use-contracts'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Send, FileX, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ContractStatus, ContractTemplate } from '@/lib/types/contracts'

export default function ContractDetailsPage() {
  const params = useParams()
  const contractId = params.id as string

  const { data: contract, isLoading: contractLoading, error: contractError } = useContract(contractId)
  const { data: customer, isLoading: customerLoading } = useUser(contract?.userId || '')
  const { data: template, isLoading: templateLoading } = useTemplate(contract?.templateId || '')
  
  // Get the first signature if available
  const firstSignatureId = contract?.signatures?.[0]?.id
  const { data: signature, isLoading: signatureLoading } = useSignature(firstSignatureId || '')
  const { data: evidencePackage, isLoading: evidenceLoading } = useEvidencePackage(contractId)

  const sendContractMutation = useSendContract()
  const voidContractMutation = useVoidContract()
  const downloadContractMutation = useDownloadContract()

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'All Contracts', href: '/dashboard/contracts/list' },
    { label: contract?.title || 'Contract Details' }
  ]

  const handleSendContract = async () => {
    try {
      await sendContractMutation.mutateAsync(contractId)
      toast.success('Contract sent successfully')
    } catch (error) {
      toast.error('Failed to send contract')
      console.error('Send contract error:', error)
    }
  }

  const handleVoidContract = async (reason: string) => {
    try {
      await voidContractMutation.mutateAsync({ id: contractId, reason })
      toast.success('Contract voided successfully')
    } catch (error) {
      toast.error('Failed to void contract')
      console.error('Void contract error:', error)
    }
  }

  const handleDownloadContract = async () => {
    try {
      await downloadContractMutation.mutateAsync(contractId)
      toast.success('Contract downloaded successfully')
    } catch (error) {
      toast.error('Failed to download contract')
      console.error('Download contract error:', error)
    }
  }

  const handleViewEvidence = () => {
    if (evidencePackage) {
      // Open evidence viewer or navigate to evidence page
      window.open(`/dashboard/contracts/${contractId}/evidence`, '_blank')
    }
  }

  const isLoading = contractLoading || customerLoading || templateLoading

  if (contractError) {
    return (
      <ContractsDashboardShell
        title="Error Loading Contract"
        description="There was an error loading the contract details"
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileX className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium">Failed to load contract</h3>
            <p className="text-muted-foreground mt-2">
              {contractError instanceof Error ? contractError.message : 'An unexpected error occurred.'}
            </p>
            <Button asChild className="mt-4" variant="outline">
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

  if (isLoading) {
    return (
      <ContractsDashboardShell
        title="Loading..."
        description="Loading contract details"
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
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

  // Create customer object from contract data if customer not found
  const customerData = customer || {
    id: contract.userId,
    email: contract.recipientEmail || contract.user?.email || 'unknown@example.com',
    firstName: contract.user?.firstName || contract.recipientName?.split(' ')[0] || 'Unknown',
    lastName: contract.user?.lastName || contract.recipientName?.split(' ').slice(1).join(' ') || 'User',
    name: contract.user?.name || contract.recipientName || 'Unknown Customer',
    status: 'active' as const,
    role: 'customer',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  // Create template object from contract data if template not found
  const templateData: ContractTemplate = template ? {
    id: template.id,
    name: template.name,
    category: template.category || template.type || 'standard',
    content: template.content,
    variables: template.variables || [],
    isDefault: template.isDefault,
    isActive: template.isActive,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt
  } : {
    id: contract.templateId || 'unknown',
    name: contract.template?.name || (templateLoading ? 'Loading...' : 'Unknown Template'),
    category: contract.template?.category || contract.template?.type || 'standard',
    content: contract.content || '',
    variables: contract.variables ? Object.keys(contract.variables).map(key => ({
      name: key,
      type: 'string',
      required: false,
      defaultValue: contract.variables![key]
    })) : [],
    isDefault: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  return (
    <ContractsDashboardShell
      title={contract.title}
      description={`Contract ID: ${contract.id}`}
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleDownloadContract}
            disabled={downloadContractMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            {downloadContractMutation.isPending ? 'Downloading...' : 'Download PDF'}
          </Button>
          
          {contract.status === ContractStatus.DRAFT && (
            <Button 
              onClick={handleSendContract}
              disabled={sendContractMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              {sendContractMutation.isPending ? 'Sending...' : 'Send Contract'}
            </Button>
          )}
          
          {contract.status !== ContractStatus.VOIDED && contract.status !== ContractStatus.SIGNED && (
            <Button 
              variant="outline" 
              onClick={() => handleVoidContract('Manual void')}
              disabled={voidContractMutation.isPending}
            >
              <FileX className="h-4 w-4 mr-2" />
              {voidContractMutation.isPending ? 'Voiding...' : 'Void Contract'}
            </Button>
          )}
        </div>
      }
    >
      <ContractDetailsPanel
        contract={contract}
        customer={customerData}
        template={templateData}
        signature={signature}
        evidencePackage={evidencePackage}
        onSend={handleSendContract}
        onVoid={handleVoidContract}
        onDownload={handleDownloadContract}
        onViewEvidence={handleViewEvidence}
      />
    </ContractsDashboardShell>
  )
}