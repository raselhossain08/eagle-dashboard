import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Signature, EvidencePackage, ValidationResult } from '@/lib/types/contracts'
import { 
  CheckCircle, 
  XCircle, 
  Download, 
  Shield, 
  User, 
  MapPin, 
  Monitor,
  Globe,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { format } from 'date-fns'

interface SignatureEvidenceViewerProps {
  signature: Signature
  evidencePackage: EvidencePackage
  onValidate: () => Promise<ValidationResult>
  onExport: () => Promise<void>
  showTechnicalDetails?: boolean
}

export function SignatureEvidenceViewer({
  signature,
  evidencePackage,
  onValidate,
  onExport,
  showTechnicalDetails = true
}: SignatureEvidenceViewerProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleValidate = async () => {
    setIsValidating(true)
    try {
      const result = await onValidate()
      setValidationResult(result)
    } catch (error) {
      console.error('Validation failed:', error)
      setValidationResult({
        isValid: false,
        message: 'Validation failed due to an error',
        errors: ['Unable to validate evidence package'],
        timestamp: new Date()
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await onExport()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const getSignatureTypeLabel = (type: string) => {
    switch (type) {
      case 'drawn': return 'Hand Drawn'
      case 'typed': return 'Typed Name'
      case 'uploaded': return 'Uploaded Image'
      default: return type
    }
  }

  const formatBrowserInfo = (browserInfo: string) => {
    try {
      const info = JSON.parse(browserInfo)
      return `${info.name || 'Unknown'} ${info.version || ''}`
    } catch {
      return browserInfo || 'Unknown'
    }
  }

  const formatOSInfo = (osInfo: string) => {
    try {
      const info = JSON.parse(osInfo)
      return `${info.name || 'Unknown'} ${info.version || ''}`
    } catch {
      return osInfo || 'Unknown'
    }
  }

  const formatDeviceInfo = (deviceInfo: string) => {
    try {
      const info = JSON.parse(deviceInfo)
      return info.type ? `${info.vendor || ''} ${info.model || ''} (${info.type})`.trim() : 'Unknown Device'
    } catch {
      return deviceInfo || 'Unknown Device'
    }
  }

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${evidencePackage.certificateGenerated ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <Shield className={`h-6 w-6 ${evidencePackage.certificateGenerated ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {evidencePackage.certificateGenerated ? 'Certificate Generated' : 'Processing Certificate'}
                </h3>
                <p className="text-muted-foreground">
                  {evidencePackage.certificateGenerated 
                    ? 'This digital signature has been cryptographically verified and certified'
                    : 'Certificate is being generated for this signature'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleValidate}
                disabled={isValidating}
              >
                {isValidating ? 'Validating...' : 'Validate Evidence'}
              </Button>
              <Button 
                onClick={handleExport}
                disabled={isExporting}
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export Evidence'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Signature Details */}
            <Card>
              <CardHeader>
                <CardTitle>Signature Details</CardTitle>
                <CardDescription>
                  Information about the signature and signer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{signature.fullName}</div>
                    <div className="text-sm text-muted-foreground">{signature.email}</div>
                    {signature.company && (
                      <div className="text-sm text-muted-foreground">{signature.company}</div>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Signature Type:</span>
                    <Badge variant="outline">
                      {getSignatureTypeLabel(signature.signatureType)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Signed At:</span>
                    <span>{format(new Date(signature.signedAt), 'MMM dd, yyyy HH:mm:ss')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Content Hash:</span>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {signature.contentHash.slice(0, 16)}...
                    </code>
                  </div>
                  {signature.certificateId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Certificate ID:</span>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {signature.certificateId}
                      </code>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Legal Consents */}
            <Card>
              <CardHeader>
                <CardTitle>Legal Consents</CardTitle>
                <CardDescription>
                  Consents provided by the signer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Terms of Service</span>
                  {signature.consents.terms ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Privacy Policy</span>
                  {signature.consents.privacy ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cancellation Rights</span>
                  {signature.consents.cancellation ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                {signature.consents.marketing !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Marketing Communications</span>
                    {signature.consents.marketing ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                )}

                <div className="pt-3 border-t text-xs text-muted-foreground">
                  <div>Terms Version: {evidencePackage.evidence.legal.termsVersion}</div>
                  <div>Privacy Version: {evidencePackage.evidence.legal.privacyVersion}</div>
                  {evidencePackage.evidence.legal.cancellationPolicyVersion && (
                    <div>Cancellation Policy Version: {evidencePackage.evidence.legal.cancellationPolicyVersion}</div>
                  )}
                  <div>Consent Timestamp: {format(new Date(signature.consents.timestamp), 'MMM dd, yyyy HH:mm:ss')}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Signature Preview */}
          {signature.signatureData && (
            <Card>
              <CardHeader>
                <CardTitle>Signature Preview</CardTitle>
                <CardDescription>
                  Visual representation of the captured signature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  {signature.signatureType === 'drawn' ? (
                    <img 
                      src={signature.signatureData} 
                      alt="Signature" 
                      className="max-h-32 max-w-full"
                    />
                  ) : signature.signatureType === 'typed' ? (
                    <div className="text-3xl font-signature border-b-2 border-black px-4">
                      {signature.signatureData}
                    </div>
                  ) : signature.signatureType === 'uploaded' && signature.signatureImage ? (
                    <img 
                      src={signature.signatureImage} 
                      alt="Uploaded Signature" 
                      className="max-h-32 max-w-full"
                    />
                  ) : (
                    <div className="text-muted-foreground">
                      Signature data available in evidence package
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* KYC Information */}
          {evidencePackage.evidence.kyc && (
            <Card>
              <CardHeader>
                <CardTitle>Identity Verification</CardTitle>
                <CardDescription>
                  KYC information provided during signing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Selfie Provided</span>
                  {evidencePackage.evidence.kyc.selfieProvided ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Document Provided</span>
                  {evidencePackage.evidence.kyc.documentProvided ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                {evidencePackage.evidence.kyc.documentType && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Document Type:</span>
                    <span className="text-sm capitalize">{evidencePackage.evidence.kyc.documentType.replace('_', ' ')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Evidence Tab */}
        <TabsContent value="evidence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evidence Package</CardTitle>
              <CardDescription>
                Complete collection of signing evidence for legal compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timestamp Evidence */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-semibold">Timestamp Evidence</h4>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Evidence Created:</span>
                    <span>{format(new Date(evidencePackage.createdAt), 'MMM dd, yyyy HH:mm:ss')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Signature Timestamp:</span>
                    <span>{format(new Date(evidencePackage.evidence.signature.timestamp), 'MMM dd, yyyy HH:mm:ss')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consent Timestamp:</span>
                    <span>{format(new Date(signature.consents.timestamp), 'MMM dd, yyyy HH:mm:ss')}</span>
                  </div>
                </div>
              </div>

              {/* Integrity Evidence */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-semibold">Integrity Evidence</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Contract Content Hash:</strong>
                    <div className="font-mono text-xs bg-muted p-2 rounded mt-1">
                      {evidencePackage.evidence.contract.contentHash}
                    </div>
                  </div>
                  <div>
                    <strong>Evidence Package Hash:</strong>
                    <div className="font-mono text-xs bg-muted p-2 rounded mt-1">
                      {evidencePackage.packageHash}
                    </div>
                  </div>
                  <div>
                    <strong>Evidence Package ID:</strong>
                    <div className="font-mono text-xs bg-muted p-2 rounded mt-1">
                      {evidencePackage.id}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Evidence */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-semibold">Legal Evidence</h4>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Contract Title:</span>
                    <span>{evidencePackage.evidence.contract.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Template Version:</span>
                    <span>{evidencePackage.evidence.contract.templateVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Terms Version:</span>
                    <span>{evidencePackage.evidence.legal.termsVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Privacy Version:</span>
                    <span>{evidencePackage.evidence.legal.privacyVersion}</span>
                  </div>
                </div>
              </div>

              {/* Validation Results */}
              {validationResult && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    {validationResult.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                    <h4 className="font-semibold">Validation Results</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span>Status:</span>
                      {validationResult.isValid ? (
                        <Badge className="bg-green-100 text-green-800">Valid</Badge>
                      ) : (
                        <Badge variant="destructive">Invalid</Badge>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Message:</span>
                      <div className="text-muted-foreground mt-1">{validationResult.message}</div>
                    </div>
                    {validationResult.errors.length > 0 && (
                      <div>
                        <strong>Errors:</strong>
                        <ul className="list-disc list-inside mt-1 text-destructive">
                          {validationResult.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      <strong>Validated At:</strong>
                      <div className="text-muted-foreground">
                        {format(new Date(validationResult.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technical Tab */}
        <TabsContent value="technical">
          {showTechnicalDetails && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Evidence</CardTitle>
                  <CardDescription>
                    Technical data collected during the signing process
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Device Information */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Monitor className="h-5 w-5 text-muted-foreground" />
                      <h4 className="font-semibold">Device Information</h4>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>IP Address:</span>
                        <code className="bg-muted px-1 py-0.5 rounded">
                          {signature.ipAddress}
                        </code>
                      </div>
                      <div className="flex justify-between">
                        <span>User Agent:</span>
                        <span className="text-xs text-muted-foreground max-w-48 truncate" title={signature.userAgent}>
                          {signature.userAgent}
                        </span>
                      </div>
                      {signature.deviceInfo && (
                        <div className="flex justify-between">
                          <span>Device:</span>
                          <span>{formatDeviceInfo(signature.deviceInfo)}</span>
                        </div>
                      )}
                      {signature.osInfo && (
                        <div className="flex justify-between">
                          <span>Operating System:</span>
                          <span>{formatOSInfo(signature.osInfo)}</span>
                        </div>
                      )}
                      {signature.browserInfo && (
                        <div className="flex justify-between">
                          <span>Browser:</span>
                          <span>{formatBrowserInfo(signature.browserInfo)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Geolocation */}
                  {signature.geolocation && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <h4 className="font-semibold">Geolocation</h4>
                      </div>
                      <div className="grid gap-2 text-sm">
                        {signature.geolocation.country && (
                          <div className="flex justify-between">
                            <span>Country:</span>
                            <span>{signature.geolocation.country}</span>
                          </div>
                        )}
                        {signature.geolocation.region && (
                          <div className="flex justify-between">
                            <span>Region:</span>
                            <span>{signature.geolocation.region}</span>
                          </div>
                        )}
                        {signature.geolocation.city && (
                          <div className="flex justify-between">
                            <span>City:</span>
                            <span>{signature.geolocation.city}</span>
                          </div>
                        )}
                        {signature.geolocation.latitude && signature.geolocation.longitude && (
                          <div className="flex justify-between">
                            <span>Coordinates:</span>
                            <span>{signature.geolocation.latitude.toFixed(6)}, {signature.geolocation.longitude.toFixed(6)}</span>
                          </div>
                        )}
                        {signature.geolocation.accuracy && (
                          <div className="flex justify-between">
                            <span>Accuracy:</span>
                            <span>{signature.geolocation.accuracy}m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Network Information */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <h4 className="font-semibold">Evidence Collection</h4>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Evidence Package Created:</span>
                        <span>{format(new Date(evidencePackage.createdAt), 'MMM dd, yyyy HH:mm:ss')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Certificate Generated:</span>
                        <span>{evidencePackage.certificateGenerated ? 'Yes' : 'In Progress'}</span>
                      </div>
                      {evidencePackage.certificateUrl && (
                        <div className="flex justify-between">
                          <span>Certificate Available:</span>
                          <a 
                            href={evidencePackage.certificateUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Download Certificate
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}