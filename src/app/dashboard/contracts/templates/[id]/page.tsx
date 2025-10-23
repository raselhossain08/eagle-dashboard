'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { TemplateEditor } from '@/components/contracts/template-editor'
import { useTemplate, useUpdateTemplate } from '@/hooks/use-templates'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { UpdateTemplateDto, CreateTemplateDto } from '@/lib/types/contracts'
import { toast } from 'sonner'

export default function EditTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string
  const { data: template, isLoading: templateLoading } = useTemplate(templateId)
  const updateTemplate = useUpdateTemplate()

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'Templates', href: '/dashboard/contracts/templates' },
    { label: template?.name || 'Edit Template' }
  ]

  const handleSaveTemplate = async (data: CreateTemplateDto | UpdateTemplateDto) => {
    try {
      // Add id to data for update
      const updateData = { ...data, id: templateId } as UpdateTemplateDto
      await updateTemplate.mutateAsync({ id: templateId, data: updateData })
      toast.success('Template updated successfully')
      router.push('/dashboard/contracts/templates')
    } catch (error) {
      toast.error('Failed to update template')
      console.error('Failed to update template:', error)
    }
  }

  const handlePreviewTemplate = (content: string, variables: Record<string, any>) => {
    // Implement preview logic
    console.log('Preview:', { content, variables })
  }

  const handleCancel = () => {
    router.push('/dashboard/contracts/templates')
  }

  if (templateLoading) {
    return (
      <ContractsDashboardShell
        title="Loading Template..."
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ContractsDashboardShell>
    )
  }

  if (!template) {
    return (
      <ContractsDashboardShell
        title="Template Not Found"
        breadcrumbs={breadcrumbs}
      >
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Template not found.</p>
          <Button asChild>
            <Link href="/dashboard/contracts/templates">
              Back to Templates
            </Link>
          </Button>
        </div>
      </ContractsDashboardShell>
    )
  }

  return (
    <ContractsDashboardShell
      title={`Edit ${template.name}`}
      description="Update your contract template"
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
        template={template}
        onSave={handleSaveTemplate}
        onPreview={handlePreviewTemplate}
        onCancel={handleCancel}
        isLoading={updateTemplate.isPending}
      />
    </ContractsDashboardShell>
  )
}