'use client'

import React from 'react'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { TemplateEditor } from '@/components/contracts/template-editor'
import { useCreateTemplate } from '@/hooks/use-templates'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CreateTemplateDto } from '@/lib/types/contracts'

export default function NewTemplatePage() {
  const createTemplate = useCreateTemplate()

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'Templates', href: '/dashboard/contracts/templates' },
    { label: 'New Template' }
  ]

  const handleSaveTemplate = async (data: CreateTemplateDto) => {
    try {
      await createTemplate.mutateAsync(data)
      // Navigation would happen in the mutation onSuccess
    } catch (error) {
      console.error('Failed to create template:', error)
    }
  }

  const handlePreviewTemplate = (content: string, variables: Record<string, any>) => {
    // Implement preview logic
    console.log('Preview:', { content, variables })
  }

  return (
    <ContractsDashboardShell
      title="Create Template"
      description="Create a new contract template with dynamic variables"
      breadcrumbs={breadcrumbs}
      actions={
        <Button asChild variant="outline">
          <Link href="/dashboard/contracts/templates">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Link>
        </Button>
      }
    >
      <TemplateEditor
        onSave={handleSaveTemplate}
        onPreview={handlePreviewTemplate}
        onCancel={() => window.history.back()}
        isLoading={createTemplate.isPending}
      />
    </ContractsDashboardShell>
  )
}