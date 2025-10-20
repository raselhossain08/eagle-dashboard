'use client'

import React, { useState } from 'react'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { TemplatesTable } from '@/components/contracts/templates-table'
import { TemplateEditor } from '@/components/contracts/template-editor'
import { useTemplates } from '@/hooks/use-templates'
import { Button } from '@/components/ui/button'
import { Plus, Download, Upload } from 'lucide-react'
import { ContractTemplate, CreateTemplateDto, UpdateTemplateDto } from '@/lib/types/contracts'

export default function TemplatesManagementPage() {
  const [showEditor, setShowEditor] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate>()

  const { data: templatesResponse, isLoading } = useTemplates({
    page: 1,
    limit: 50,
  })

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'Templates' }
  ]

  const handleCreateTemplate = () => {
    setEditingTemplate(undefined)
    setShowEditor(true)
  }

  const handleEditTemplate = (template: ContractTemplate) => {
    setEditingTemplate(template)
    setShowEditor(true)
  }

  const handleSaveTemplate = async (data: CreateTemplateDto | UpdateTemplateDto) => {
    try {
      // Save template logic will be handled in the TemplateEditor component
      console.log('Saving template:', data)
      setShowEditor(false)
      setEditingTemplate(undefined)
    } catch (error) {
      console.error('Failed to save template:', error)
    }
  }

  const handlePreviewTemplate = (content: string, variables: Record<string, any>) => {
    // Implement template preview logic
    console.log('Preview template:', { content, variables })
  }

  const actions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <Upload className="h-4 w-4 mr-2" />
        Import
      </Button>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
      <Button onClick={handleCreateTemplate}>
        <Plus className="h-4 w-4 mr-2" />
        New Template
      </Button>
    </div>
  )

  return (
    <>
      <ContractsDashboardShell
        title="Contract Templates"
        description="Create and manage contract templates with dynamic variables"
        breadcrumbs={breadcrumbs}
        actions={actions}
      >
        <TemplatesTable
          data={templatesResponse?.data || []}
          onEdit={handleEditTemplate}
          onDelete={(id) => console.log('Delete template:', id)}
          isLoading={isLoading}
        />
      </ContractsDashboardShell>

      {/* Template Editor Dialog */}
      {showEditor && (
        <TemplateEditor
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onPreview={handlePreviewTemplate}
          onCancel={() => {
            setShowEditor(false)
            setEditingTemplate(undefined)
          }}
        />
      )}
    </>
  )
}