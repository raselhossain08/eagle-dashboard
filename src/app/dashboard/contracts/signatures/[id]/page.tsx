'use client'

import { useState, useEffect } from 'react'
import * as React from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Download, 
  CheckCircle, 
  Loader2, 
  AlertTriangle, 
  Shield, 
  FileCheck, 
  Calendar,
  User,
  Globe,
  Monitor,
  Clock,
  Eye,
  Copy,
  ExternalLink
} from 'lucide-react'

// Professional Types (based on project shared types)
interface Contract {
  id: string
  title: string
  content: string
  status: string
  templateId?: string
  userId: string
  recipientEmail: string
  recipientName: string
  subscriptionId?: string
  expiresAt?: Date
  sentAt?: Date
  viewedAt?: Date
  signedAt?: Date
  voidedAt?: Date
  voidReason?: string
  contentHash: string
  variables?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    name: string
    email: string
    firstName?: string
    lastName?: string
  }
  template?: {
    id: string
    name: string
    category: string
    type?: string
  }
}

interface Signature {
  id: string
  userId: string
  contractId: string
  fullName: string
  email: string
  company?: string
  title?: string
  signatureType: 'typed' | 'drawn' | 'uploaded'
  signatureData?: string
  signatureImage?: string
  consents: {
    terms: boolean
    privacy: boolean
    cancellation: boolean
    marketing?: boolean
    timestamp: Date
  }
  ipAddress: string
  userAgent: string
  deviceInfo?: string
  osInfo?: string
  browserInfo?: string
  approximateLocation?: string
  geolocation?: {
    latitude?: number
    longitude?: number
    accuracy?: number
    country?: string
    region?: string
    city?: string
  }
  selfieImage?: string
  documentImage?: string
  documentType?: string
  contentHash: string
  cryptographicSignature?: string
  certificateId?: string
  signedAt: Date
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

interface EvidencePackage {
  id: string
  contractId: string
  signatureId: string
  packageHash: string
  evidence: {
    signer: {
      id: string
      fullName: string
      email: string
      company?: string
    }
    contract: {
      id: string
      title: string
      contentHash: string
      templateVersion: string
    }
    signature: {
      type: string
      data?: string
      image?: string
      timestamp: Date
    }
    consents: Record<string, boolean>
    technical: {
      ipAddress: string
      userAgent: string
      deviceInfo?: string
      osInfo?: string
      browserInfo?: string
      location?: string
      geolocation?: any
    }
    legal: {
      termsVersion: string
      privacyVersion: string
      cancellationPolicyVersion?: string
    }
    kyc?: {
      selfieProvided: boolean
      documentProvided: boolean
      documentType?: string
    }
  }
  certificateGenerated: boolean
  certificateUrl?: string
  pdfUrl?: string
  zipUrl?: string
  metadata?: Record<string, any>
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}

// Professional API Response Types
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  timestamp: Date
  message: string
}

// Toast notification utility
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message),
  info: (message: string) => console.info('ℹ️', message),
  warning: (message: string) => console.warn('⚠️', message)
}

// Professional API Functions (Replace with real API calls)
const fetchSignatureById = async (id: string): Promise<ApiResponse<Signature>> => {
  try {
    const res = await fetch(`/api/signatures/${id}`, { method: 'GET' })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to fetch signature')
    }
    
    const json = await res.json()
    const signature: Signature = {
      ...json,
      // Normalize date fields if they come as strings
      signedAt: json.signedAt ? new Date(json.signedAt) : new Date(),
      createdAt: json.createdAt ? new Date(json.createdAt) : new Date(),
      updatedAt: json.updatedAt ? new Date(json.updatedAt) : new Date(),
      consents: {
        ...json.consents,
        timestamp: json.consents?.timestamp ? new Date(json.consents.timestamp) : new Date()
      }
    }
    
    return { success: true, data: signature }
  } catch (error: any) {
    console.error('fetchSignatureById error', error)
    return { success: false, error: error?.message || 'Failed to fetch signature' }
  }
}

