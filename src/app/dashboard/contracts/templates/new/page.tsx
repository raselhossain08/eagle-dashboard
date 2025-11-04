'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { TemplateEditor } from '@/components/contracts/template-editor'
import { useCreateTemplate } from '@/hooks/use-templates'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { CreateTemplateDto } from '@/lib/types/contracts'
import { toast } from 'sonner'

export default function NewTemplatePage() {
  const router = useRouter()
  const createTemplate = useCreateTemplate()
  const [isNavigating, setIsNavigating] = React.useState(false)

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'Templates', href: '/dashboard/contracts/templates' },
    { label: 'New Template' }
  ]

  const handleSaveTemplate = async (data: CreateTemplateDto) => {
    try {
      toast.info('Creating template...', { duration: 1000 })

      // Validate template content
      if (!data.name?.trim()) {
        throw new Error('Template name is required')
      }
      
      if (!data.content?.trim()) {
        throw new Error('Template content is required')
      }

      // Ensure the type is one of the valid enum values from the backend
      const validTypes = ['subscription', 'service', 'nda', 'standard', 'custom']
      const validType = validTypes.includes(data.type) ? data.type : 'standard'

      // Auto-generate version if not provided
      const templateVersion = data.version || '1.0'
      const termsVersion = data.termsVersion || '1.0'
      const privacyVersion = data.privacyVersion || '1.0'

      // Create the payload with all required fields and proper defaults
      const payload: CreateTemplateDto = {
        name: data.name.trim(),
        content: data.content.trim(),
        type: validType,
        version: templateVersion,
        locale: data.locale || 'en-US',
        variables: data.variables || [],
        termsVersion,
        privacyVersion,
        isActive: data.isActive !== false, // Default to true
        isDefault: data.isDefault || false,
        ...(data.supportedLocales && { supportedLocales: data.supportedLocales }),
        ...(data.applicablePlans && { applicablePlans: data.applicablePlans }),
        ...(data.metadata && { metadata: data.metadata }),
      }

      console.log('Creating template with payload:', payload)
      const result = await createTemplate.mutateAsync(payload)
      
      toast.success(`Template "${payload.name}" created successfully!`)
      
      // Set navigation state and redirect
      setIsNavigating(true)
      setTimeout(() => {
        router.push('/dashboard/contracts/templates')
      }, 1000)
      
    } catch (error: any) {
      console.error('Template creation failed:', error)
      
      // Extract meaningful error message
      let errorMessage = 'Failed to create template'
      
      if (error?.message) {
        if (error.message.includes('Failed to create template:')) {
          try {
            const errorData = JSON.parse(error.message.split('Failed to create template: ')[1])
            if (errorData.message) {
              errorMessage = `Creation failed: ${errorData.message}`
            } else if (Array.isArray(errorData.message)) {
              errorMessage = `Validation errors: ${errorData.message.join(', ')}`
            }
          } catch (parseError) {
            errorMessage = error.message
          }
        } else {
          errorMessage = error.message
        }
      }
      
      // Show specific error messages for common issues
      if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
        errorMessage = 'A template with this name already exists'
      } else if (errorMessage.includes('validation')) {
        errorMessage = 'Please check all required fields'
      } else if (errorMessage.includes('unauthorized') || errorMessage.includes('permission')) {
        errorMessage = 'You do not have permission to create templates'
      }
      
      toast.error(errorMessage, { duration: 5000 })
    }
  }

  const handlePreviewTemplate = (content: string, variables: Record<string, any>) => {
    try {
      // Render template with sample data
      let previewContent = content
      
      // Replace variables with sample values for preview
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`
        const sampleValue = value || `[${key.toUpperCase()}]`
        previewContent = previewContent.replace(new RegExp(placeholder, 'g'), sampleValue)
      })
      
      // Create preview window
      const previewWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes')
      
      if (previewWindow) {
        previewWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Template Preview</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              .preview-header { background: #f5f5f5; padding: 10px; margin-bottom: 20px; }
              .preview-content { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <div class="preview-header">
              <h2>Template Preview</h2>
              <p><em>This is a preview with sample data</em></p>
            </div>
            <div class="preview-content">${previewContent.replace(/\n/g, '<br>')}</div>
          </body>
          </html>
        `)
        previewWindow.document.close()
      } else {
        toast.error('Unable to open preview window. Please allow pop-ups.')
      }
      
    } catch (error) {
      console.error('Preview failed:', error)
      toast.error('Failed to generate preview')
    }
  }

  const handleCancel = () => {
    // Show confirmation if form has been modified
    const isFormModified = Object.keys(createTemplate.variables || {}).length > 0
    
    if (isFormModified) {
      const shouldLeave = confirm('You have unsaved changes. Are you sure you want to leave?')
      if (!shouldLeave) return
    }
    
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
        isLoading={createTemplate.isPending || isNavigating}
      />
      
      {/* Loading overlay for navigation */}
      {isNavigating && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg border flex items-center space-x-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <div>
              <p className="font-medium">Template Created!</p>
              <p className="text-sm text-muted-foreground">Redirecting to templates...</p>
            </div>
          </div>
        </div>
      )}
    </ContractsDashboardShell>
  )
}