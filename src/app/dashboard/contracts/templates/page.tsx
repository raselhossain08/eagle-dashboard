'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { TemplatesTable } from '@/components/contracts/templates-table'
import { useTemplates, useDeleteTemplate } from '@/hooks/use-templates'
import { Button } from '@/components/ui/button'
import { Plus, Download, Upload } from 'lucide-react'
import { ContractTemplate } from '@/lib/types/contracts'
import { toast } from 'sonner'

export default function TemplatesManagementPage() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const { data: templatesResponse, isLoading } = useTemplates({
    page: currentPage,
    limit: pageSize,
  })

  const deleteTemplate = useDeleteTemplate()

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'Templates' }
  ]

  const handleCreateTemplate = () => {
    router.push('/dashboard/contracts/templates/new')
  }

  const handleEditTemplate = (template: ContractTemplate) => {
    router.push(`/dashboard/contracts/templates/${template.id}`)
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteTemplate.mutateAsync(id)
      toast.success('Template deleted successfully')
    } catch (error) {
      toast.error('Failed to delete template')
      console.error('Delete failed:', error)
    }
  }

  const handleDuplicateTemplate = (template: ContractTemplate) => {
    // Navigate to new template page with template data for duplication
    router.push(`/dashboard/contracts/templates/new?duplicate=${template.id}`)
  }

  const handlePreviewTemplate = (template: ContractTemplate) => {
    // Open preview in a new tab or modal
    console.log('Preview template:', template)
    // Could implement a preview modal here
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
    <ContractsDashboardShell
      title="Contract Templates"
      description="Create and manage contract templates with dynamic variables"
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <TemplatesTable
        data={templatesResponse?.data || []}
        onEdit={handleEditTemplate}
        onDelete={handleDeleteTemplate}
        onDuplicate={handleDuplicateTemplate}
        onPreview={handlePreviewTemplate}
        isLoading={isLoading}
      />
      
      {/* Pagination */}
      {templatesResponse?.meta && templatesResponse.meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, templatesResponse.meta.total)} of {templatesResponse.meta.total} templates
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, templatesResponse.meta.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= templatesResponse.meta.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </ContractsDashboardShell>
  )
}