const fetchEvidencePackageBySignature = async (signatureId: string): Promise<ApiResponse<EvidencePackage>> => {
  try {
    const res = await fetch(`/api/signatures/${signatureId}/evidence`, { method: 'GET' })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to fetch evidence package')
    }
    
    const json = await res.json()
    const evidencePackage: EvidencePackage = {
      ...json,
      // Normalize date fields
      createdAt: json.createdAt ? new Date(json.createdAt) : new Date(),
      updatedAt: json.updatedAt ? new Date(json.updatedAt) : new Date()
    }
    
    return { success: true, data: evidencePackage }
  } catch (error: any) {
    console.error('fetchEvidencePackageBySignature error', error)
    return { success: false, error: error?.message || 'Failed to fetch evidence package' }
  }
}

const fetchContractById = async (id: string): Promise<ApiResponse<Contract>> => {
  try {
    const res = await fetch(`/api/contracts/${id}`, { method: 'GET' })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to fetch contract')
    }
    
    const json = await res.json()
    const contract: Contract = {
      ...json,
      // Normalize date fields
      createdAt: json.createdAt ? new Date(json.createdAt) : new Date(),
      updatedAt: json.updatedAt ? new Date(json.updatedAt) : new Date(),
      expiresAt: json.expiresAt ? new Date(json.expiresAt) : undefined,
      sentAt: json.sentAt ? new Date(json.sentAt) : undefined,
      viewedAt: json.viewedAt ? new Date(json.viewedAt) : undefined,
      signedAt: json.signedAt ? new Date(json.signedAt) : undefined,
      voidedAt: json.voidedAt ? new Date(json.voidedAt) : undefined
    }
    
    return { success: true, data: contract }
  } catch (error: any) {
    console.error('fetchContractById error', error)
    return { success: false, error: error?.message || 'Failed to fetch contract' }
  }
}

const validateEvidencePackage = async (evidencePackageId: string): Promise<ValidationResult> => {
  try {
    const res = await fetch(`/api/evidence-packages/${evidencePackageId}/validate`, { method: 'POST' })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to validate evidence')
    }
    
    const json = await res.json()
    return {
      ...json,
      timestamp: json.timestamp ? new Date(json.timestamp) : new Date()
    }
  } catch (error: any) {
    console.error('validateEvidencePackage error', error)
    return {
      isValid: false,
      errors: [error?.message || 'Validation failed'],
      timestamp: new Date(),
      message: 'Failed to validate evidence package'
    }
  }
}

