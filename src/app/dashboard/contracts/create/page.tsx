'use client'

import React, { useState } from 'react'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { ContractCreationWizard } from '@/components/contracts/contract-creation-wizard'
import { useTemplates } from '@/hooks/use-templates'
import { useCreateContract } from '@/hooks/use-contracts'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { CreateContractDto } from '@/lib/types/contracts'

// Mock customers data - in real app, this would come from API
const mockCustomers = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Acme Corp', email: 'contact@acme.com' },
]

export default function CreateContractPage() {
  const [showWizard, setShowWizard] = useState(false)
  const { data: templatesResponse, isLoading: templatesLoading } = useTemplates({})
  const createContract = useCreateContract()

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'Create Contract' }
  ]

  const handleCreateContract = async (data: CreateContractDto) => {
    try {
      await createContract.mutateAsync(data)
      setShowWizard(false)
      // In real app, would navigate to the new contract
    } catch (error) {
      console.error('Failed to create contract:', error)
    }
  }

  const handlePreviewTemplate = (content: string, variables: Record<string, any>) => {
    // Implement preview logic
    console.log('Preview:', { content, variables })
  }

  if (templatesLoading) {
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
            {templatesResponse?.data.map((template) => (
              <div
                key={template.id}
                className="border rounded-lg p-6 hover:border-primary cursor-pointer transition-colors"
                onClick={() => setShowWizard(true)}
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
          {templatesResponse?.data.length === 0 && (
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
          templates={templatesResponse?.data || []}
          customers={mockCustomers}
          onSubmit={handleCreateContract}
          onPreview={handlePreviewTemplate}
          onCancel={() => setShowWizard(false)}
          isLoading={createContract.isPending}
          open={showWizard}
        />
      )}
    </>
  )
}