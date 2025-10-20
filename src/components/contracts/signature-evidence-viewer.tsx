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
  Clock
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

  const handleValidate = async () => {
    setIsValidating(true)
    try {
      const result = await onValidate()
      setValidationResult(result)
    } catch (error) {
      console.error('Validation failed:', error)
    } finally {
      setIsValidating(false)
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

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Signature Validated</h3>
                <p className="text-muted-foreground">
                  This digital signature has been cryptographically verified
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleValidate}
                disabled={isValidating}
              >
                {isValidating ? 'Validating...' : 'Re-validate'}
              </Button>
              <Button onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Evidence
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

                <div className="pt-3 border-t text-xs text-muted-foreground">
                  <div>Terms Version: {evidencePackage.legalConsents.termsVersion}</div>
                  <div>Privacy Version: {evidencePackage.legalConsents.privacyVersion}</div>
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
                    <div className="text-3xl font-signature border-b-2 border-black">
                      {signature.signatureData}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      Uploaded signature image
                    </div>
                  )}
                </div>
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
                    <span>{format(new Date(signature.signedAt), 'MMM dd, yyyy HH:mm:ss')}</span>
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
                    <strong>Content Hash:</strong>
                    <div className="font-mono text-xs bg-muted p-2 rounded mt-1">
                      {signature.contentHash}
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

              {/* Validation Results */}
              {validationResult && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    <h4 className="font-semibold">Validation Results</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span>Status:</span>
                      {validationResult.isValid ? (
                        <Badge variant="success">Valid</Badge>
                      ) : (
                        <Badge variant="destructive">Invalid</Badge>
                      )}
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
                      <span className="text-xs text-muted-foreground max-w-48 truncate">
                        {signature.userAgent}
                      </span>
                    </div>
                    {signature.deviceInfo && (
                      <div className="flex justify-between">
                        <span>Device Info:</span>
                        <span>{signature.deviceInfo}</span>
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
                      <div className="flex justify-between">
                        <span>Country:</span>
                        <span>{signature.geolocation.country}</span>
                      </div>
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
                    </div>
                  </div>
                )}

                {/* Network Information */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <h4 className="font-semibold">Network Information</h4>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Timestamp:</span>
                      <span>{format(new Date(evidencePackage.technicalEvidence.timestamp), 'MMM dd, yyyy HH:mm:ss')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Evidence Collected:</span>
                      <span>{evidencePackage.technicalEvidence.deviceInfo}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}