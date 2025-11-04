'use client'

import { useState, useEffect } from 'react'
import * as React from 'react'
import Link from 'next/link'
import { ContractsTable } from '@/components/contracts/contracts-table'
import { 
  Plus, 
  Download, 
  Filter, 
  Search, 
  Eye, 
  Send, 
  FileX, 
  Edit, 
  Loader2,
  RefreshCw,
  ChevronDown,
  MoreVertical,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

// Use shared types from the project
import { Contract as ContractType, ContractFilters as ContractFiltersType, ContractStatus as ContractStatusEnum } from '@/lib/types/contracts'
import { PaginationState } from '@/types/contracts'

type Contract = ContractType
type ContractFilters = ContractFiltersType
const ContractStatus = ContractStatusEnum

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Toast notification utility
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message),
  info: (message: string) => console.info('ℹ️', message),
  warning: (message: string) => console.warn('⚠️', message)
}

// Professional API Functions (Replace with real API calls)
const fetchContracts = async (params: {
  page?: number
  limit?: number
  status?: string
  search?: string
  userId?: string
  templateId?: string
}): Promise<ApiResponse<{ data: Contract[] }>> => {
  try {
    const qp = new URLSearchParams()
    if (params.page) qp.set('page', String(params.page))
    if (params.limit) qp.set('limit', String(params.limit))
    if (params.status) qp.set('status', params.status)
    if (params.search) qp.set('search', params.search)
    if (params.userId) qp.set('userId', params.userId)
    if (params.templateId) qp.set('templateId', params.templateId)

    const res = await fetch(`/api/contracts?${qp.toString()}`, { method: 'GET' })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to fetch contracts')
    }

    const json = await res.json()
    // Expecting { data: Contract[], meta: { total, page, limit, totalPages } }
    const data: Contract[] = (json.data || []).map((c: any) => ({
      ...c,
      // Normalize date strings to Date objects if backend returns strings
      createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
      updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      expiresAt: c.expiresAt ? new Date(c.expiresAt) : undefined,
      sentAt: c.sentAt ? new Date(c.sentAt) : undefined,
      viewedAt: c.viewedAt ? new Date(c.viewedAt) : undefined,
      signedAt: c.signedAt ? new Date(c.signedAt) : undefined,
      voidedAt: c.voidedAt ? new Date(c.voidedAt) : undefined,
      contentHash: c.contentHash || ''
    }))

    return {
      success: true,
      data: { data },
      meta: json.meta || { total: data.length, page: params.page || 1, limit: params.limit || 20, totalPages: 1 }
    }
  } catch (error: any) {
    console.error('fetchContracts error', error)
    return { success: false, error: error?.message || 'Failed to fetch contracts' }
  }
}

const sendContract = async (contractId: string): Promise<ApiResponse<any>> => {
  try {
    const res = await fetch(`/api/contracts/${contractId}/send`, { method: 'POST' })
    const json = await res.json()
    if (!res.ok) throw new Error(json?.message || 'Failed to send contract')
    return { success: true, message: json?.message }
  } catch (error: any) {
    console.error('sendContract error', error)
    return { success: false, error: error?.message || 'Failed to send contract' }
  }
}

const voidContract = async (contractId: string, reason: string): Promise<ApiResponse<any>> => {
  try {
    const res = await fetch(`/api/contracts/${contractId}/void`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) })
    const json = await res.json()
    if (!res.ok) throw new Error(json?.message || 'Failed to void contract')
    return { success: true, message: json?.message }
  } catch (error: any) {
    console.error('voidContract error', error)
    return { success: false, error: error?.message || 'Failed to void contract' }
  }
}

const downloadContract = async (contractId: string): Promise<ApiResponse<any>> => {
  try {
    const res = await fetch(`/api/contracts/${contractId}/download`, { method: 'GET' })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to download contract')
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contract-${contractId}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    return { success: true, message: 'Contract downloaded' }
  } catch (error: any) {
    console.error('downloadContract error', error)
    return { success: false, error: error?.message || 'Failed to download contract' }
  }
}

// Mock UI Components
const Card = ({ children, className = "" }: any) => <div className={`border rounded-lg p-6 bg-white shadow-sm ${className}`}>{children}</div>
const CardHeader = ({ children }: any) => <div className="pb-4 border-b">{children}</div>
const CardTitle = ({ children, className = "" }: any) => <h3 className={`font-semibold text-lg ${className}`}>{children}</h3>
const CardDescription = ({ children }: any) => <p className="text-gray-600 text-sm mt-1">{children}</p>
const CardContent = ({ children }: any) => <div className="pt-4">{children}</div>

