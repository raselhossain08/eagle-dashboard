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
  const { data: template, isLoading: templateLoading, error: templateError } = useTemplate(templateId)
  const updateTemplate = useUpdateTemplate()
  const [isNavigating, setIsNavigating] = React.useState(false)

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'Templates', href: '/dashboard/contracts/templates' },
    { label: template?.name || 'Edit Template' }
  ]

  const handleSaveTemplate = async (data: CreateTemplateDto | UpdateTemplateDto) => {
    try {
      toast.info('Updating template...', { duration: 1000 })

      // Validate template content
      if (!data.name?.trim()) {
        throw new Error('Template name is required')
      }
      
      if (!data.content?.trim()) {
        throw new Error('Template content is required')
      }

      // Ensure the type is valid
      const validTypes = ['subscription', 'service', 'nda', 'standard', 'custom']
      const validType = validTypes.includes(data.type) ? data.type : 'standard'

      // Prepare update data with proper validation
      const updateData: UpdateTemplateDto = {
        id: templateId,
        name: data.name.trim(),
        content: data.content.trim(),
        type: validType,
        version: data.version || template?.version || '1.0',
        locale: data.locale || template?.locale || 'en-US',
        variables: data.variables || [],
        termsVersion: data.termsVersion || template?.termsVersion || '1.0',
        privacyVersion: data.privacyVersion || template?.privacyVersion || '1.0',
        isActive: data.isActive !== false,
        isDefault: data.isDefault || false,
        ...(data.supportedLocales && { supportedLocales: data.supportedLocales }),
        ...(data.applicablePlans && { applicablePlans: data.applicablePlans }),
        ...(data.metadata && { metadata: data.metadata }),
      }

      console.log('Updating template with data:', updateData)
      
      const result = await updateTemplate.mutateAsync({ 
        id: templateId, 
        data: updateData 
      })
      
      toast.success(`Template "${updateData.name}" updated successfully!`)
      
      // Set navigation state and redirect
      setIsNavigating(true)
      setTimeout(() => {
        router.push('/dashboard/contracts/templates')
      }, 1000)
      
    } catch (error: any) {
      console.error('Template update failed:', error)
      
      // Extract meaningful error message
      let errorMessage = 'Failed to update template'
      
      if (error?.message) {
        if (error.message.includes('Failed to update template:')) {
          try {
            const errorData = JSON.parse(error.message.split('Failed to update template: ')[1])
            if (errorData.message) {
              errorMessage = `Update failed: ${errorData.message}`
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
      if (errorMessage.includes('not found')) {
        errorMessage = 'Template not found or may have been deleted'
      } else if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
        errorMessage = 'A template with this name already exists'
      } else if (errorMessage.includes('validation')) {
        errorMessage = 'Please check all required fields'
      } else if (errorMessage.includes('unauthorized') || errorMessage.includes('permission')) {
        errorMessage = 'You do not have permission to update this template'
      }
      
      toast.error(errorMessage, { duration: 5000 })
    }
  }

  const handlePreviewTemplate = (content: string, variables: Record<string, any>) => {
    try {
      // Render template with sample data or existing values
      let previewContent = content
      
      // Use template variables as base and merge with preview variables
      const allVariables = { ...variables }
      
      // Add default values from template variables if available
      if (template?.variables) {
        template.variables.forEach((templateVar: any) => {
          if (!allVariables[templateVar.name]) {
            allVariables[templateVar.name] = templateVar.defaultValue || `[${templateVar.name.toUpperCase()}]`
          }
        })
      }
      
      // Replace variables with actual or sample values for preview
      Object.entries(allVariables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`
        const previewValue = value || `[${key.toUpperCase()}]`
        previewContent = previewContent.replace(new RegExp(placeholder, 'g'), previewValue)
      })
      
      // Create preview window with better styling
      const previewWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes')
      
      if (previewWindow) {
        previewWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Template Preview - ${template?.name || 'Contract Template'}</title>
            <style>
              body { 
                font-family: 'Segoe UI', Arial, sans-serif; 
                padding: 0; 
                margin: 0;
                line-height: 1.6; 
              }
              .preview-header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px; 
                margin-bottom: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .preview-header h2 { margin: 0 0 5px 0; }
              .preview-header p { margin: 0; opacity: 0.9; }
              .preview-content { 
                padding: 0 30px 30px 30px;
                white-space: pre-wrap; 
                font-size: 14px;
                color: #333;
              }
              .print-button {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 20px;
                background: #28a745;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                z-index: 1000;
              }
              .print-button:hover { background: #218838; }
              @media print {
                .preview-header, .print-button { display: none; }
                .preview-content { padding: 0; }
              }
            </style>
          </head>
          <body>
            <button class="print-button" onclick="window.print()">Print Preview</button>
            <div class="preview-header">
              <h2>Template Preview</h2>
              <p><strong>Template:</strong> ${template?.name || 'Untitled'} | <strong>Type:</strong> ${template?.type || 'standard'} | <em>Preview with sample data</em></p>
            </div>
            <div class="preview-content">${previewContent.replace(/\n/g, '<br>')}</div>
          </body>
          </html>
        `)
        previewWindow.document.close()
        
        toast.success('Template preview opened in new window')
      } else {
        toast.error('Unable to open preview window. Please allow pop-ups for this site.')
      }
      
    } catch (error) {
      console.error('Preview failed:', error)
      toast.error('Failed to generate template preview')
    }
  }

  const handleCancel = () => {
    // Show confirmation if form might have been modified
    const shouldLeave = confirm('Any unsaved changes will be lost. Are you sure you want to cancel?')
    
    if (shouldLeave) {
      setIsNavigating(true)
      router.push('/dashboard/contracts/templates')
    }
  }

  if (templateLoading) {
    return (
      <ContractsDashboardShell
        title="Loading Template..."
        description="Please wait while we fetch the template details"
        breadcrumbs={breadcrumbs}
      >
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Loading template...</p>
            <p className="text-xs text-muted-foreground mt-1">This usually takes just a moment</p>
          </div>
        </div>
      </ContractsDashboardShell>
    )
  }

  if (!template) {
    return (
      <ContractsDashboardShell
        title="Template Not Found"
        description="The requested template could not be found"
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
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <svg 
              className="w-12 h-12 text-muted-foreground" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Template Not Found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            The template you're looking for doesn't exist or may have been deleted. 
            Please check the URL or return to the templates list.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href="/dashboard/contracts/templates">
                View All Templates
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/contracts/templates/new">
                Create New Template
              </Link>
            </Button>
          </div>
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
        isLoading={updateTemplate.isPending || isNavigating}
      />
      
      {/* Loading overlay for navigation */}
      {isNavigating && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg border flex items-center space-x-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <div>
              <p className="font-medium">Template Updated!</p>
              <p className="text-sm text-muted-foreground">Redirecting to templates...</p>
            </div>
          </div>
        </div>
      )}
    </ContractsDashboardShell>
  )
}