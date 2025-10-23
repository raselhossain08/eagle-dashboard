'use client'

import React, { useState } from 'react'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { ContractCreationWizard } from '@/components/contracts/contract-creation-wizard'
import { useTemplates } from '@/hooks/use-templates'
import { useCreateContract } from '@/hooks/use-contracts'
import { useCustomers } from '@/hooks/use-customers'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CreateContractDto } from '@/lib/types/contracts'
import { toast } from 'sonner'

export default function CreateContractPage() {
  const [showWizard, setShowWizard] = useState(false)
  const router = useRouter()
  
  const { data: templatesResponse, isLoading: templatesLoading } = useTemplates({})
  const { data: customersResponse, isLoading: customersLoading } = useCustomers({ 
    pageSize: 100 // Get more customers for the dropdown
  })
  const createContract = useCreateContract()

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'Create Contract' }
  ]

  const handleCreateContract = async (data: CreateContractDto) => {
    try {
      const result = await createContract.mutateAsync(data)
      setShowWizard(false)
      toast.success('Contract created successfully!')
      // Navigate to the new contract
      router.push(`/dashboard/contracts/list/${result.id}`)
    } catch (error) {
      console.error('Failed to create contract:', error)
      toast.error('Failed to create contract. Please try again.')
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const selectedTemplate = mappedTemplates.find(t => t.id === templateId)
    if (selectedTemplate) {
      setShowWizard(true)
    } else {
      toast.error('Template not found. Please try again.')
    }
  }

  const isLoading = templatesLoading || customersLoading

  if (isLoading) {
    return (
      <ContractsDashboardShell
        title="Create Contract"
        description="Setting up contract creation..."
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ContractsDashboardShell>
    )
  }

  // Map templates to match the expected interface
  const mappedTemplates = templatesResponse?.data.map(template => ({
    ...template,
    category: template.type || 'standard'
  })) || []

  // Map customers to expected format
  const mappedCustomers = customersResponse?.data.map(customer => ({
    id: customer.id,
    email: customer.email,
    firstName: customer.firstName || '',
    lastName: customer.lastName || '',
    status: (customer as any).status || 'active' as const,
    emailVerified: (customer as any).emailVerified || false,
    phone: (customer as any).phone,
    company: (customer as any).company,
    address: (customer as any).address,
    preferences: (customer as any).preferences || {
      notifications: { email: true, sms: false, push: false },
      language: 'en',
      timezone: 'UTC'
    },
    kycStatus: (customer as any).kycStatus || 'pending' as const,
    createdAt: (customer as any).createdAt || new Date().toISOString(),
    updatedAt: (customer as any).updatedAt || new Date().toISOString(),
    lastLogin: (customer as any).lastLogin
  })) || []

  return (
    <>
      <ContractsDashboardShell
        title="Create Contract"
        description="Create a new contract from template"
        breadcrumbs={breadcrumbs}
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/contracts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contracts
            </Link>
          </Button>
        }
      >
        <div className="max-w-4xl mx-auto">
          {/* Template Selection Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mappedTemplates.map((template) => (
              <div
                key={template.id}
                className="border rounded-lg p-6 hover:border-primary cursor-pointer transition-colors"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{template.name}</h3>
                  {template.isDefault && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {template.content.substring(0, 100)}...
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{template.type}</span>
                  <span>{template.variables.length} variables</span>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {mappedTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                No templates available. Create a template first.
              </div>
              <Button asChild>
                <Link href="/dashboard/contracts/templates/new">
                  Create Template
                </Link>
              </Button>
            </div>
          )}
        </div>
      </ContractsDashboardShell>

      {/* Contract Creation Wizard */}
      {showWizard && (
        <ContractCreationWizard
          templates={mappedTemplates}
          customers={mappedCustomers}
          onSubmit={handleCreateContract}
          onCancel={() => setShowWizard(false)}
          isLoading={createContract.isPending}
          open={showWizard}
        />
      )}
    </>
  )
}