const Button = ({ children, variant = "default", size = "default", onClick, disabled, className = "", asChild }: any) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    ghost: "hover:bg-gray-100",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200"
  }
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8",
    icon: "h-10 w-10"
  }
  
  if (asChild && children?.type === Link) {
    return children
  }
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`${baseClasses} ${variants[variant as keyof typeof variants]} ${sizes[size as keyof typeof sizes]} ${className}`}
    >
      {children}
    </button>
  )
}

const Badge = ({ children, variant = "default", className = "" }: any) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    secondary: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800"
  }
  return (
    <span className={`inline-block px-2 py-1 text-xs rounded font-medium ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </span>
  )
}

const Input = ({ placeholder, value, onChange, className = "" }: any) => (
  <input 
    type="text" 
    placeholder={placeholder} 
    value={value} 
    onChange={(e) => onChange?.(e)} 
    className={`border rounded-md px-3 py-2 text-sm ${className}`} 
  />
)

const DropdownMenu = ({ children }: any) => <div className="relative inline-block text-left">{children}</div>
const DropdownMenuTrigger = ({ children, asChild }: any) => asChild ? children : <div>{children}</div>
const DropdownMenuContent = ({ children, align = "center", className = "" }: any) => (
  <div className={`absolute z-50 mt-2 w-56 bg-white rounded-md shadow-lg border ${align === 'end' ? 'right-0' : 'left-0'} ${className}`}>
    {children}
  </div>
)
const DropdownMenuItem = ({ children, onClick }: any) => (
  <div className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer" onClick={onClick}>
    {children}
  </div>
)
const DropdownMenuLabel = ({ children }: any) => (
  <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
    {children}
  </div>
)
const DropdownMenuSeparator = () => <hr className="border-gray-200" />
const DropdownMenuCheckboxItem = ({ children, checked, onCheckedChange }: any) => (
  <div className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer" onClick={() => onCheckedChange?.(!checked)}>
    <input type="checkbox" checked={checked} onChange={() => {}} className="mr-3" />
    {children}
  </div>
)

const Table = ({ children }: any) => <table className="w-full border-collapse">{children}</table>
const TableHeader = ({ children }: any) => <thead className="bg-gray-50">{children}</thead>
const TableBody = ({ children }: any) => <tbody>{children}</tbody>
const TableRow = ({ children, className = "" }: any) => <tr className={`border-b hover:bg-gray-50 ${className}`}>{children}</tr>
const TableHead = ({ children, className = "" }: any) => <th className={`px-4 py-3 text-left text-sm font-medium text-gray-700 ${className}`}>{children}</th>
const TableCell = ({ children, className = "" }: any) => <td className={`px-4 py-3 text-sm ${className}`}>{children}</td>

// Professional Dashboard Shell Component
const ContractsDashboardShell = ({ title, description, breadcrumbs, actions, children }: any) => (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-white border-b">
      <div className="container mx-auto px-6 py-4">
        <nav className="flex mb-4 text-sm">
          {breadcrumbs?.map((crumb: any, index: number) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="mx-2 text-gray-400">/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="text-blue-600 hover:underline">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-600">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {description && <p className="text-gray-600 mt-1">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
    
    <div className="container mx-auto px-6 py-6">
      {children}
    </div>
  </div>
)

export default function ContractsListPage() {
  // Professional State Management
  const [contracts, setContracts] = useState<Contract[]>([])
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0
  })
  const [contractsFilters, setContractsFilters] = useState<ContractFilters>({
    status: [],
    search: ''
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Action States
  const [actionStates, setActionStates] = useState<Record<string, boolean>>({})

  // Professional Data Fetching
  const loadContracts = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetchContracts({
        page: pagination.page,
        limit: pagination.limit,
        status: contractsFilters.status.length > 0 ? contractsFilters.status[0] : undefined,
        search: contractsFilters.search || undefined,
        userId: contractsFilters.userId,
        templateId: contractsFilters.templateId
      })

      if (response.success && response.data) {
        // response.data has shape { data: Contract[] }
        setContracts(response.data.data)
        if (response.meta) {
          setPagination(prev => ({
            ...prev,
            total: response.meta!.total
          }))
        }
      } else {
        throw new Error(response.error || 'Failed to fetch contracts')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contracts')
      console.error('Contracts loading error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on mount and when filters change
  useEffect(() => {
    loadContracts()
  }, [pagination.page, pagination.limit, contractsFilters])

  // Professional Refresh Function
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadContracts()
    setIsRefreshing(false)
    toast.success('Contracts refreshed')
  }

  // Professional Action Handlers
  const setActionState = (contractId: string, action: string, state: boolean) => {
    setActionStates(prev => ({
      ...prev,
      [`${contractId}-${action}`]: state
    }))
  }

  const getActionState = (contractId: string, action: string) => {
    return actionStates[`${contractId}-${action}`] || false
  }

  const handleFiltersChange = (filters: ContractFilters) => {
    setContractsFilters(filters)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePaginationChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleViewContract = (contract: Contract) => {
    window.location.href = `/dashboard/contracts/list/${contract.id}`
  }

  const handleSendContract = async (contractId: string) => {
    try {
      setActionState(contractId, 'send', true)
      const response = await sendContract(contractId)
      
      if (response.success) {
        toast.success('Contract sent successfully')
        // Update local contract status
        setContracts(prev => 
          prev.map(c => c.id === contractId ? { ...c, status: ContractStatus.SENT } : c)
        )
      } else {
        throw new Error(response.error || 'Failed to send contract')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send contract')
      console.error('Send contract error:', error)
    } finally {
      setActionState(contractId, 'send', false)
    }
  }

  const handleVoidContract = async (contractId: string, reason: string) => {
    try {
      setActionState(contractId, 'void', true)
      const response = await voidContract(contractId, reason)
      
      if (response.success) {
        toast.success('Contract voided successfully')
        // Update local contract status
        setContracts(prev => 
          prev.map(c => c.id === contractId ? { ...c, status: ContractStatus.VOIDED } : c)
        )
      } else {
        throw new Error(response.error || 'Failed to void contract')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to void contract')
      console.error('Void contract error:', error)
    } finally {
      setActionState(contractId, 'void', false)
    }
  }

  const handleDownloadContract = async (contractId: string) => {
    try {
      setActionState(contractId, 'download', true)
      const response = await downloadContract(contractId)
      
      if (response.success) {
        toast.success('Contract downloaded successfully')
      } else {
        throw new Error(response.error || 'Failed to download contract')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download contract')
      console.error('Download contract error:', error)
    } finally {
      setActionState(contractId, 'download', false)
    }
  }

  const handleExportContracts = async () => {
    try {
      const csvHeaders = ['ID', 'Title', 'Customer Name', 'Customer Email', 'Status', 'Created Date', 'Expires Date']
      const csvRows = contracts.map((contract: Contract) => [
        contract.id,
        contract.title,
        contract.user?.name || contract.recipientName || 'Unknown',
        contract.user?.email || contract.recipientEmail || '',
        contract.status,
        new Date(contract.createdAt).toLocaleDateString(),
        contract.expiresAt ? new Date(contract.expiresAt).toLocaleDateString() : ''
      ])

      const csvContent = [csvHeaders, ...csvRows]
        .map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(','))
        .join('\n')

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
      newStatuses = currentStatuses.filter((s: string) => s !== status)
    } else {
      newStatuses = [...currentStatuses, status]
    }
    
    setContractsFilters({ ...contractsFilters, status: newStatuses })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSearchChange = (search: string) => {
    setContractsFilters({ ...contractsFilters, search })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setContractsFilters({ status: [], search: '' })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const activeFilterCount = Object.values(contractsFilters).filter(
    value => value && (Array.isArray(value) ? value.length > 0 : value !== '')
  ).length

  // Status helpers
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case ContractStatus.SIGNED:
        return 'success'
      case ContractStatus.VOIDED:
      case ContractStatus.EXPIRED:
        return 'danger'
      case ContractStatus.SENT:
      case ContractStatus.VIEWED:
        return 'warning'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case ContractStatus.SIGNED:
        return CheckCircle
      case ContractStatus.VOIDED:
      case ContractStatus.EXPIRED:
        return XCircle
      case ContractStatus.SENT:
      case ContractStatus.VIEWED:
        return Clock
      default:
        return AlertTriangle
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'All Contracts' }
  ]

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
                onChange={(e: any) => handleSearchChange(e.target.value)}
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
            <p className="text-sm text-gray-600">{error}</p>
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
          data={contracts}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total
          }}
          filters={contractsFilters as any}
          onFiltersChange={handleFiltersChange}
          onPaginationChange={handlePaginationChange}
          onView={handleViewContract}
          onSend={handleSendContract}
          onVoid={handleVoidContract}
          onDownload={handleDownloadContract}
          isLoading={isLoading}
          isSending={Object.keys(actionStates).some(k => k.endsWith('-send') && actionStates[k])}
          isVoiding={Object.keys(actionStates).some(k => k.endsWith('-void') && actionStates[k])}
          isDownloading={Object.keys(actionStates).some(k => k.endsWith('-download') && actionStates[k])}
        />
      )}
    </ContractsDashboardShell>
  )
}