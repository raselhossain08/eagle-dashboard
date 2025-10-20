import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Contract, Signature, SignContractDto } from '@/lib/types/contracts'
import { Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'

interface ContractPdfViewerProps {
  contract: Contract
  signature?: Signature
  isPreview?: boolean
  showSigningInterface?: boolean
  onSign?: (data: SignContractDto) => Promise<void>
}

export function ContractPdfViewer({
  contract,
  signature,
  isPreview = false,
  showSigningInterface = false,
  onSign
}: ContractPdfViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  // Mock PDF content - in real implementation, you'd use @react-pdf/renderer
  const renderContractContent = () => {
    return (
      <div className="bg-white p-8 border rounded-lg shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">{contract.title}</h1>
          <p className="text-muted-foreground">
            Contract ID: {contract.id} | Created: {new Date(contract.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="prose max-w-none">
          {/* Render contract content with variables replaced */}
          {renderContractWithVariables()}
        </div>

        {/* Signature section */}
        {signature && (
          <div className="mt-12 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-4">Signatures</h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium mb-2">Party Signature</h4>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 min-h-32 flex items-center justify-center">
                  {signature.signatureType === 'drawn' && signature.signatureData ? (
                    <img 
                      src={signature.signatureData} 
                      alt="Signature" 
                      className="max-h-20 max-w-full"
                    />
                  ) : signature.signatureType === 'typed' ? (
                    <div className="text-2xl font-signature border-b-2 border-black">
                      {signature.signatureData}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">Signature on file</div>
                  )}
                </div>
                <div className="mt-2 text-sm">
                  <div><strong>Name:</strong> {signature.fullName}</div>
                  <div><strong>Email:</strong> {signature.email}</div>
                  <div><strong>Signed:</strong> {new Date(signature.signedAt).toLocaleString()}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Company Signature</h4>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 min-h-32 flex items-center justify-center">
                  <div className="text-muted-foreground">Awaiting signature</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Signing interface */}
        {showSigningInterface && onSign && (
          <div className="mt-8 p-6 border rounded-lg bg-muted/50">
            <h3 className="text-lg font-semibold mb-4">Ready to Sign?</h3>
            <p className="text-muted-foreground mb-4">
              Please review the contract above. If you agree with the terms, you can sign using the button below.
            </p>
            <Button
              onClick={() => {
                // This would open the signature capture modal
                console.log('Open signature capture')
              }}
            >
              Sign Contract
            </Button>
          </div>
        )}
      </div>
    )
  }

  const renderContractWithVariables = () => {
    let content = contract.content
    
    // Replace variables in content
    Object.entries(contract.variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      content = content.replace(new RegExp(placeholder, 'g'), value?.toString() || '')
    })

    return (
      <div dangerouslySetInnerHTML={{ __html: content }} />
    )
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleDownload = () => {
    // Implement PDF download logic
    console.log('Download PDF')
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <span className="text-sm font-medium w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 2}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PDF Content */}
      <Card>
        <CardContent className="p-0">
          <div 
            className="overflow-auto bg-muted/20"
            style={{ 
              maxHeight: '70vh',
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center top'
            }}
          >
            {renderContractContent()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}