'use client'

import { useState, useEffect } from 'react'
import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Download, 
  Send, 
  FileX, 
  Loader2, 
  Eye, 
  Edit, 
  Share,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  FileText,
  Calendar,
  DollarSign,
  Settings,
  MoreVertical,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Building
} from 'lucide-react'

// Professional Types for Contract Details
interface Contract {
  id: string
  title: string
  content: string
  status: ContractStatus
  templateId: string
  userId: string
  recipientEmail: string
  recipientName: string
  createdAt: string
  updatedAt: string
  signedAt?: string
  voidedAt?: string
  sentAt?: string
  variables?: Record<string, any>
  signatures?: Signature[]
  template?: {
    name: string
    category: string
    type: string
  }
  user?: {
    firstName: string
    lastName: string
    name: string
    email: string
  }
  value?: number
  expiresAt?: string
  priority: 'low' | 'medium' | 'high'
  tags?: string[]
  notes?: string
}

interface Customer {
  id: string
  email: string
  firstName: string
  lastName: string
  name: string
  status: 'active' | 'inactive' | 'pending'
  role: string
  createdAt: Date
  updatedAt: Date
  phone?: string
  company?: string
  address?: string
  avatar?: string
}

interface ContractTemplate {
  id: string
  name: string
  category: string
  content: string
  variables: TemplateVariable[]
  isDefault: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface TemplateVariable {
  name: string
  type: string
  required: boolean
  defaultValue?: any
}

interface Signature {
  id: string
  contractId: string
  userId: string
  signedAt?: string
  ipAddress?: string
  userAgent?: string
  status: 'pending' | 'signed' | 'declined'
}

interface EvidencePackage {
  id: string
  contractId: string
  documentHash: string
  auditTrail: AuditTrailEntry[]
  createdAt: string
}

interface AuditTrailEntry {
  id: string
  action: string
  timestamp: string
  ipAddress: string
  userAgent: string
  userId?: string
}

enum ContractStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  SIGNED = 'signed',
  COMPLETED = 'completed',
  VOIDED = 'voided',
  EXPIRED = 'expired'
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Toast notification utility
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message),
  info: (message: string) => console.info('ℹ️', message),
  warning: (message: string) => console.warn('⚠️', message)
}

// Professional API Functions (Replace with real API calls)
const fetchContractById = async (id: string): Promise<ApiResponse<Contract>> => {
  // Mock implementation - replace with real API call
  try {
    // const response = await fetch(`/api/contracts/${id}`)
    // const data = await response.json()
    const mockContract: Contract = {
      id,
      title: `Professional Contract #${id}`,
      content: 'This is a professional service agreement between the parties...',
      status: ContractStatus.SENT,
      templateId: 'template-1',
      userId: 'user-1',
      recipientEmail: 'client@example.com',
      recipientName: 'John Client',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
      value: 15000,
      priority: 'high',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      variables: {
        clientName: 'John Client',
        projectName: 'Website Development',
        amount: '$15,000',
        duration: '3 months'
      },
      tags: ['development', 'web', 'professional'],
      notes: 'High priority client project'
    }
    return { success: true, data: mockContract }
  } catch (error) {
    return { success: false, error: 'Failed to fetch contract' }
  }
}

const fetchCustomerById = async (id: string): Promise<ApiResponse<Customer>> => {
  try {
    const mockCustomer: Customer = {
      id,
      email: 'john.client@example.com',
      firstName: 'John',
      lastName: 'Client',
      name: 'John Client',
      status: 'active',
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date(),
      phone: '+1-234-567-8900',
      company: 'Client Corp Inc.',
      address: '123 Business St, City, State 12345'
    }
    return { success: true, data: mockCustomer }
  } catch (error) {
    return { success: false, error: 'Failed to fetch customer' }
  }
}

