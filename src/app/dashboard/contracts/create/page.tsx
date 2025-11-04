'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Loader2, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Eye,
  Edit,
  Trash2,
  Copy
} from 'lucide-react'

// Professional Components (Mock implementations included below)

// Professional Types for Contract Creation
interface ContractTemplate {
  id: string
  name: string
  description: string
  content: string
  type: string
  category: string
  variables: TemplateVariable[]
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface TemplateVariable {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'textarea'
  required: boolean
  defaultValue?: string
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

interface Customer {
  id: string
  email: string
  firstName: string
  lastName: string
  company?: string
  phone?: string
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  updatedAt: string
}

interface CreateContractRequest {
  templateId: string
  customerId: string
  title: string
  description?: string
  variables: Record<string, any>
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  tags?: string[]
  notes?: string
}

interface ContractCreationStep {
  id: string
  title: string
  description: string
  completed: boolean
  current: boolean
}

// Professional API Response Types
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
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

// Mock Hooks and utilities
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}
const useLocalStorage = (key: string, initialValue: any) => {
  const [value, setValue] = useState(initialValue)
  return [value, setValue]
}
const usePagination = (totalItems: number, itemsPerPage: number) => ({
  currentPage: 1,
  totalPages: Math.ceil(totalItems / itemsPerPage),
  goToPage: () => {},
  nextPage: () => {},
  prevPage: () => {}
})
const validateContractData = (data: any) => ({ isValid: true, errors: {} })
const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
const exportToPDF = () => {}
const useContractTemplates = () => ({
  templates: [],
  loading: false,
  error: null,
  refetch: () => {}
})
const useCreateContract = () => ({
  createContract: async () => {},
  loading: false,
  error: null
})
const useCustomers = () => ({
  customers: [],
  loading: false,
  error: null,
  refetch: () => {}
})

// Simple Error Boundary Component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

// Mock UI Components for demonstration
const Card = ({ children, className = "" }: any) => <div className={`border rounded-lg p-4 ${className}`}>{children}</div>
const CardHeader = ({ children }: any) => <div className="pb-2">{children}</div>
const CardTitle = ({ children, className = "" }: any) => <h3 className={`font-semibold ${className}`}>{children}</h3>
const CardDescription = ({ children }: any) => <p className="text-gray-600 text-sm">{children}</p>
const CardContent = ({ children }: any) => <div>{children}</div>
const Button = ({ children, variant = "default", size = "default", onClick, disabled, className = "", asChild }: any) => {
  if (asChild && children?.type === Link) {
    return children
  }
  return <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded ${className}`}>{children}</button>
}
const Badge = ({ children, variant = "default", className = "" }: any) => (
  <span className={`inline-block px-2 py-1 text-xs rounded ${className}`}>{children}</span>
)
const Input = ({ placeholder, value, onChange, className = "" }: any) => (
  <input 
    type="text" 
    placeholder={placeholder} 
    value={value} 
    onChange={(e) => onChange?.(e.target.value)} 
    className={`border rounded px-3 py-2 ${className}`} 
  />
)
const NumberInput = ({ placeholder, value, onChange, className = "" }: any) => (
  <input 
    type="number" 
    placeholder={placeholder} 
    value={value} 
    onChange={(e) => onChange?.(e.target.value)} 
    className={`border rounded px-3 py-2 ${className}`} 
  />
)
const Select = ({ children, value, onValueChange }: any) => (
  <select value={value} onChange={(e) => onValueChange?.(e.target.value)}>{children}</select>
)
const SelectItem = ({ children, value }: any) => <option value={value}>{children}</option>
const SelectContent = ({ children }: any) => <>{children}</>
const SelectTrigger = ({ children, className = "" }: any) => <div className={className}>{children}</div>
const SelectValue = ({ placeholder }: any) => <span>{placeholder}</span>
const Textarea = ({ placeholder, value, onChange, rows = 4, className = "" }: any) => (
  <textarea 
    placeholder={placeholder} 
    value={value} 
    onChange={(e) => onChange?.(e.target.value)} 
    rows={rows}
    className={`border rounded px-3 py-2 w-full ${className}`} 
  />
)
const Label = ({ children, htmlFor }: any) => <label htmlFor={htmlFor} className="block text-sm font-medium mb-1">{children}</label>
const Switch = ({ checked, onCheckedChange, id }: any) => (
  <input type="checkbox" id={id} checked={checked} onChange={(e) => onCheckedChange?.(e.target.checked)} />
)
const Skeleton = ({ className = "" }: any) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
const Separator = ({ orientation = "horizontal", className = "" }: any) => (
  <div className={`${orientation === 'vertical' ? 'w-px h-6 bg-gray-300' : 'h-px w-full bg-gray-300'} ${className}`}></div>
)
const Tabs = ({ children, value, onValueChange }: any) => (
  <div data-value={value} data-onchange={onValueChange}>{children}</div>
)
const TabsList = ({ children, className = "" }: any) => <div className={`flex border-b ${className}`}>{children}</div>
const TabsTrigger = ({ children, value, onClick }: any) => (
  <button onClick={() => onClick?.(value)} className="px-4 py-2 border-b-2">{children}</button>
)
const TabsContent = ({ children, value }: any) => <div data-value={value}>{children}</div>
const Progress = ({ value, className = "" }: any) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${value}%` }}></div>
  </div>
)
const Dialog = ({ children, open, onOpenChange }: any) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => onOpenChange?.(false)}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
const DialogContent = ({ children }: any) => <>{children}</>
const DialogHeader = ({ children }: any) => <div className="mb-4">{children}</div>
const DialogTitle = ({ children }: any) => <h2 className="text-lg font-semibold">{children}</h2>
const DialogDescription = ({ children }: any) => <p className="text-gray-600 text-sm">{children}</p>
const DialogFooter = ({ children }: any) => <div className="flex gap-2 justify-end mt-4">{children}</div>
const Form = ({ children, onSubmit }: any) => <form onSubmit={onSubmit}>{children}</form>
const FormField = ({ children }: any) => <div className="mb-4">{children}</div>
const FormItem = ({ children }: any) => <div>{children}</div>
const FormLabel = ({ children }: any) => <label className="block text-sm font-medium mb-1">{children}</label>
const FormControl = ({ children }: any) => <div>{children}</div>
const FormMessage = ({ children }: any) => <p className="text-red-500 text-sm mt-1">{children}</p>
const FormDescription = ({ children }: any) => <p className="text-gray-500 text-sm mt-1">{children}</p>