const exportEvidencePackage = async (evidencePackageId: string): Promise<ApiResponse<any>> => {
  try {
    const res = await fetch(`/api/evidence-packages/${evidencePackageId}/export`, { method: 'GET' })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to export evidence')
    }
    
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `evidence-package-${evidencePackageId}.zip`
    a.click()
    URL.revokeObjectURL(url)
    
    return { success: true, message: 'Evidence package exported successfully' }
  } catch (error: any) {
    console.error('exportEvidencePackage error', error)
    return { success: false, error: error?.message || 'Failed to export evidence package' }
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

const Alert = ({ children, className = "" }: any) => (
  <div className={`border rounded-md p-4 ${className}`}>
    {children}
  </div>
)

const AlertDescription = ({ children }: any) => (
  <div className="text-sm text-gray-600">
    {children}
  </div>
)

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

// Professional Signature Evidence Viewer Component
const SignatureEvidenceViewer = ({ signature, evidencePackage, onValidate, onExport }: any) => {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleValidate = async () => {
    setIsValidating(true)
    const result = await onValidate()
    setValidationResult(result)
    setIsValidating(false)
    
    if (result.isValid) {
      toast.success('Evidence package validation successful')
    } else {
      toast.error('Evidence package validation failed')
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    await onExport()
    setIsExporting(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Evidence Details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Signature Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Digital Signature Evidence
                </CardTitle>
                <CardDescription>Cryptographic proof and technical evidence</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleValidate}
                  disabled={isValidating}
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  {isValidating ? 'Validating...' : 'Validate'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Signer Name</label>
                <p className="text-sm">{signature.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-sm">{signature.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Signature Type</label>
                <p className="text-sm capitalize">{signature.signatureType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Signed Date</label>
                <p className="text-sm">{new Date(signature.signedAt).toLocaleString()}</p>
              </div>
              {signature.company && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Company</label>
                  <p className="text-sm">{signature.company}</p>
                </div>
              )}
              {signature.title && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Title</label>
                  <p className="text-sm">{signature.title}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Technical Evidence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="h-5 w-5 mr-2 text-green-600" />
              Technical Evidence
            </CardTitle>
            <CardDescription>Device and network information captured during signing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">IP Address</label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono">{signature.ipAddress}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(signature.ipAddress)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-sm">{signature.approximateLocation || 'Not available'}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">User Agent</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-gray-600 truncate flex-1">{signature.userAgent}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(signature.userAgent)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {signature.deviceInfo && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Device Information</label>
                  <p className="text-sm">{signature.deviceInfo}</p>
                </div>
              )}
              
              {signature.geolocation && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Geolocation</label>
                  <p className="text-sm">
                    {signature.geolocation.city && `${signature.geolocation.city}, `}
                    {signature.geolocation.region && `${signature.geolocation.region}, `}
                    {signature.geolocation.country}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Legal Consents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Legal Consents
            </CardTitle>
            <CardDescription>User agreements and consent records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(signature.consents).map(([key, value]) => {
                if (key === 'timestamp') return null
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <Badge variant={value ? 'success' : 'danger'}>
                      {value ? 'Accepted' : 'Declined'}
                    </Badge>
                  </div>
                )
              })}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Consent Timestamp</span>
                  <span className="text-sm">{new Date(signature.consents.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validation Results */}
        {validationResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {validationResult.isValid ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                )}
                Validation Results
              </CardTitle>
              <CardDescription>Latest validation check results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={validationResult.isValid ? 'success' : 'danger'}>
                    {validationResult.isValid ? 'Valid' : 'Invalid'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Validated At</span>
                  <span className="text-sm">{validationResult.timestamp.toLocaleString()}</span>
                </div>
                {validationResult.message && (
                  <div>
                    <span className="text-sm font-medium">Message</span>
                    <p className="text-sm text-gray-600 mt-1">{validationResult.message}</p>
                  </div>
                )}
                {validationResult.errors.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Issues</span>
                    <ul className="text-sm text-red-600 mt-1 list-disc list-inside">
                      {validationResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Evidence Package Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileCheck className="h-4 w-4 mr-2" />
              Evidence Package
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Package ID</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono">{evidencePackage.id}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(evidencePackage.id)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Package Hash</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-gray-600 truncate">{evidencePackage.packageHash}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(evidencePackage.packageHash)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-sm">{new Date(evidencePackage.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Certificate Generated</label>
                <Badge variant={evidencePackage.certificateGenerated ? 'success' : 'warning'}>
                  {evidencePackage.certificateGenerated ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {evidencePackage.certificateUrl && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={evidencePackage.certificateUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Certificate
                  </a>
                </Button>
              )}
              {evidencePackage.pdfUrl && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={evidencePackage.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4 mr-2" />
                    View PDF
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleValidate}
                disabled={isValidating}
              >
                <FileCheck className="h-4 w-4 mr-2" />
                {isValidating ? 'Validating...' : 'Validate Evidence'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SignatureDetailsPage() {
  const params = useParams()
  const signatureId = params.id as string

  // Professional State Management
  const [signature, setSignature] = useState<Signature | null>(null)
  const [evidencePackage, setEvidencePackage] = useState<EvidencePackage | null>(null)
  const [contract, setContract] = useState<Contract | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Action States
  const [isValidating, setIsValidating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Professional Data Fetching
  const loadSignatureData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch signature
      const signatureResponse = await fetchSignatureById(signatureId)
      if (!signatureResponse.success || !signatureResponse.data) {
        throw new Error(signatureResponse.error || 'Signature not found')
      }

      const signatureData = signatureResponse.data
      setSignature(signatureData)

      // Fetch evidence package
      const evidenceResponse = await fetchEvidencePackageBySignature(signatureId)
      if (evidenceResponse.success && evidenceResponse.data) {
        setEvidencePackage(evidenceResponse.data)
      }

      // Fetch contract if available
      if (signatureData.contractId) {
        const contractResponse = await fetchContractById(signatureData.contractId)
        if (contractResponse.success && contractResponse.data) {
          setContract(contractResponse.data)
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load signature data')
      console.error('Signature loading error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on mount
  useEffect(() => {
    if (signatureId) {
      loadSignatureData()
    }
  }, [signatureId])

  // Professional Action Handlers
  const handleValidateSignature = async () => {
    if (!evidencePackage?.id) {
      return { 
        isValid: false, 
        errors: ['Evidence package not found'], 
        timestamp: new Date(), 
        message: 'No evidence package available' 
      }
    }
    
    try {
      setIsValidating(true)
      const result = await validateEvidencePackage(evidencePackage.id)
      return result
    } catch (error) {
      console.error('Validation error:', error)
      return { 
        isValid: false, 
        errors: ['Validation failed due to network error'], 
        timestamp: new Date(),
        message: 'Failed to validate evidence package'
      }
    } finally {
      setIsValidating(false)
    }
  }

  const handleExportEvidence = async () => {
    if (!evidencePackage?.id) {
      toast.error('No evidence package ID available')
      return
    }
    
    try {
      setIsExporting(true)
      const response = await exportEvidencePackage(evidencePackage.id)
      
      if (response.success) {
        toast.success('Evidence package exported successfully')
      } else {
        throw new Error(response.error || 'Failed to export evidence')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to export evidence')
    } finally {
      setIsExporting(false)
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contracts', href: '/dashboard/contracts' },
    { label: 'Signatures', href: '/dashboard/contracts/signatures' },
    { label: `Signature ${signatureId.slice(0, 8)}...` }
  ]

  // Loading State
  if (isLoading) {
    return (
      <ContractsDashboardShell
        title="Loading Signature..."
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading signature evidence...</span>
        </div>
      </ContractsDashboardShell>
    )
  }

  // Error State
  if (error) {
    return (
      <ContractsDashboardShell
        title="Error Loading Signature"
        breadcrumbs={breadcrumbs}
      >
        <Card>
          <CardContent>
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button asChild>
                <Link href="/dashboard/contracts/signatures">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Signatures
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </ContractsDashboardShell>
    )
  }

  // Not Found State
  if (!signature) {
    return (
      <ContractsDashboardShell
        title="Signature Not Found"
        breadcrumbs={breadcrumbs}
      >
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Signature Not Found</h3>
              <p className="text-gray-600 mb-4">
                The signature you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button asChild>
                <Link href="/dashboard/contracts/signatures">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Signatures
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </ContractsDashboardShell>
    )
  }

  // No Evidence Package State
  if (!evidencePackage) {
    return (
      <ContractsDashboardShell
        title="Evidence Package Not Found"
        description={`Signature by ${signature.fullName}`}
        breadcrumbs={breadcrumbs}
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/contracts/signatures">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Signatures
            </Link>
          </Button>
        }
      >
        <Card>
          <CardContent>
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700">
                No evidence package found for this signature. The evidence may still be generating or there was an error during signature creation.
              </AlertDescription>
            </Alert>
            
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold">Signature Information:</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Signer:</span>
                  <span>{signature.fullName} ({signature.email})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Signed At:</span>
                  <span>{new Date(signature.signedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Signature Type:</span>
                  <span className="capitalize">{signature.signatureType}</span>
                </div>
                {signature.company && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Company:</span>
                    <span>{signature.company}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </ContractsDashboardShell>
    )
  }

  // Main View
  return (
    <ContractsDashboardShell
      title="Signature Evidence"
      description={`Digital signature by ${signature.fullName}${contract ? ` for "${contract.title}"` : ''}`}
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportEvidence}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export Evidence'}
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/contracts/signatures">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Signatures
            </Link>
          </Button>
        </div>
      }
    >
      <SignatureEvidenceViewer
        signature={signature}
        evidencePackage={evidencePackage}
        onValidate={handleValidateSignature}
        onExport={handleExportEvidence}
      />
    </ContractsDashboardShell>
  )
}