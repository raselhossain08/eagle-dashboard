'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { ScrollArea } from '@/components/ui/scroll-area'; // Using div with overflow instead
import { 
  Mail, 
  Eye, 
  Users, 
  Clock, 
  Code, 
  FileText, 
  Send,
  X,
  Copy,
  ExternalLink
} from 'lucide-react';
import { SendEmailDto } from '@/types/notifications';
import { toast } from 'sonner';

interface EmailPreviewModalProps {
  emailData: SendEmailDto;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSend: () => void;
  isScheduled?: boolean;
  scheduledDate?: string;
  isSending?: boolean;
}

export default function EmailPreviewModal({ 
  emailData, 
  isOpen, 
  onClose, 
  onConfirmSend, 
  isScheduled = false,
  scheduledDate,
  isSending = false 
}: EmailPreviewModalProps) {
  const [activeTab, setActiveTab] = useState('preview');

  const processContent = (content: string, variables?: Record<string, any>) => {
    if (!variables) return content;
    
    let processedContent = content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processedContent = processedContent.replace(regex, String(value));
    });
    
    return processedContent;
  };

  const processedContent = processContent(emailData.content, emailData.variables);
  const processedSubject = processContent(emailData.subject, emailData.variables);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Email Preview
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Review your email before {isScheduled ? 'scheduling' : 'sending'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {emailData.to.length} recipient{emailData.to.length !== 1 ? 's' : ''}
              </Badge>
              {isScheduled && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Scheduled
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="raw">Raw Content</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4 max-h-96 overflow-y-auto">
            <div className="border rounded-lg overflow-hidden">
              {/* Email Header */}
              <div className="bg-muted/30 p-4 border-b">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Subject:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(processedSubject)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-semibold">{processedSubject}</p>
                </div>
                
                <div className="mt-3 pt-3 border-t space-y-1">
                  <div className="text-xs text-muted-foreground">
                    <strong>To:</strong> {emailData.to.join(', ')}
                  </div>
                  {isScheduled && scheduledDate && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <strong>Scheduled for:</strong> {formatDateTime(scheduledDate)}
                    </div>
                  )}
                </div>
              </div>

              {/* Email Body */}
              <div className="p-6">
                <div className="h-64 overflow-y-auto">
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: processedContent }}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Delivery Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Recipients:</span>
                      <Badge variant="outline">{emailData.to.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Send Method:</span>
                      <Badge variant={isScheduled ? 'secondary' : 'default'}>
                        {isScheduled ? 'Scheduled' : 'Immediate'}
                      </Badge>
                    </div>
                    {isScheduled && scheduledDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Delivery Time:</span>
                        <span className="text-xs">{formatDateTime(scheduledDate)}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-muted-foreground mb-2">Recipients:</p>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {emailData.to.map((email, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="font-mono">{email}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(email)}
                          >
                            <Copy className="h-2 w-2" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Template & Variables */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Template & Variables
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Template Used:</span>
                    <Badge variant="outline">
                      {emailData.templateId ? 'Yes' : 'Custom'}
                    </Badge>
                  </div>
                  
                  {emailData.templateId && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Template ID:</span>
                      <code className="text-xs bg-muted px-1 rounded">{emailData.templateId}</code>
                    </div>
                  )}

                  {emailData.variables && Object.keys(emailData.variables).length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-muted-foreground mb-2">Variables:</p>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {Object.entries(emailData.variables).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between text-xs">
                            <span className="font-mono text-muted-foreground">{key}:</span>
                            <span className="font-mono bg-muted px-1 rounded max-w-24 truncate">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="raw" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Raw Email Content
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(processedContent)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <CardDescription>
                  The raw HTML/text content that will be sent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 overflow-y-auto">
                  <pre className="text-xs bg-muted/30 p-3 rounded overflow-x-auto">
                    <code>{processedContent}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            {emailData.variables && Object.keys(emailData.variables).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Variable Substitutions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    {Object.entries(emailData.variables).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <code className="bg-red-100 text-red-800 px-1 rounded">{`{{${key}}}`}</code>
                        <span>→</span>
                        <code className="bg-green-100 text-green-800 px-1 rounded">{String(value)}</code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            {isScheduled 
              ? `Will be sent to ${emailData.to.length} recipient${emailData.to.length !== 1 ? 's' : ''} on ${formatDateTime(scheduledDate)}`
              : `Ready to send to ${emailData.to.length} recipient${emailData.to.length !== 1 ? 's' : ''}`
            }
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            
            <Button 
              onClick={onConfirmSend}
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {isScheduled ? 'Scheduling...' : 'Sending...'}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {isScheduled ? 'Schedule Email' : 'Send Email'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}