// Professional Contract Creation Mock API Functions
const fetchTemplates = async (): Promise<ApiResponse<ContractTemplate[]>> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    success: true,
    data: [
      {
        id: '1',
        name: 'Service Agreement',
        description: 'Standard service agreement template for client engagements',
        content: `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into on {{contract_date}} between {{company_name}} ("Provider") and {{client_name}} ("Client").

SERVICES:
The Provider agrees to provide the following services:
{{services_description}}

TERMS:
- Duration: {{contract_duration}}
- Payment Terms: {{payment_terms}}
- Rate: {{service_rate}}

RESPONSIBILITIES:
Provider Responsibilities:
{{provider_responsibilities}}

Client Responsibilities:
{{client_responsibilities}}

PAYMENT:
Total Contract Value: {{total_amount}}
Payment Schedule: {{payment_schedule}}
Late Payment Fee: {{late_fee}}

By signing below, both parties agree to the terms and conditions set forth in this Agreement.

Provider Signature: ___________________ Date: ___________
{{provider_signature}}

Client Signature: ___________________ Date: ___________
{{client_signature}}`,
        type: 'service',
        category: 'business',
        variables: [
          { id: 'v1', name: 'contract_date', type: 'date', required: true },
          { id: 'v2', name: 'company_name', type: 'text', required: true },
          { id: 'v3', name: 'client_name', type: 'text', required: true },
          { id: 'v4', name: 'services_description', type: 'textarea', required: true },
          { id: 'v5', name: 'contract_duration', type: 'text', required: true },
          { id: 'v6', name: 'payment_terms', type: 'select', required: true, options: ['Net 15', 'Net 30', 'Net 45', 'Upon completion'] },
          { id: 'v7', name: 'service_rate', type: 'text', required: true },
          { id: 'v8', name: 'total_amount', type: 'number', required: true },
          { id: 'v9', name: 'provider_responsibilities', type: 'textarea', required: true },
          { id: 'v10', name: 'client_responsibilities', type: 'textarea', required: true },
          { id: 'v11', name: 'payment_schedule', type: 'textarea', required: true },
          { id: 'v12', name: 'late_fee', type: 'text', required: false, defaultValue: '2% per month' }
        ],
        isDefault: true,
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T15:30:00Z'
      },
      {
        id: '2',
        name: 'Employment Contract',
        description: 'Comprehensive employment agreement for new hires',
        content: `EMPLOYMENT AGREEMENT

This Employment Agreement is entered into between {{company_name}} and {{employee_name}}.

POSITION: {{job_title}}
DEPARTMENT: {{department}}
START DATE: {{start_date}}
EMPLOYMENT TYPE: {{employment_type}}

COMPENSATION:
Base Salary: {{base_salary}}
Bonus Structure: {{bonus_structure}}
Benefits: {{benefits_package}}

WORKING HOURS:
Standard Hours: {{working_hours}}
Location: {{work_location}}

CONFIDENTIALITY:
Employee agrees to maintain confidentiality of all proprietary information.

TERMINATION:
Notice Period: {{notice_period}}

Signatures:
Employer: ___________________ Date: ___________
Employee: ___________________ Date: ___________`,
        type: 'employment',
        category: 'hr',
        variables: [
          { id: 'e1', name: 'company_name', type: 'text', required: true },
          { id: 'e2', name: 'employee_name', type: 'text', required: true },
          { id: 'e3', name: 'job_title', type: 'text', required: true },
          { id: 'e4', name: 'department', type: 'text', required: true },
          { id: 'e5', name: 'start_date', type: 'date', required: true },
          { id: 'e6', name: 'employment_type', type: 'select', required: true, options: ['Full-time', 'Part-time', 'Contract', 'Internship'] },
          { id: 'e7', name: 'base_salary', type: 'number', required: true },
          { id: 'e8', name: 'bonus_structure', type: 'textarea', required: false },
          { id: 'e9', name: 'benefits_package', type: 'textarea', required: true },
          { id: 'e10', name: 'working_hours', type: 'text', required: true, defaultValue: '40 hours per week' },
          { id: 'e11', name: 'work_location', type: 'text', required: true },
          { id: 'e12', name: 'notice_period', type: 'select', required: true, options: ['2 weeks', '1 month', '2 months', '3 months'] }
        ],
        isDefault: false,
        isActive: true,
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: '2024-01-18T12:00:00Z'
      },
      {
        id: '3',
        name: 'NDA Agreement',
        description: 'Non-disclosure agreement for confidential information sharing',
        content: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("NDA") is entered into between {{disclosing_party}} and {{receiving_party}}.

PURPOSE: {{purpose_description}}

CONFIDENTIAL INFORMATION:
{{confidential_info_definition}}

OBLIGATIONS:
- Information must remain confidential for {{confidentiality_period}}
- Information cannot be disclosed to third parties
- Information must be returned upon request

EXCEPTIONS:
Information that is publicly available or independently developed is not covered.

TERM: This agreement remains in effect until {{agreement_end_date}}

Signatures:
Disclosing Party: ___________________ Date: ___________
Receiving Party: ___________________ Date: ___________`,
        type: 'nda',
        category: 'legal',
        variables: [
          { id: 'n1', name: 'disclosing_party', type: 'text', required: true },
          { id: 'n2', name: 'receiving_party', type: 'text', required: true },
          { id: 'n3', name: 'purpose_description', type: 'textarea', required: true },
          { id: 'n4', name: 'confidential_info_definition', type: 'textarea', required: true },
          { id: 'n5', name: 'confidentiality_period', type: 'select', required: true, options: ['1 year', '2 years', '3 years', '5 years', 'Indefinite'] },
          { id: 'n6', name: 'agreement_end_date', type: 'date', required: true }
        ],
        isDefault: false,
        isActive: true,
        createdAt: '2024-01-12T14:00:00Z',
        updatedAt: '2024-01-16T09:30:00Z'
      }
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 3,
      totalPages: 1
    }
  }
}

const fetchCustomers = async (): Promise<ApiResponse<Customer[]>> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800))
  
  return {
    success: true,
    data: [
      {
        id: '1',
        email: 'john.doe@techcorp.com',
        firstName: 'John',
        lastName: 'Doe',
        company: 'TechCorp Solutions',
        phone: '+1 (555) 123-4567',
        status: 'active',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-20T15:30:00Z'
      },
      {
        id: '2',
        email: 'sarah.smith@innovate.co',
        firstName: 'Sarah',
        lastName: 'Smith',
        company: 'Innovate Co.',
        phone: '+1 (555) 987-6543',
        status: 'active',
        createdAt: '2024-01-15T14:00:00Z',
        updatedAt: '2024-01-22T11:15:00Z'
      },
      {
        id: '3',
        email: 'mike.johnson@startupx.io',
        firstName: 'Mike',
        lastName: 'Johnson',
        company: 'StartupX',
        phone: '+1 (555) 456-7890',
        status: 'pending',
        createdAt: '2024-01-18T09:30:00Z',
        updatedAt: '2024-01-25T16:45:00Z'
      },
      {
        id: '4',
        email: 'emma.wilson@globaltech.com',
        firstName: 'Emma',
        lastName: 'Wilson',
        company: 'GlobalTech Industries',
        phone: '+1 (555) 321-0987',
        status: 'active',
        createdAt: '2024-01-12T13:20:00Z',
        updatedAt: '2024-01-19T10:00:00Z'
      },
      {
        id: '5',
        email: 'david.brown@consulting.pro',
        firstName: 'David',
        lastName: 'Brown',
        company: 'Brown Consulting',
        phone: '+1 (555) 654-3210',
        status: 'active',
        createdAt: '2024-01-20T11:45:00Z',
        updatedAt: '2024-01-26T14:20:00Z'
      }
    ],
    pagination: {
      page: 1,
      limit: 100,
      total: 5,
      totalPages: 1
    }
  }
}

const createContract = async (data: CreateContractRequest): Promise<ApiResponse<{ id: string; status: string }>> => {
  // Simulate API call with validation
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Simulate validation
  if (!data.templateId || !data.customerId || !data.title) {
    throw new Error('Missing required fields')
  }
  
  return {
    success: true,
    data: {
      id: `contract_${Date.now()}`,
      status: 'draft'
    },
    message: 'Contract created successfully'
  }
}

export default function CreateContractPage() {
  // Enhanced state management for professional contract creation
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null)
  const [showWizard, setShowWizard] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated'>('name')
  
  // Real API integration state
  const [templates, setTemplates] = useState<ContractTemplate[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true)
  const [templatesError, setTemplatesError] = useState<string | null>(null)
  const [customersError, setCustomersError] = useState<string | null>(null)
  
  const router = useRouter()

  // Professional breadcrumbs
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'Create Contract' }
  ]

  // Creation steps for wizard
  const creationSteps: ContractCreationStep[] = [
    {
      id: 'template',
      title: 'Select Template',
      description: 'Choose a contract template',
      completed: !!selectedTemplate,
      current: currentStep === 0
    },
    {
      id: 'details',
      title: 'Contract Details',
      description: 'Fill in contract information',
      completed: false,
      current: currentStep === 1
    },
    {
      id: 'variables',
      title: 'Template Variables',
      description: 'Complete template fields',
      completed: false,
      current: currentStep === 2
    },
    {
      id: 'review',
      title: 'Review & Create',
      description: 'Review and finalize contract',
      completed: false,
      current: currentStep === 3
    }
  ]

  // Load templates and customers on component mount
  useEffect(() => {
    loadTemplates()
    loadCustomers()
  }, [])

  const loadTemplates = async () => {
    try {
      setIsLoadingTemplates(true)
      setTemplatesError(null)
      const response = await fetchTemplates()
      if (response.success) {
        setTemplates(response.data)
      } else {
        setTemplatesError('Failed to load templates')
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      setTemplatesError('Failed to load templates')
      toast.error('Failed to load contract templates')
    } finally {
      setIsLoadingTemplates(false)
    }
  }

  const loadCustomers = async () => {
    try {
      setIsLoadingCustomers(true)
      setCustomersError(null)
      const response = await fetchCustomers()
      if (response.success) {
        setCustomers(response.data)
      } else {
        setCustomersError('Failed to load customers')
      }
    } catch (error) {
      console.error('Error loading customers:', error)
      setCustomersError('Failed to load customers')
      toast.error('Failed to load customers')
    } finally {
      setIsLoadingCustomers(false)
    }
  }

  // Professional template filtering and sorting
  const filteredTemplates = useMemo(() => {
    let filtered = templates.filter(template => template.isActive)
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }
    
    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        default:
          return 0
      }
    })
    
    return filtered
  }, [templates, searchQuery, selectedCategory, sortBy])

  // Get unique categories for filter dropdown
  const templateCategories = useMemo(() => {
    const categories = Array.from(new Set(templates.map(template => template.category)))
    return categories.map(category => ({
      value: category,
      label: category.charAt(0).toUpperCase() + category.slice(1)
    }))
  }, [templates])

  // Professional template selection handler
  const handleTemplateSelect = useCallback((template: ContractTemplate) => {
    setSelectedTemplate(template)
    setShowWizard(true)
    setCurrentStep(0)
    toast.info(`Selected template: ${template.name}`)
  }, [])

  // Professional contract creation handler
  const handleCreateContract = useCallback(async (contractData: CreateContractRequest) => {
    try {
      setIsCreating(true)
      
      // Validate contract data
      if (!contractData.templateId || !contractData.customerId || !contractData.title) {
        throw new Error('Please fill in all required fields')
      }
      
      // Create contract via API
      const response = await createContract(contractData)
      
      if (response.success) {
        toast.success('Contract created successfully!')
        setShowWizard(false)
        setSelectedTemplate(null)
        setCurrentStep(0)
        
        // Navigate to the new contract
        router.push(`/dashboard/contracts/list/${response.data.id}`)
      } else {
        throw new Error(response.message || 'Failed to create contract')
      }
    } catch (error: any) {
      console.error('Contract creation error:', error)
      toast.error(error.message || 'Failed to create contract. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }, [router])

  // Professional refresh handler
  const handleRefresh = useCallback(() => {
    loadTemplates()
    loadCustomers()
    toast.info('Refreshing data...')
  }, [])

  // Loading state
  const isLoading = isLoadingTemplates || isLoadingCustomers

  // Error state
  const hasError = templatesError || customersError

  // Professional actions for dashboard shell
  const actions = (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Search templates..."
        value={searchQuery}
        onChange={setSearchQuery}
        className="w-64"
      />
      
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {templateCategories.map(category => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={sortBy} onValueChange={(value: 'name' | 'created' | 'updated') => setSortBy(value)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="created">Created</SelectItem>
          <SelectItem value="updated">Updated</SelectItem>
        </SelectContent>
      </Select>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
      >
        {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
      
      <Separator orientation="vertical" className="h-6" />
      
      <Button asChild variant="outline">
        <Link href="/dashboard/contracts">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contracts
        </Link>
      </Button>
    </div>
  )

  // Professional loading state
  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Create Contract</h1>
              <p className="text-gray-600">Loading contract templates and customer data...</p>
            </div>
            {actions}
          </div>
          
          <div className="space-y-6">
            {/* Loading skeleton for template grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  // Professional error state
  if (hasError) {
    return (
      <ErrorBoundary>
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Create Contract</h1>
              <p className="text-gray-600">Create a new contract from template</p>
            </div>
            {actions}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Failed to Load Contract Data
              </CardTitle>
              <CardDescription>
                {templatesError || customersError || 'Unable to load required data for contract creation.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button onClick={handleRefresh} variant="default">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard/contracts">
                    Back to Contracts
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Create Contract</h1>
            <p className="text-gray-600">Create a new contract from template</p>
          </div>
          {actions}
        </div>
        
        <div className="space-y-6">
          {/* Template Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{templates.length}</div>
                <p className="text-xs text-muted-foreground">Available templates</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{templates.filter(t => t.isActive).length}</div>
                <p className="text-xs text-muted-foreground">Ready to use</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{templateCategories.length}</div>
                <p className="text-xs text-muted-foreground">Template categories</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customers.filter(c => c.status === 'active').length}</div>
                <p className="text-xs text-muted-foreground">Active customers</p>
              </CardContent>
            </Card>
          </div>

          {/* Template Selection */}
          {viewMode === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex gap-2">
                        {template.isDefault && (
                          <Badge variant="default" className="text-xs">
                            Default
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{template.variables.length} variables</span>
                      <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Contract Templates</CardTitle>
                <CardDescription>Select a template to create a new contract</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{template.name}</h3>
                          {template.isDefault && (
                            <Badge variant="default" className="text-xs">Default</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">{template.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {template.description}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground text-right">
                        <div>{template.variables.length} variables</div>
                        <div>{new Date(template.updatedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {filteredTemplates.length === 0 && !isLoading && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'No templates match your current filters. Try adjusting your search or category filter.'
                    : 'No contract templates are available. Create a template first to get started.'}
                </p>
                <div className="flex gap-2 justify-center">
                  {(searchQuery || selectedCategory !== 'all') && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('')
                        setSelectedCategory('all')
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                  <Button asChild>
                    <Link href="/dashboard/contracts/templates/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Professional Contract Creation Wizard */}
      {showWizard && selectedTemplate && (
        <ContractCreationWizardModal
          template={selectedTemplate}
          customers={customers.filter(c => c.status === 'active')}
          steps={creationSteps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onSubmit={handleCreateContract}
          onCancel={() => {
            setShowWizard(false)
            setSelectedTemplate(null)
            setCurrentStep(0)
          }}
          isLoading={isCreating}
        />
      )}
    </ErrorBoundary>
  )
}

// Professional Contract Creation Wizard Modal Component
interface ContractCreationWizardModalProps {
  template: ContractTemplate
  customers: Customer[]
  steps: ContractCreationStep[]
  currentStep: number
  onStepChange: (step: number) => void
  onSubmit: (data: CreateContractRequest) => void
  onCancel: () => void
  isLoading: boolean
}

function ContractCreationWizardModal({
  template,
  customers,
  steps,
  currentStep,
  onStepChange,
  onSubmit,
  onCancel,
  isLoading
}: ContractCreationWizardModalProps) {
  const [contractData, setContractData] = useState<Partial<CreateContractRequest>>({
    templateId: template.id,
    variables: {},
    priority: 'medium',
    tags: []
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    setContractData(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const { [field]: removed, ...rest } = prev
        return rest
      })
    }
  }

  // Handle variable changes
  const handleVariableChange = (variableId: string, value: any) => {
    setContractData(prev => ({
      ...prev,
      variables: {
        ...prev.variables,
        [variableId]: value
      }
    }))
    
    // Clear validation error
    if (validationErrors[`variable_${variableId}`]) {
      setValidationErrors(prev => {
        const { [`variable_${variableId}`]: removed, ...rest } = prev
        return rest
      })
    }
  }

  // Validate current step
  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {}
    
    switch (currentStep) {
      case 1: // Contract Details
        if (!contractData.title?.trim()) {
          errors.title = 'Contract title is required'
        }
        if (!contractData.customerId) {
          errors.customerId = 'Customer selection is required'
        }
        break
        
      case 2: // Template Variables
        template.variables.forEach(variable => {
          if (variable.required && !contractData.variables?.[variable.id]) {
            errors[`variable_${variable.id}`] = `${variable.name} is required`
          }
        })
        break
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle next step
  const handleNext = () => {
    if (validateCurrentStep()) {
      onStepChange(currentStep + 1)
    }
  }

  // Handle previous step
  const handlePrevious = () => {
    onStepChange(currentStep - 1)
  }

  // Handle form submission
  const handleSubmit = () => {
    if (validateCurrentStep()) {
      onSubmit(contractData as CreateContractRequest)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create Contract: {template.name}</DialogTitle>
          <DialogDescription>
            Follow the steps below to create your contract
          </DialogDescription>
        </DialogHeader>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step.completed
                    ? 'bg-green-500 text-white'
                    : step.current
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
              </div>
              <div className="ml-2">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-gray-300 mx-4"></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Template Selected</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>{template.variables.length} variables to complete</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Contract Details</h3>
              
              <FormField>
                <FormLabel htmlFor="title">Contract Title *</FormLabel>
                <Input
                  id="title"
                  placeholder="Enter contract title"
                  value={contractData.title || ''}
                  onChange={(value: string) => handleFieldChange('title', value)}
                  className={validationErrors.title ? 'border-red-500' : ''}
                />
                {validationErrors.title && (
                  <FormMessage>{validationErrors.title}</FormMessage>
                )}
              </FormField>
              
              <FormField>
                <FormLabel htmlFor="customer">Select Customer *</FormLabel>
                <Select
                  value={contractData.customerId || ''}
                  onValueChange={(value: string) => handleFieldChange('customerId', value)}
                >
                  <SelectTrigger className={validationErrors.customerId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName} ({customer.email})
                        {customer.company && ` - ${customer.company}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.customerId && (
                  <FormMessage>{validationErrors.customerId}</FormMessage>
                )}
              </FormField>
              
              <FormField>
                <FormLabel htmlFor="description">Description</FormLabel>
                <Textarea
                  id="description"
                  placeholder="Enter contract description (optional)"
                  value={contractData.description || ''}
                  onChange={(value: string) => handleFieldChange('description', value)}
                />
              </FormField>
              
              <FormField>
                <FormLabel htmlFor="priority">Priority</FormLabel>
                <Select
                  value={contractData.priority || 'medium'}
                  onValueChange={(value: string) => handleFieldChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Complete Template Variables</h3>
              
              {template.variables.map(variable => (
                <FormField key={variable.id}>
                  <FormLabel htmlFor={variable.id}>
                    {variable.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    {variable.required && ' *'}
                  </FormLabel>
                  
                  {variable.type === 'text' && (
                    <Input
                      id={variable.id}
                      placeholder={`Enter ${variable.name}`}
                      value={contractData.variables?.[variable.id] || variable.defaultValue || ''}
                      onChange={(value: string) => handleVariableChange(variable.id, value)}
                      className={validationErrors[`variable_${variable.id}`] ? 'border-red-500' : ''}
                    />
                  )}
                  
                  {variable.type === 'textarea' && (
                    <Textarea
                      id={variable.id}
                      placeholder={`Enter ${variable.name}`}
                      value={contractData.variables?.[variable.id] || variable.defaultValue || ''}
                      onChange={(value: string) => handleVariableChange(variable.id, value)}
                      className={validationErrors[`variable_${variable.id}`] ? 'border-red-500' : ''}
                    />
                  )}
                  
                  {variable.type === 'number' && (
                    <Input
                      id={variable.id}
                      type="number"
                      placeholder={`Enter ${variable.name}`}
                      value={contractData.variables?.[variable.id] || variable.defaultValue || ''}
                      onChange={(value: string) => handleVariableChange(variable.id, parseFloat(value) || 0)}
                      className={validationErrors[`variable_${variable.id}`] ? 'border-red-500' : ''}
                    />
                  )}
                  
                  {variable.type === 'date' && (
                    <Input
                      id={variable.id}
                      type="date"
                      value={contractData.variables?.[variable.id] || variable.defaultValue || ''}
                      onChange={(value: string) => handleVariableChange(variable.id, value)}
                      className={validationErrors[`variable_${variable.id}`] ? 'border-red-500' : ''}
                    />
                  )}
                  
                  {variable.type === 'select' && variable.options && (
                    <Select
                      value={contractData.variables?.[variable.id] || variable.defaultValue || ''}
                      onValueChange={(value: string) => handleVariableChange(variable.id, value)}
                    >
                      <SelectTrigger className={validationErrors[`variable_${variable.id}`] ? 'border-red-500' : ''}>
                        <SelectValue placeholder={`Select ${variable.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {variable.options.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {validationErrors[`variable_${variable.id}`] && (
                    <FormMessage>{validationErrors[`variable_${variable.id}`]}</FormMessage>
                  )}
                </FormField>
              ))}
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Review Contract Details</h3>
              
              <Card>
                <CardHeader>
                  <CardTitle>Contract Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Title:</label>
                      <p>{contractData.title}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Template:</label>
                      <p>{template.name}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Customer:</label>
                      <p>
                        {(() => {
                          const customer = customers.find(c => c.id === contractData.customerId)
                          return customer ? `${customer.firstName} ${customer.lastName} (${customer.email})` : 'Not selected'
                        })()}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Priority:</label>
                      <Badge variant="outline">
                        {contractData.priority ? contractData.priority.charAt(0).toUpperCase() + contractData.priority.slice(1) : 'N/A'}
                      </Badge>
                    </div>
                    
                    {contractData.description && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Description:</label>
                        <p>{contractData.description}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Template Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {template.variables.map(variable => (
                      <div key={variable.id} className="flex justify-between">
                        <span className="text-sm font-medium">
                          {variable.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                        </span>
                        <span className="text-sm">
                          {contractData.variables?.[variable.id] || variable.defaultValue || 'Not set'}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          
          {currentStep > 0 && (
            <Button variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Contract
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}