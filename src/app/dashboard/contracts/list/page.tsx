'use client'

import React, { useState } from 'react'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { ContractsTable } from '@/components/contracts/contracts-table'
import { useContracts, useSendContract, useVoidContract, useDownloadContract } from '@/hooks/use-contracts'
import { useContractsStore } from '@/store/contracts-store'
import { Button } from '@/components/ui/button'
import { Plus, Download, Filter, Search } from 'lucide-react'
import { ContractFilters, ContractStatus } from '@/lib/types/contracts'

// Define PaginationState locally since it's not exported from contracts types
interface PaginationState {
  page: number
  limit: number
  total: number
}
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ContractsListPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0
  })

  const { contractsFilters, setContractsFilters } = useContractsStore()

  const { data: contractsResponse, isLoading, error } = useContracts({
    page: pagination.page,
    limit: pagination.limit,
    status: contractsFilters.status.length > 0 ? contractsFilters.status[0] : undefined,
    userId: contractsFilters.userId,
    templateId: contractsFilters.templateId,
    search: contractsFilters.search,
  })

  const sendContractMutation = useSendContract()
  const voidContractMutation = useVoidContract()
  const downloadContractMutation = useDownloadContract()

  // Update pagination total when data changes
  React.useEffect(() => {
    if (contractsResponse?.meta) {
      setPagination((prev: PaginationState) => ({
        ...prev,
        total: contractsResponse.meta.total
      }))
    }
  }, [contractsResponse])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'All Contracts' }
  ]

  const handleFiltersChange = (filters: ContractFilters) => {
    setContractsFilters(filters)
    setPagination((prev: PaginationState) => ({ ...prev, page: 1 })) // Reset to first page
  }

  const handlePaginationChange = (newPage: number) => {
    setPagination((prev: PaginationState) => ({ ...prev, page: newPage }))
  }

  const handleViewContract = (contract: any) => {
    // Navigate to contract details
    window.location.href = `/dashboard/contracts/list/${contract.id}`
  }

  const handleSendContract = async (contractId: string) => {
    try {
      await sendContractMutation.mutateAsync(contractId)
      toast.success('Contract sent successfully')
    } catch (error) {
      console.error('Send contract error:', error)
      toast.error('Failed to send contract')
    }
  }

  const handleVoidContract = async (contractId: string, reason: string) => {
    try {
      await voidContractMutation.mutateAsync({ id: contractId, reason })
      toast.success('Contract voided successfully')
    } catch (error) {
      console.error('Void contract error:', error)
      toast.error('Failed to void contract')
    }
  }

  const handleDownloadContract = async (contractId: string) => {
    try {
      await downloadContractMutation.mutateAsync(contractId)
      toast.success('Contract download started')
    } catch (error) {
      console.error('Download contract error:', error)
      toast.error('Failed to download contract')
    }
  }

  const handleExportContracts = async () => {
    try {
      // Create CSV content
      const csvHeaders = ['ID', 'Title', 'Customer Name', 'Customer Email', 'Status', 'Created Date', 'Expires Date']
      const csvRows = contractsResponse?.data.map(contract => [
        contract.id,
        contract.title,
        contract.user?.name || contract.recipientName || 'Unknown',
        contract.user?.email || contract.recipientEmail || '',
        contract.status,
        new Date(contract.createdAt).toLocaleDateString(),
        contract.expiresAt ? new Date(contract.expiresAt).toLocaleDateString() : ''
      ]) || []

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `contracts-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Contracts exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export contracts')
    }
  }

  const handleStatusFilter = (status: string) => {
    const currentStatuses = contractsFilters.status || []
    let newStatuses: string[]
    
    if (currentStatuses.includes(status)) {
      newStatuses = currentStatuses.filter(s => s !== status)
    } else {
      newStatuses = [...currentStatuses, status]
    }
    
    setContractsFilters({ ...contractsFilters, status: newStatuses })
    setPagination((prev: PaginationState) => ({ ...prev, page: 1 }))
  }

  const handleSearchChange = (search: string) => {
    setContractsFilters({ ...contractsFilters, search })
    setPagination((prev: PaginationState) => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setContractsFilters({ status: [], search: '' })
    setPagination((prev: PaginationState) => ({ ...prev, page: 1 }))
  }

  const activeFilterCount = Object.values(contractsFilters).filter(
    value => value && (Array.isArray(value) ? value.length > 0 : value !== '')
  ).length

  return (
    <ContractsDashboardShell
      title="All Contracts"
      description="Manage and track all your contracts"
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contracts..."
                value={contractsFilters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.values(ContractStatus).map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={contractsFilters.status?.includes(status) || false}
                  onCheckedChange={() => handleStatusFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearFilters}>
                Clear all filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" onClick={handleExportContracts}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button asChild>
            <Link href="/dashboard/contracts/create">
              <Plus className="h-4 w-4 mr-2" />
              New Contract
            </Link>
          </Button>
        </div>
      }
    >
      {error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-destructive mb-2">Failed to load contracts</div>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'An unknown error occurred'}
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <ContractsTable
          data={contractsResponse?.data || []}
          pagination={{
            ...pagination,
            total: contractsResponse?.meta.total || 0
          }}
          filters={contractsFilters}
          onFiltersChange={handleFiltersChange}
          onPaginationChange={handlePaginationChange}
          onView={handleViewContract}
          onSend={handleSendContract}
          onVoid={handleVoidContract}
          onDownload={handleDownloadContract}
          isLoading={isLoading}
          isSending={sendContractMutation.isPending}
          isVoiding={voidContractMutation.isPending}
          isDownloading={downloadContractMutation.isPending}
        />
      )}
    </ContractsDashboardShell>
  )
}