const fetchTemplateById = async (id: string): Promise<ApiResponse<ContractTemplate>> => {
  try {
    const mockTemplate: ContractTemplate = {
      id,
      name: 'Professional Service Agreement',
      category: 'service',
      content: 'Professional service agreement template...',
      variables: [
        { name: 'clientName', type: 'text', required: true },
        { name: 'projectName', type: 'text', required: true },
        { name: 'amount', type: 'currency', required: true },
        { name: 'duration', type: 'text', required: true }
      ],
      isDefault: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    return { success: true, data: mockTemplate }
  } catch (error) {
    return { success: false, error: 'Failed to fetch template' }
  }
}

const fetchSignatureById = async (id: string): Promise<ApiResponse<Signature>> => {
  try {
    const mockSignature: Signature = {
      id,
      contractId: 'contract-1',
      userId: 'user-1',
      status: 'pending',
      signedAt: undefined
    }
    return { success: true, data: mockSignature }
  } catch (error) {
    return { success: false, error: 'Failed to fetch signature' }
  }
}

const fetchEvidencePackage = async (contractId: string): Promise<ApiResponse<EvidencePackage>> => {
  try {
    const mockEvidence: EvidencePackage = {
      id: `evidence-${contractId}`,
      contractId,
      documentHash: 'abc123hash',
      auditTrail: [
        {
          id: '1',
          action: 'Contract Created',
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          userId: 'admin-1'
        }
      ],
      createdAt: new Date().toISOString()
    }
    return { success: true, data: mockEvidence }
  } catch (error) {
    return { success: false, error: 'Failed to fetch evidence package' }
  }
}

const sendContract = async (contractId: string): Promise<ApiResponse<any>> => {
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { success: true, message: 'Contract sent successfully' }
  } catch (error) {
    return { success: false, error: 'Failed to send contract' }
  }
}

const voidContract = async (contractId: string, reason: string): Promise<ApiResponse<any>> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { success: true, message: 'Contract voided successfully' }
  } catch (error) {
    return { success: false, error: 'Failed to void contract' }
  }
}

const downloadContract = async (contractId: string): Promise<ApiResponse<any>> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Mock PDF download
    const blob = new Blob(['Mock PDF content'], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contract-${contractId}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    return { success: true, message: 'Contract downloaded successfully' }
  } catch (error) {
    return { success: false, error: 'Failed to download contract' }
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
    destructive: "bg-red-600 text-white hover:bg-red-700"
  }
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3",
    lg: "h-11 px-8"
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

const Separator = ({ className = "" }: any) => <hr className={`border-gray-200 my-4 ${className}`} />

// Professional Dashboard Shell Component
const ContractsDashboardShell = ({ title, description, breadcrumbs, actions, children }: any) => (
  <div className="min-h-screen bg-gray-50">
    {/* Header */}
    <div className="bg-white border-b">
      <div className="container mx-auto px-6 py-4">
        {/* Breadcrumbs */}
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
        
        {/* Title and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {description && <p className="text-gray-600 mt-1">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
    
    {/* Content */}
    <div className="container mx-auto px-6 py-6">
      {children}
    </div>
  </div>
)

