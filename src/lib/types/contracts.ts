export interface Contract {
  id: string
  title: string
  content: string
  status: ContractStatus | string // Allow both enum and string values for backend compatibility
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
  subscription?: {
    id: string
    planName: string
  }
  signatures?: Signature[]
}

export enum ContractStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  SIGNED = 'signed',
  EXPIRED = 'expired',
  VOIDED = 'voided',
  ARCHIVED = 'archived'
}

export interface ContractTemplate {
  id: string
  name: string
  content: string
  type: string
  locale: string
  variables: TemplateVariable[]
  placeholders?: string[]
  termsVersion: string
  privacyVersion: string
  version: string
  isActive: boolean
  isDefault: boolean
  supportedLocales?: string[]
  applicablePlans?: string[]
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface TemplateVariable {
  name: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect'
  required: boolean
  description?: string
  defaultValue?: any
  options?: string[]
}

export interface CreateTemplateDto {
  name: string
  description?: string
  content: string
  type: string
  locale?: string
  variables?: TemplateVariable[]
  termsVersion?: string
  privacyVersion?: string
  version?: string
  isActive?: boolean
  isDefault?: boolean
  applicablePlans?: string[]
  supportedLocales?: string[]
  metadata?: Record<string, any>
}

export interface UpdateTemplateDto extends CreateTemplateDto {
  id: string
}

export interface Signature {
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

export interface CreateContractDto {
  userId: string
  templateId: string
  title: string
  variables: Record<string, any>
  locale: string
  subscriptionId?: string
  expiresAt?: Date
  metadata?: Record<string, any>
}

export interface SignContractDto {
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
  }
  selfieImage?: string
  documentImage?: string
  documentType?: string
  metadata?: Record<string, any>
}

export interface ValidationResult {
  isValid: boolean
  message: string
  errors: string[]
  timestamp: Date
}

export interface EvidencePackage {
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

export interface ContractsQueryParams {
  page?: number
  limit?: number
  userId?: string
  status?: string
  templateId?: string
  subscriptionId?: string
  search?: string
}

export interface PaginatedContracts {
  data: Contract[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface DateRange {
  from?: Date
  to?: Date
}

export interface ContractFilters {
  status: string[]
  search: string
  templateId?: string
  userId?: string
}

export interface TemplateFilters {
  category?: string
  search?: string
  isActive?: boolean
}

export interface SignatureFilters {
  contractId?: string
  search?: string
}

export interface ContractMetrics {
  totalContracts: number
  draftContracts: number
  sentContracts: number
  viewedContracts: number
  signedContracts: number
  expiredContracts: number
  voidedContracts: number
  signatureRate: number
  averageSigningTime: number // in hours
  conversionFunnel: {
    sent: number
    viewed: number
    signed: number
  }
}

export interface SignatureAnalytics {
  totalSignatures: number
  monthlySignatures: number
  signatureRate: number
  averageSigningTime: number
  signaturesByDay: Array<{
    date: string
    count: number
  }>
  signaturesByTemplate: Array<{
    templateId: string
    templateName: string
    count: number
    averageTime: number
  }>
  complianceScore: number
  evidencePackagesGenerated: number
}

export interface SignatureTypeDistribution {
  type: 'drawn' | 'typed' | 'uploaded'
  count: number
  percentage: number
}

export interface SignaturesQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  contractId?: string
}

export interface PaginatedSignatures {
  data: Signature[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface TemplatePerformance {
  templateId: string
  templateName: string
  category: string
  totalContracts: number
  signedContracts: number
  signatureRate: number
  averageSigningTime: number
  popularityScore: number
}

export interface ComplianceMetrics {
  overallScore: number
  totalAudits: number
  passedAudits: number
  failedAudits: number
  criticalIssues: number
  warningIssues: number
  auditsByCategory: Array<{
    category: string
    total: number
    passed: number
    failed: number
  }>
  recentAudits: Array<{
    id: string
    contractId: string
    status: 'passed' | 'failed' | 'warning'
    issues: string[]
    createdAt: Date
  }>
  complianceHistory: Array<{
    date: string
    score: number
  }>
}