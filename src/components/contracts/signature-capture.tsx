import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { SignaturePad } from './signature-pad'
import { Contract, SignContractDto } from '@/lib/types/contracts'
import { Loader2, Pen, Type, Upload, CheckCircle, XCircle } from 'lucide-react'

interface SignatureCaptureProps {
  contract: Contract
  onSign: (signatureData: SignContractDto) => Promise<void>
  onDecline: (reason?: string) => Promise<void>
  mode: 'draw' | 'type' | 'upload'
  isLoading?: boolean
}

export function SignatureCapture({
  contract,
  onSign,
  onDecline,
  mode,
  isLoading = false
}: SignatureCaptureProps) {
  const [activeMode, setActiveMode] = useState<'draw' | 'type' | 'upload'>(mode)
  const [signatureData, setSignatureData] = useState('')
  const [typedName, setTypedName] = useState('')
  const [uploadedImage, setUploadedImage] = useState<string>('')
  const [consents, setConsents] = useState({
    terms: false,
    privacy: false,
    cancellation: false
  })
  const [declineReason, setDeclineReason] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSign = async () => {
    let finalSignatureData = ''

    switch (activeMode) {
      case 'draw':
        finalSignatureData = signatureData
        break
      case 'type':
        finalSignatureData = typedName
        break
      case 'upload':
        finalSignatureData = uploadedImage
        break
    }

    if (!finalSignatureData) {
      alert('Please provide your signature')
      return
    }

    if (!consents.terms || !consents.privacy) {
      alert('You must agree to the terms and privacy policy')
      return
    }

    const signatureDto: SignContractDto = {
      fullName: typedName || 'Signer',
      email: 'signer@example.com', // This would come from user context
      signatureType: activeMode === 'type' ? 'typed' : activeMode === 'draw' ? 'drawn' : 'uploaded',
      signatureData: finalSignatureData,
      consents
    }

    await onSign(signatureDto)
  }

  const handleDecline = async () => {
    await onDecline(declineReason)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const canSign = consents.terms && consents.privacy && (
    (activeMode === 'draw' && signatureData) ||
    (activeMode === 'type' && typedName) ||
    (activeMode === 'upload' && uploadedImage)
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Contract Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Contract for Signature</CardTitle>
          <CardDescription>
            Please review the contract below and provide your signature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <strong>Contract:</strong> {contract.title}
            </div>
            <div>
              <strong>Content Hash:</strong> 
              <code className="ml-2 text-xs bg-muted px-1 py-0.5 rounded">
                {contract.contentHash.slice(0, 16)}...
              </code>
            </div>
            <div>
              <strong>Terms Version:</strong> 1.0
            </div>
            <div>
              <strong>Privacy Version:</strong> 1.0
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Provide Your Signature</CardTitle>
          <CardDescription>
            Choose your preferred method to sign this contract
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="draw" className="flex items-center gap-2">
                <Pen className="h-4 w-4" />
                Draw
              </TabsTrigger>
              <TabsTrigger value="type" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Type
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
            </TabsList>

            {/* Draw Signature */}
            <TabsContent value="draw" className="space-y-4">
              <div className="border rounded-lg">
                <SignaturePad
                  width={500}
                  height={200}
                  backgroundColor="#ffffff"
                  penColor="#000000"
                  onSignatureChange={setSignatureData}
                  onClear={() => setSignatureData('')}
                  disabled={isLoading}
                />
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setSignatureData('')}
                  disabled={!signatureData || isLoading}
                >
                  Clear
                </Button>
                <div className="text-sm text-muted-foreground">
                  {signatureData ? 'Signature captured' : 'Draw your signature above'}
                </div>
              </div>
            </TabsContent>

            {/* Type Signature */}
            <TabsContent value="type" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="typedName">Type your full name</Label>
                <Input
                  id="typedName"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Enter your full name as signature"
                  disabled={isLoading}
                />
              </div>
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="text-center text-2xl font-signature border-b-2 border-black pb-2">
                  {typedName || 'Your signature will appear here'}
                </div>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  This typed name will serve as your digital signature
                </p>
              </div>
            </TabsContent>

            {/* Upload Signature */}
            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signatureUpload">Upload signature image</Label>
                <Input
                  id="signatureUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Upload a PNG, JPG, or SVG image of your signature
                </p>
              </div>

              {uploadedImage && (
                <div className="space-y-2">
                  <Label>Signature Preview</Label>
                  <div className="border rounded-lg p-4 flex justify-center">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded signature" 
                      className="max-h-32 max-w-full object-contain"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUploadedImage('')
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Legal Consents */}
      <Card>
        <CardHeader>
          <CardTitle>Legal Consents</CardTitle>
          <CardDescription>
            Please review and agree to the following
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="terms"
              checked={consents.terms}
              onCheckedChange={(checked) => 
                setConsents(prev => ({ ...prev, terms: checked }))
              }
              disabled={isLoading}
            />
            <Label htmlFor="terms" className="flex-1">
              I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> (Version 1.0)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="privacy"
              checked={consents.privacy}
              onCheckedChange={(checked) => 
                setConsents(prev => ({ ...prev, privacy: checked }))
              }
              disabled={isLoading}
            />
            <Label htmlFor="privacy" className="flex-1">
              I agree to the <a href="#" className="text-primary hover:underline">Privacy Policy</a> (Version 1.0)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="cancellation"
              checked={consents.cancellation}
              onCheckedChange={(checked) => 
                setConsents(prev => ({ ...prev, cancellation: checked }))
              }
              disabled={isLoading}
            />
            <Label htmlFor="cancellation" className="flex-1">
              I acknowledge my right of cancellation according to applicable laws
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div className="space-y-2">
          <Label htmlFor="declineReason">Reason for declining (optional)</Label>
          <Input
            id="declineReason"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="If declining, you may provide a reason..."
            disabled={isLoading}
          />
          <Button
            variant="outline"
            onClick={handleDecline}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Decline to Sign
          </Button>
        </div>

        <Button
          onClick={handleSign}
          disabled={!canSign || isLoading}
          size="lg"
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Sign Contract
        </Button>
      </div>

      {/* Legal Notice */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            By signing this document, you acknowledge that this constitutes your electronic signature, 
            which is legally binding equivalent of your handwritten signature under applicable laws 
            including the ESIGN Act and eIDAS Regulation.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}