export default function ContractDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const contractId = params.id as string

  // Professional State Management
  const [contract, setContract] = useState<Contract | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [template, setTemplate] = useState<ContractTemplate | null>(null)
  const [signature, setSignature] = useState<Signature | null>(null)
  const [evidencePackage, setEvidencePackage] = useState<EvidencePackage | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Action States
  const [isSending, setIsSending] = useState(false)
  const [isVoiding, setIsVoiding] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Professional Data Fetching
  const loadContractData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch contract data
      const contractResponse = await fetchContractById(contractId)
      if (!contractResponse.success || !contractResponse.data) {
        throw new Error(contractResponse.error || 'Contract not found')
      }

      const contractData = contractResponse.data
      setContract(contractData)

      // Fetch related data in parallel
      const [customerResponse, templateResponse] = await Promise.all([
        fetchCustomerById(contractData.userId),
        fetchTemplateById(contractData.templateId)
      ])

      if (customerResponse.success && customerResponse.data) {
        setCustomer(customerResponse.data)
      }

      if (templateResponse.success && templateResponse.data) {
        setTemplate(templateResponse.data)
      }

      // Fetch signature and evidence if available
      const firstSignatureId = contractData.signatures?.[0]?.id
      if (firstSignatureId) {
        const signatureResponse = await fetchSignatureById(firstSignatureId)
        if (signatureResponse.success && signatureResponse.data) {
          setSignature(signatureResponse.data)
        }
      }

      const evidenceResponse = await fetchEvidencePackage(contractId)
      if (evidenceResponse.success && evidenceResponse.data) {
        setEvidencePackage(evidenceResponse.data)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contract data')
      console.error('Contract loading error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on mount and contractId change
  useEffect(() => {
    if (contractId) {
      loadContractData()
    }
  }, [contractId])

  // Professional Refresh Function
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadContractData()
    setIsRefreshing(false)
    toast.success('Contract data refreshed')
  }

  // Professional Action Handlers
  const handleSendContract = async () => {
    try {
      setIsSending(true)
      const response = await sendContract(contractId)
      
      if (response.success) {
        toast.success('Contract sent successfully')
        // Update contract status locally
        if (contract) {
          setContract({ ...contract, status: ContractStatus.SENT, sentAt: new Date().toISOString() })
        }
      } else {
        throw new Error(response.error || 'Failed to send contract')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send contract')
      console.error('Send contract error:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleVoidContract = async (reason: string) => {
    try {
      setIsVoiding(true)
      const response = await voidContract(contractId, reason)
      
      if (response.success) {
        toast.success('Contract voided successfully')
        // Update contract status locally
        if (contract) {
          setContract({ ...contract, status: ContractStatus.VOIDED, voidedAt: new Date().toISOString() })
        }
      } else {
        throw new Error(response.error || 'Failed to void contract')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to void contract')
      console.error('Void contract error:', error)
    } finally {
      setIsVoiding(false)
    }
  }

  const handleDownloadContract = async () => {
    try {
      setIsDownloading(true)
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
      setIsDownloading(false)
    }
  }

  const handleViewEvidence = () => {
    if (evidencePackage) {
      // Open evidence viewer or navigate to evidence page
      window.open(`/dashboard/contracts/${contractId}/evidence`, '_blank')
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'All Contracts', href: '/dashboard/contracts/list' },
    { label: contract?.title || 'Contract Details' }
  ]

  // Error State
  if (error) {
    return (
      <ContractsDashboardShell
        title="Error Loading Contract"
        description="There was an error loading the contract details"
        breadcrumbs={breadcrumbs}
      >
        <div className="text-center">
          <FileX className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Failed to load contract</h3>
          <p className="text-gray-600 mt-2">
            {error}
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/dashboard/contracts/list">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contracts
            </Link>
          </Button>
        </div>
      </ContractsDashboardShell>
    )
  }

  if (isLoading) {
    return (
      <ContractsDashboardShell
        title="Loading..."
        description="Loading contract details"
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="mt-2 text-muted-foreground">Loading contract details...</p>
          </div>
        </div>
      </ContractsDashboardShell>
    )
  }

  if (!contract) {
    return (
      <ContractsDashboardShell
        title="Contract Not Found"
        description="The requested contract could not be found"
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Contract not found</h3>
            <p className="text-muted-foreground mt-2">
              The contract you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/contracts/list">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Contracts
              </Link>
            </Button>
          </div>
        </div>
      </ContractsDashboardShell>
    )
  }



  // Create customer and template data if not available
  const customerData = customer || {
    id: contract?.userId || 'unknown',
    email: contract?.recipientEmail || contract?.user?.email || 'unknown@example.com',
    firstName: contract?.user?.firstName || contract?.recipientName?.split(' ')[0] || 'Unknown',
    lastName: contract?.user?.lastName || contract?.recipientName?.split(' ').slice(1).join(' ') || 'User',
    name: contract?.user?.name || contract?.recipientName || 'Unknown Customer',
    status: 'active' as const,
    role: 'customer',
    createdAt: new Date(),
    updatedAt: new Date(),
    phone: '+1-234-567-8900',
    company: 'Customer Company',
    address: '123 Customer St, City, State'
  }

  const templateData: ContractTemplate = template || {
    id: contract?.templateId || 'unknown',
    name: contract?.template?.name || 'Unknown Template',
    category: contract?.template?.category || 'standard',
    content: contract?.content || '',
    variables: contract?.variables ? Object.keys(contract.variables).map(key => ({
      name: key,
      type: 'string',
      required: false,
      defaultValue: contract.variables![key]
    })) : [],
    isDefault: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  // Status helpers
  const getStatusBadgeVariant = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.SIGNED:
      case ContractStatus.COMPLETED:
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

  const getStatusIcon = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.SIGNED:
      case ContractStatus.COMPLETED:
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

  return (
    <ContractsDashboardShell
      title={contract.title}
      description={`Contract ID: ${contract.id}`}
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleDownloadContract}
            disabled={isDownloading}
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </Button>
          
          {contract.status === ContractStatus.DRAFT && (
            <Button 
              onClick={handleSendContract}
              disabled={isSending}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSending ? 'Sending...' : 'Send Contract'}
            </Button>
          )}
          
          {contract.status !== ContractStatus.VOIDED && contract.status !== ContractStatus.SIGNED && (
            <Button 
              variant="destructive" 
              onClick={() => handleVoidContract('Manual void')}
              disabled={isVoiding}
            >
              <FileX className="h-4 w-4 mr-2" />
              {isVoiding ? 'Voiding...' : 'Void Contract'}
            </Button>
          )}
        </div>
      }
    >
      {/* Professional Contract Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Contract Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contract Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contract Overview</CardTitle>
                  <CardDescription>Basic contract information and status</CardDescription>
                </div>
                <Badge variant={getStatusBadgeVariant(contract.status)}>
                  {React.createElement(getStatusIcon(contract.status), { className: "h-3 w-3 mr-1" })}
                  {contract.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Contract Title</label>
                  <p className="text-sm">{contract.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Template</label>
                  <p className="text-sm">{templateData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created Date</label>
                  <p className="text-sm">{new Date(contract.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm">{new Date(contract.updatedAt).toLocaleDateString()}</p>
                </div>
                {contract.value && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contract Value</label>
                    <p className="text-sm font-medium text-green-600">${contract.value.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <Badge variant={contract.priority === 'high' ? 'danger' : contract.priority === 'medium' ? 'warning' : 'default'}>
                    {contract.priority?.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              {contract.tags && contract.tags.length > 0 && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">Tags</label>
                  <div className="flex gap-2 mt-1">
                    {contract.tags.map((tag, index) => (
                      <Badge key={index} variant="info">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {contract.notes && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded">{contract.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contract Variables */}
          {contract.variables && Object.keys(contract.variables).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Contract Variables</CardTitle>
                <CardDescription>Dynamic values used in this contract</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(contract.variables).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-sm font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                      <p className="text-sm">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contract Content Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Content</CardTitle>
              <CardDescription>Preview of the contract document</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap">{contract.content}</pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Customer & Activity */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm font-medium">{customerData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-blue-600">{customerData.email}</p>
                </div>
                {customerData.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-sm">{customerData.phone}</p>
                  </div>
                )}
                {customerData.company && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Company</label>
                    <p className="text-sm">{customerData.company}</p>
                  </div>
                )}
                {customerData.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-sm">{customerData.address}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge variant={customerData.status === 'active' ? 'success' : 'default'}>
                    {customerData.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contract Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-gray-500">{new Date(contract.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {contract.sentAt && (
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium">Sent</p>
                      <p className="text-gray-500">{new Date(contract.sentAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                
                {contract.signedAt && (
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium">Signed</p>
                      <p className="text-gray-500">{new Date(contract.signedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                
                {contract.voidedAt && (
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium">Voided</p>
                      <p className="text-gray-500">{new Date(contract.voidedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {contract.expiresAt && (
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium">Expires</p>
                      <p className="text-gray-500">{new Date(contract.expiresAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Signature Information */}
          {signature && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Signature Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <Badge variant={signature.status === 'signed' ? 'success' : signature.status === 'declined' ? 'danger' : 'warning'}>
                      {signature.status.toUpperCase()}
                    </Badge>
                  </div>
                  {signature.signedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Signed At</label>
                      <p className="text-sm">{new Date(signature.signedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evidence Package */}
          {evidencePackage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Evidence Package
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Document Hash</label>
                    <p className="text-sm font-mono text-gray-600">{evidencePackage.documentHash}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Audit Trail Entries</label>
                    <p className="text-sm">{evidencePackage.auditTrail.length} events recorded</p>
                  </div>
                  <Button variant="outline" onClick={handleViewEvidence} className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Evidence
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ContractsDashboardShell>
  )
}