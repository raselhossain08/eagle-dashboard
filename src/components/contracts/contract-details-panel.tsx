import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Contract, User, ContractTemplate, Signature, EvidencePackage } from '@/lib/types/contracts'
import { 
  Calendar, 
  User as UserIcon, 
  FileText, 
  Download, 
  Send, 
  FileX,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { ContractPdfViewer } from './contract-pdf-viewer'
import { SignatureEvidenceViewer } from './signature-evidence-viewer'

interface ContractDetailsPanelProps {
  contract: Contract
  customer: User
  template: ContractTemplate
  signature?: Signature
  evidencePackage?: EvidencePackage
  onSend: () => Promise<void>
  onVoid: (reason: string) => Promise<void>
  onDownload: () => Promise<void>
  onViewEvidence: () => void
}

const statusConfig = {
  draft: { label: 'Draft', variant: 'secondary' as const, icon: FileText },
  sent: { label: 'Sent', variant: 'outline' as const, icon: Send },
  viewed: { label: 'Viewed', variant: 'default' as const, icon: Eye },
  signed: { label: 'Signed', variant: 'success' as const, icon: CheckCircle },
  declined: { label: 'Declined', variant: 'destructive' as const, icon: AlertCircle },
  expired: { label: 'Expired', variant: 'destructive' as const, icon: Clock },
  void: { label: 'Void', variant: 'secondary' as const, icon: FileX },
}

export function ContractDetailsPanel({
  contract,
  customer,
  template,
  signature,
  evidencePackage,
  onSend,
  onVoid,
  onDownload,
  onViewEvidence
}: ContractDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showVoidDialog, setShowVoidDialog] = useState(false)
  const [voidReason, setVoidReason] = useState('')

  const statusInfo = statusConfig[contract.status]
  const StatusIcon = statusInfo.icon

  const handleVoidContract = async () => {
    if (voidReason.trim()) {
      await onVoid(voidReason)
      setShowVoidDialog(false)
      setVoidReason('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-${statusInfo.variant}/10`}>
                  <StatusIcon className={`h-6 w-6 text-${statusInfo.variant}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{contract.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Created {format(new Date(contract.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <strong>Customer:</strong> {customer.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <strong>Template:</strong> {template.name}
                  </span>
                </div>
                {contract.sentAt && (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <strong>Sent:</strong> {format(new Date(contract.sentAt), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                )}
                {contract.signedAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <strong>Signed:</strong> {format(new Date(contract.signedAt), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              
              {contract.status === 'draft' && (
                <Button onClick={onSend}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Contract
                </Button>
              )}
              
              {contract.status !== 'void' && contract.status !== 'signed' && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowVoidDialog(true)}
                >
                  <FileX className="h-4 w-4 mr-2" />
                  Void Contract
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="document">Document</TabsTrigger>
          <TabsTrigger value="signature">Signature</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Contract Details */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
                <CardDescription>
                  Basic information about this contract
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Contract ID:</strong>
                    <div className="text-muted-foreground font-mono text-xs">
                      {contract.id}
                    </div>
                  </div>
                  <div>
                    <strong>Content Hash:</strong>
                    <div className="text-muted-foreground font-mono text-xs">
                      {contract.contentHash.slice(0, 16)}...
                    </div>
                  </div>
                  <div>
                    <strong>Language:</strong>
                    <div className="text-muted-foreground">
                      {contract.locale}
                    </div>
                  </div>
                  <div>
                    <strong>Template Version:</strong>
                    <div className="text-muted-foreground">
                      {template.termsVersion}
                    </div>
                  </div>
                </div>

                {contract.expiresAt && (
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Expires</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(contract.expiresAt), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>
                  Details about the signing party
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">{customer.email}</div>
                  </div>
                </div>

                <div className="grid gap-2 text-sm">
                  <div>
                    <strong>Customer ID:</strong>
                    <div className="text-muted-foreground font-mono text-xs">
                      {customer.id}
                    </div>
                  </div>
                  {contract.subscriptionId && (
                    <div>
                      <strong>Subscription ID:</strong>
                      <div className="text-muted-foreground font-mono text-xs">
                        {contract.subscriptionId}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contract Variables */}
          {Object.keys(contract.variables).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Contract Variables</CardTitle>
                <CardDescription>
                  Dynamic values used in this contract
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(contract.variables).map(([key, value]) => (
                    <div key={key} className="p-3 border rounded-lg">
                      <div className="font-medium text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </div>
                      <div className="text-muted-foreground text-sm mt-1">
                        {value?.toString() || 'Not set'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Document Tab */}
        <TabsContent value="document">
          <Card>
            <CardHeader>
              <CardTitle>Contract Document</CardTitle>
              <CardDescription>
                View and interact with the contract document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContractPdfViewer
                contract={contract}
                signature={signature}
                isPreview={false}
                showSigningInterface={contract.status === 'sent'}
                onSign={async (data) => {
                  // Handle signing logic
                  console.log('Sign contract:', data)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signature Tab */}
        <TabsContent value="signature">
          {signature ? (
            <Card>
              <CardHeader>
                <CardTitle>Digital Signature</CardTitle>
                <CardDescription>
                  Signature details and evidence package
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignatureEvidenceViewer
                  signature={signature}
                  evidencePackage={evidencePackage!}
                  onValidate={async () => {
                    // Handle validation logic
                    return { isValid: true, errors: [], timestamp: new Date() }
                  }}
                  onExport={async () => {
                    // Handle export logic
                    console.log('Export evidence')
                  }}
                  showTechnicalDetails={true}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Signature Yet</h3>
                <p className="text-muted-foreground mb-4">
                  This contract has not been signed yet.
                  {contract.status === 'sent' && ' The customer can sign the contract using the link sent to them.'}
                </p>
                {contract.status === 'draft' && (
                  <Button onClick={onSend}>
                    <Send className="h-4 w-4 mr-2" />
                    Send for Signature
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Contract History</CardTitle>
              <CardDescription>
                Timeline of contract events and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Contract creation */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <div className="w-0.5 h-full bg-border" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="font-medium">Contract Created</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(contract.createdAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                    <div className="text-sm mt-1">
                      Contract was created from template "{template.name}"
                    </div>
                  </div>
                </div>

                {/* Contract sent */}
                {contract.sentAt && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div className="w-0.5 h-full bg-border" />
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="font-medium">Contract Sent</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(contract.sentAt), 'MMM dd, yyyy HH:mm')}
                      </div>
                      <div className="text-sm mt-1">
                        Contract was sent to {customer.email} for signature
                      </div>
                    </div>
                  </div>
                )}

                {/* Contract viewed */}
                {contract.viewedAt && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <div className="w-0.5 h-full bg-border" />
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="font-medium">Contract Viewed</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(contract.viewedAt), 'MMM dd, yyyy HH:mm')}
                      </div>
                      <div className="text-sm mt-1">
                        Customer viewed the contract
                      </div>
                    </div>
                  </div>
                )}

                {/* Contract signed */}
                {contract.signedAt && signature && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Contract Signed</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(contract.signedAt), 'MMM dd, yyyy HH:mm')}
                      </div>
                      <div className="text-sm mt-1">
                        Signed by {signature.fullName} ({signature.email})
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Void Contract Dialog */}
      {showVoidDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Void Contract</CardTitle>
              <CardDescription>
                This action cannot be undone. The contract will be marked as void.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Reason for voiding</label>
                <textarea
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Enter the reason for voiding this contract..."
                  className="w-full mt-1 p-2 border rounded-md text-sm"
                  rows={3}
                />
              </div>
            </CardContent>
            <CardContent className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowVoidDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleVoidContract}
                disabled={!voidReason.trim()}
              >
                Void Contract
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}