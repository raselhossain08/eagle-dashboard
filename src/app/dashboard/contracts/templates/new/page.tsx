'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { TemplateEditor } from '@/components/contracts/template-editor'
import { useCreateTemplate } from '@/hooks/use-templates'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CreateTemplateDto } from '@/lib/types/contracts'
import { toast } from 'sonner'

export default function NewTemplatePage() {
  const router = useRouter()
  const createTemplate = useCreateTemplate()

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'Templates', href: '/dashboard/contracts/templates' },
    { label: 'New Template' }
  ]

  const handleSaveTemplate = async (data: CreateTemplateDto) => {
    try {
      // Ensure the type is one of the valid enum values from the backend
      const validTypes = ['subscription', 'service', 'nda', 'standard', 'custom']
      const validType = validTypes.includes(data.type) ? data.type : 'standard'

      // Create the payload with all required fields
      const payload: CreateTemplateDto = {
        name: data.name,
        content: data.content,
        type: validType,
        version: data.version || '1.0',
        // Include optional fields if they have values
        ...(data.locale && { locale: data.locale }),
        ...(data.variables && data.variables.length > 0 && { variables: data.variables }),
        ...(data.termsVersion && { termsVersion: data.termsVersion }),
        ...(data.privacyVersion && { privacyVersion: data.privacyVersion }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      }

      console.log('Sending template payload:', payload)
      const result = await createTemplate.mutateAsync(payload)
      toast.success('Template created successfully')
      router.push('/dashboard/contracts/templates')
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create template'
      toast.error(errorMessage)
      console.error('Template creation failed:', error)
      
      // Try to parse the error response if available
      try {
        if (typeof error === 'string' && error.includes('{')) {
          const errorData = JSON.parse(error.split('Failed to create template: ')[1])
          console.error('Parsed error data:', errorData)
        }
      } catch (parseError) {
        console.error('Could not parse error:', parseError)
      }
    }
  }

  const handlePreviewTemplate = (content: string, variables: Record<string, any>) => {
    // Implement preview logic
    console.log('Preview:', { content, variables })
  }

  const handleCancel = () => {
    router.push('/dashboard/contracts/templates')
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
        onCancel={handleCancel}
        isLoading={createTemplate.isPending}
      />
    </ContractsDashboardShell>
  )
}