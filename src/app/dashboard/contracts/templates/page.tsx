'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { TemplatesTable } from '@/components/contracts/templates-table'
import { useTemplates, useDeleteTemplate, useRenderTemplate } from '@/hooks/use-templates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Download, Upload, Search, Filter, FileText, AlertTriangle, Loader2 } from 'lucide-react'
import { ContractTemplate } from '@/lib/types/contracts'
import { toast } from 'sonner'

export default function TemplatesManagementPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State management
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [isExporting, setIsExporting] = useState(false)
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  
  const pageSize = 20

  // API hooks
  const { 
    data: templatesResponse, 
    isLoading, 
    error: templatesError,
    refetch: refetchTemplates 
  } = useTemplates({
    page: currentPage,
    limit: pageSize,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
  })

  const deleteTemplate = useDeleteTemplate()
  const renderTemplate = useRenderTemplate()

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

  // Filtered data based on search
  const filteredTemplates = useMemo(() => {
    if (!templatesResponse?.data) return []
    
    if (!search.trim()) return templatesResponse.data
    
    return templatesResponse.data.filter(template => 
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.type.toLowerCase().includes(search.toLowerCase()) ||
      template.content.toLowerCase().includes(search.toLowerCase())
    )
  }, [templatesResponse?.data, search])

  // Event handlers
  const handleDeleteTemplate = useCallback(async (id: string) => {
    const template = templatesResponse?.data.find(t => t.id === id)
    
    if (!template) {
      toast.error('Template not found')
      return
    }

    // Confirm deletion
    const shouldDelete = confirm(
      `Are you sure you want to delete "${template.name}"?\n\nThis action cannot be undone.`
    )
    
    if (!shouldDelete) return

    try {
      toast.info('Deleting template...', { duration: 1000 })
      
      await deleteTemplate.mutateAsync(id)
      
      toast.success(`Template "${template.name}" deleted successfully`)
      
      // Refetch templates to update the list
      refetchTemplates()
      
    } catch (error: any) {
      console.error('Delete failed:', error)
      
      let errorMessage = 'Failed to delete template'
      
      if (error?.message) {
        if (error.message.includes('Cannot delete default template')) {
          errorMessage = 'Cannot delete the default template. Please set another template as default first.'
        } else if (error.message.includes('Template is being used')) {
          errorMessage = 'Cannot delete template as it is currently being used in active contracts.'
        } else if (error.message.includes('unauthorized') || error.message.includes('permission')) {
          errorMessage = 'You do not have permission to delete this template.'
        } else {
          errorMessage = error.message
        }
      }
      
      toast.error(errorMessage, { duration: 5000 })
    }
  }, [deleteTemplate, templatesResponse?.data, refetchTemplates])

  const handleDuplicateTemplate = useCallback((template: ContractTemplate) => {
    // Navigate to new template page with template data for duplication
    const params = new URLSearchParams()
    params.set('duplicate', template.id)
    params.set('name', `${template.name} (Copy)`)
    
    router.push(`/dashboard/contracts/templates/new?${params.toString()}`)
    
    toast.info(`Duplicating template "${template.name}"...`)
  }, [router])

  const handlePreviewTemplate = useCallback(async (template: ContractTemplate) => {
    try {
      toast.info('Generating template preview...', { duration: 1000 })
      
      // Create sample variables for preview
      const sampleVariables: Record<string, any> = {}
      
      if (template.variables && template.variables.length > 0) {
        template.variables.forEach((variable: any) => {
          sampleVariables[variable.name] = variable.defaultValue || 
            (variable.name.toLowerCase().includes('name') ? 'John Doe' :
             variable.name.toLowerCase().includes('email') ? 'john@example.com' :
             variable.name.toLowerCase().includes('date') ? new Date().toLocaleDateString() :
             variable.name.toLowerCase().includes('amount') ? '$1,000.00' :
             `[${variable.name.toUpperCase()}]`)
        })
      }

      // Render template with sample data
      let previewContent = template.content
      
      Object.entries(sampleVariables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`
        previewContent = previewContent.replace(new RegExp(placeholder, 'g'), value)
      })
      
      // Open preview window with enhanced styling
      const previewWindow = window.open('', '_blank', 'width=1000,height=800,scrollbars=yes')
      
      if (previewWindow) {
        previewWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Template Preview - ${template.name}</title>
            <style>
              body { 
                font-family: 'Segoe UI', Arial, sans-serif; 
                margin: 0; padding: 0; background: #f8f9fa;
                line-height: 1.6; 
              }
              .preview-container {
                max-width: 800px; margin: 0 auto;
                background: white; min-height: 100vh;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
              }
              .preview-header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 20px; 
              }
              .preview-header h1 { margin: 0 0 5px 0; font-size: 1.5rem; }
              .preview-header p { margin: 0; opacity: 0.9; font-size: 0.9rem; }
              .preview-content { 
                padding: 40px; white-space: pre-wrap; 
                font-size: 14px; color: #333; line-height: 1.7;
              }
              .preview-actions {
                position: fixed; top: 20px; right: 20px;
                display: flex; gap: 10px; z-index: 1000;
              }
              .action-btn {
                padding: 8px 16px; border: none; border-radius: 6px;
                cursor: pointer; font-weight: 500; font-size: 14px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: all 0.2s;
              }
              .print-btn { background: #28a745; color: white; }
              .print-btn:hover { background: #218838; }
              .close-btn { background: #6c757d; color: white; }
              .close-btn:hover { background: #5a6268; }
              @media print {
                .preview-header, .preview-actions { display: none; }
                .preview-container { box-shadow: none; }
                .preview-content { padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="preview-actions">
              <button class="action-btn print-btn" onclick="window.print()">Print</button>
              <button class="action-btn close-btn" onclick="window.close()">Close</button>
            </div>
            
            <div class="preview-container">
              <div class="preview-header">
                <h1>${template.name}</h1>
                <p>Type: ${template.type} | Language: ${template.locale} | Variables: ${template.variables?.length || 0} | Preview with sample data</p>
              </div>
              <div class="preview-content">${previewContent.replace(/\n/g, '<br>')}</div>
            </div>
          </body>
          </html>
        `)
        previewWindow.document.close()
        
        toast.success('Template preview opened successfully')
      } else {
        toast.error('Unable to open preview window. Please allow pop-ups for this site.')
      }
      
    } catch (error: any) {
      console.error('Preview failed:', error)
      toast.error('Failed to generate template preview: ' + (error.message || 'Unknown error'))
    }
  }, [])

  // Bulk operations
  const handleExportTemplates = useCallback(async () => {
    try {
      setIsExporting(true)
      toast.info('Exporting templates...', { duration: 2000 })
      
      // Simulate export functionality
      const exportData = filteredTemplates.map(template => ({
        id: template.id,
        name: template.name,
        type: template.type,
        locale: template.locale,
        content: template.content,
        variables: template.variables,
        isActive: template.isActive,
        isDefault: template.isDefault,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      }))
      
      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `contract-templates-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success(`Exported ${exportData.length} templates successfully`)
      
    } catch (error: any) {
      console.error('Export failed:', error)
      toast.error('Failed to export templates: ' + (error.message || 'Unknown error'))
    } finally {
      setIsExporting(false)
    }
  }, [filteredTemplates])

  const handleImportTemplates = useCallback(() => {
    // Create file input for import
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      try {
        toast.info('Importing templates...', { duration: 2000 })
        
        const text = await file.text()
        const importedData = JSON.parse(text)
        
        if (!Array.isArray(importedData)) {
          throw new Error('Invalid file format. Expected an array of templates.')
        }
        
        // Simulate import process
        console.log('Importing templates:', importedData)
        
        toast.success(`Import simulation completed! Found ${importedData.length} templates.`)
        toast.info('Note: Actual import functionality would be implemented with backend API')
        
      } catch (error: any) {
        console.error('Import failed:', error)
        toast.error('Failed to import templates: ' + (error.message || 'Invalid file format'))
      }
    }
    
    input.click()
  }, [])

  // Search and filter handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setCurrentPage(1) // Reset to first page when searching
  }, [])

  const handleFilterChange = useCallback((type: string, value: string) => {
    if (type === 'type') {
      setTypeFilter(value)
    } else if (type === 'status') {
      setStatusFilter(value)
    }
    setCurrentPage(1) // Reset to first page when filtering
  }, [])

  const actions = (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleImportTemplates}
        disabled={isLoading}
      >
        <Upload className="h-4 w-4 mr-2" />
        Import
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExportTemplates}
        disabled={isExporting || isLoading || filteredTemplates.length === 0}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Export ({filteredTemplates.length})
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
      {/* Error State */}
      {templatesError && (
        <Alert className="mb-6" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load templates: {templatesError.message || 'Unknown error'}
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates by name, type, or content..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={(value) => handleFilterChange('type', value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="nda">NDA</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {(search || typeFilter !== 'all' || statusFilter !== 'all') && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearch('')
                setTypeFilter('all')
                setStatusFilter('all')
                setCurrentPage(1)
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Templates Count */}
      {!isLoading && (
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            {search ? (
              <>Showing {filteredTemplates.length} of {templatesResponse?.meta.total || 0} templates</>
            ) : (
              <>Total {templatesResponse?.meta.total || 0} templates</>
            )}
          </div>
          
          {templatesResponse?.data && templatesResponse.data.length > 0 && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{templatesResponse.data.filter(t => t.isActive).length} Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>{templatesResponse.data.filter(t => !t.isActive).length} Inactive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{templatesResponse.data.filter(t => t.isDefault).length} Default</span>
              </div>
            </div>
          )}
        </div>
      )}

      <TemplatesTable
        data={filteredTemplates}
        onEdit={handleEditTemplate}
        onDelete={handleDeleteTemplate}
        onDuplicate={handleDuplicateTemplate}
        onPreview={handlePreviewTemplate}
        isLoading={isLoading}
      />
      
      {/* Enhanced Pagination */}
      {templatesResponse?.meta && templatesResponse.meta.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, templatesResponse.meta.total)} of {templatesResponse.meta.total} templates
            {search && (
              <span className="ml-2 text-primary">
                (filtered from {templatesResponse.meta.total} total)
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage <= 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {(() => {
                const totalPages = templatesResponse.meta.totalPages
                const maxVisible = 5
                let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
                let endPage = Math.min(totalPages, startPage + maxVisible - 1)
                
                if (endPage - startPage + 1 < maxVisible) {
                  startPage = Math.max(1, endPage - maxVisible + 1)
                }
                
                const pages = []
                
                if (startPage > 1) {
                  pages.push(
                    <Button key={1} variant="outline" size="sm" onClick={() => setCurrentPage(1)}>
                      1
                    </Button>
                  )
                  if (startPage > 2) {
                    pages.push(<span key="dots1" className="px-2">...</span>)
                  }
                }
                
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant={currentPage === i ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i)}
                    >
                      {i}
                    </Button>
                  )
                }
                
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(<span key="dots2" className="px-2">...</span>)
                  }
                  pages.push(
                    <Button 
                      key={totalPages} 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  )
                }
                
                return pages
              })()}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= templatesResponse.meta.totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(templatesResponse.meta.totalPages)}
              disabled={currentPage >= templatesResponse.meta.totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredTemplates.length === 0 && !templatesError && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <FileText className="w-12 h-12 text-muted-foreground" />
          </div>
          
          {search || typeFilter !== 'all' || statusFilter !== 'all' ? (
            <>
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                No templates match your current search criteria. Try adjusting your filters or search terms.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearch('')
                    setTypeFilter('all')
                    setStatusFilter('all')
                    setCurrentPage(1)
                  }}
                >
                  Clear Filters
                </Button>
                <Button onClick={handleCreateTemplate}>
                  Create New Template
                </Button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get started by creating your first contract template. Templates help you quickly generate contracts with dynamic content.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={handleCreateTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Template
                </Button>
                <Button variant="outline" onClick={handleImportTemplates}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Templates
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </ContractsDashboardShell>
  )
}