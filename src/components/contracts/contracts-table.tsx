import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Contract, ContractFilters, PaginationState } from '@/lib/types/contracts'
import { 
  MoreHorizontal, 
  Eye, 
  Send, 
  Download, 
  FileX,
  Calendar,
  User
} from 'lucide-react'
import { format } from 'date-fns'

interface ContractsTableProps {
  data: Contract[]
  pagination: PaginationState
  filters: ContractFilters
  onFiltersChange: (filters: ContractFilters) => void
  onView: (contract: Contract) => void
  onSend: (contractId: string) => void
  onVoid: (contractId: string, reason: string) => void
  onDownload: (contractId: string) => void
  isLoading?: boolean
}

const statusConfig = {
  draft: { label: 'Draft', variant: 'secondary' as const },
  sent: { label: 'Sent', variant: 'outline' as const },
  viewed: { label: 'Viewed', variant: 'default' as const },
  signed: { label: 'Signed', variant: 'success' as const },
  declined: { label: 'Declined', variant: 'destructive' as const },
  expired: { label: 'Expired', variant: 'destructive' as const },
  void: { label: 'Void', variant: 'secondary' as const },
}

export function ContractsTable({
  data,
  pagination,
  filters,
  onFiltersChange,
  onView,
  onSend,
  onVoid,
  onDownload,
  isLoading = false
}: ContractsTableProps) {
  const getStatusBadge = (status: Contract['status']) => {
    const config = statusConfig[status]
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  const handlePageChange = (page: number) => {
    // Handle pagination change
    console.log('Page changed to:', page)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No contracts found
                </TableCell>
              </TableRow>
            ) : (
              data.map((contract) => (
                <TableRow key={contract.id} className="group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileX className="h-4 w-4 text-muted-foreground" />
                      {contract.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {contract.userId}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(contract.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(contract.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {contract.expiresAt ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(contract.expiresAt), 'MMM dd, yyyy')}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onView(contract)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        
                        {contract.status === 'draft' && (
                          <DropdownMenuItem onClick={() => onSend(contract.id)}>
                            <Send className="h-4 w-4 mr-2" />
                            Send Contract
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem onClick={() => onDownload(contract.id)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        {contract.status !== 'void' && contract.status !== 'signed' && (
                          <DropdownMenuItem 
                            onClick={() => onVoid(contract.id, 'Manual void')}
                            className="text-destructive"
                          >
                            <FileX className="h-4 w-4 mr-2" />
                            Void Contract
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  if (pagination.page > 1) handlePageChange(pagination.page - 1)
                }}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.ceil(pagination.total / pagination.limit) }, (_, i) => i + 1)
              .slice(0, 5)
              .map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === pagination.page}
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(page)
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))
            }
            
            <PaginationItem>
              <PaginationNext 
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (pagination.page < Math.ceil(pagination.total / pagination.limit)) {
                    handlePageChange(pagination.page + 1)
                  }
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}