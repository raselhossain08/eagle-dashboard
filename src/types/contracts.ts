export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface Contract {
  id: string
  userId: string
  subscriptionId?: string
  templateId: string
  title: string
  content: string
  contentHash: string
  variables: Record<string, any>
  locale: string
  status: 'draft' | 'sent' | 'viewed' | 'signed' | 'declined' | 'expired' | 'void'
  sentAt?: Date
  viewedAt?: Date
  signedAt?: Date
  expiresAt?: Date
  termsVersion: string
  privacyVersion: string
  signatureId?: string
  evidencePackageId?: string
  certificateUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Signature {
  id: string
  userId: string
  contractId: string
  fullName: string
  email: string
  signatureType: 'typed' | 'drawn' | 'uploaded'
  signatureData?: string
  consents: {
    terms: boolean
    privacy: boolean
    cancellation: boolean
  }
  ipAddress: string
  userAgent: string
  deviceInfo?: string
  geolocation?: Location
  contentHash: string
  signedAt: Date
}

export interface ContractTemplate {
  id: string
  name: string
  content: string
  type: string
  locale: string
  variables: TemplateVariable[]
  termsVersion: string
  privacyVersion: string
  isActive: boolean
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TemplateVariable {
  name: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'select'
  required: boolean
  defaultValue?: any
  options?: string[]
  description?: string
}

export interface EvidencePackage {
  id: string
  contractId: string
  signatureId: string
  technicalEvidence: TechnicalEvidence
  legalConsents: LegalConsents
  createdAt: Date
}

export interface TechnicalEvidence {
  ipAddress: string
  userAgent: string
  deviceInfo: string
  geolocation?: Location
  timestamp: Date
}

export interface LegalConsents {
  terms: boolean
  privacy: boolean
  cancellation: boolean
  termsVersion: string
  privacyVersion: string
}

export interface Location {
  country: string
  region?: string
  city?: string
}

// DTOs
export interface CreateContractDto {
  templateId: string
  userId: string
  title: string
  variables: Record<string, any>
  locale: string
  subscriptionId?: string
}

export interface SignContractDto {
  fullName: string
  email: string
  signatureType: 'typed' | 'drawn' | 'uploaded'
  signatureData?: string
  consents: {
    terms: boolean
    privacy: boolean
    cancellation: boolean
  }
}

export interface CreateTemplateDto {
  name: string
  content: string
  type: string
  locale: string
  variables: TemplateVariable[]
  termsVersion: string
  privacyVersion: string
}

export interface UpdateTemplateDto extends Partial<CreateTemplateDto> {
  id: string
}

// Query Params
export interface ContractsQueryParams {
  page?: number
  limit?: number
  status?: string[]
  customerId?: string
  templateId?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DateRange {
  from: Date
  to: Date
}

export interface ContractFilters {
  status?: string[]
  customerId?: string
  templateId?: string
  dateRange?: DateRange
  search?: string
}

export interface PaginationState {
  page: number
  limit: number
  total: number
}

// Response Types
export interface ContractsResponse {
  data: Contract[]
  pagination: PaginationState
}

export interface ContractMetrics {
  totalContracts: number
  draftContracts: number
  sentContracts: number
  signedContracts: number
  expiredContracts: number
  signatureRate: number
  averageSigningTime: number
  pendingSignatures: number
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  timestamp: Date
}