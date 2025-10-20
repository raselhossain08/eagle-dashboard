'use client'

import React, { useState } from 'react'
import { ContractsDashboardShell } from '@/components/contracts/contracts-dashboard-shell'
import { ContractsTable } from '@/components/contracts/contracts-table'
import { useContracts } from '@/hooks/use-contracts'
import { useContractsStore } from '@/store/contracts-store'
import { Button } from '@/components/ui/button'
import { Plus, Download, Filter } from 'lucide-react'
import { ContractFilters, PaginationState } from '@/lib/types/contracts'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

export default function ContractsListPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0
  })

  const { contractsFilters, setContractsFilters } = useContractsStore()

  const { data: contractsResponse, isLoading } = useContracts({
    page: pagination.page,
    limit: pagination.limit,
    status: contractsFilters.status,
    customerId: contractsFilters.customerId,
    templateId: contractsFilters.templateId,
    search: contractsFilters.search,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'All Contracts' }
  ]

  const handleFiltersChange = (filters: ContractFilters) => {
    setContractsFilters(filters)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  const handleViewContract = (contract: any) => {
    // Navigate to contract details
    window.location.href = `/dashboard/contracts/list/${contract.id}`
  }

  const handleSendContract = async (contractId: string) => {
    // Implement send contract logic
    console.log('Send contract:', contractId)
  }

  const handleVoidContract = async (contractId: string, reason: string) => {
    // Implement void contract logic
    console.log('Void contract:', contractId, reason)
  }

  const handleDownloadContract = async (contractId: string) => {
    // Implement download contract logic
    console.log('Download contract:', contractId)
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
              <DropdownMenuLabel>Filter Contracts</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Add filter options here */}
              <DropdownMenuItem>
                Status: Draft
              </DropdownMenuItem>
              <DropdownMenuItem>
                Status: Sent
              </DropdownMenuItem>
              <DropdownMenuItem>
                Status: Signed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Contract
          </Button>
        </div>
      }
    >
      <ContractsTable
        data={contractsResponse?.data || []}
        pagination={{
          ...pagination,
          total: contractsResponse?.pagination.total || 0
        }}
        filters={contractsFilters}
        onFiltersChange={handleFiltersChange}
        onView={handleViewContract}
        onSend={handleSendContract}
        onVoid={handleVoidContract}
        onDownload={handleDownloadContract}
        isLoading={isLoading}
      />
    </ContractsDashboardShell>
  )
}