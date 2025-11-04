'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Clock, 
  User, 
  FileText, 
  Calendar,
  Send,
  Eye,
  MousePointer,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  X,
  Copy,
  ExternalLink
} from 'lucide-react';
import { EmailLog } from '@/types/notifications';
import { useResendEmail } from '@/hooks/useNotifications';
import { toast } from 'sonner';

interface EmailLogDetailModalProps {
  emailLog: EmailLog;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailLogDetailModal({ emailLog, isOpen, onClose }: EmailLogDetailModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const resendEmailMutation = useResendEmail();

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: Clock,
        description: 'Email is queued for sending'
      },
      sent: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: Send,
        description: 'Email has been sent successfully'
      },
      delivered: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle,
        description: 'Email was delivered to recipient'
      },
      failed: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: AlertCircle,
        description: 'Email delivery failed'
      },
      opened: { 
        color: 'bg-purple-100 text-purple-800 border-purple-200', 
        icon: Eye,
        description: 'Email was opened by recipient'
      },
      clicked: { 
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200', 
        icon: MousePointer,
        description: 'Links in email were clicked'
      },
      bounced: { 
        color: 'bg-orange-100 text-orange-800 border-orange-200', 
        icon: AlertCircle,
        description: 'Email bounced back'
      },
      scheduled: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: Calendar,
        description: 'Email is scheduled for future delivery'
      },
    };

    return configs[status as keyof typeof configs] || configs.pending;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleResend = async () => {
    try {
      await resendEmailMutation.mutateAsync(emailLog.id);
      toast.success('Email resent successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend email');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const statusConfig = getStatusConfig(emailLog.status);
  const StatusIcon = statusConfig.icon;
  const canResend = ['failed', 'bounced'].includes(emailLog.status) && (emailLog.retryCount || 0) < 3;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Log Details
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Detailed information about email delivery
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${statusConfig.color} border`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {emailLog.status.charAt(0).toUpperCase() + emailLog.status.slice(1)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Recipient Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">To:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{emailLog.to}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(emailLog.to)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Subject:</span>
                    <span className="text-sm max-w-48 truncate" title={emailLog.subject}>
                      {emailLog.subject}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Status Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <StatusIcon className="h-4 w-4" />
                    Status Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Current Status:</span>
                      <Badge className={`${statusConfig.color} border text-xs`}>
                        {emailLog.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {statusConfig.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Retry Count:</span>
                    <span className="text-sm">{emailLog.retryCount || 0}/3</span>
                  </div>

                  {emailLog.error && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Error:</span>
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {emailLog.errorMessage || emailLog.error}
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Template Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Template Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Template ID:</span>
                    <span className="text-sm font-mono">
                      {emailLog.templateId || 'Custom Email'}
                    </span>
                  </div>
                  
                  {emailLog.variables && Object.keys(emailLog.variables).length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground mb-2 block">Variables:</span>
                      <div className="space-y-1">
                        {Object.entries(emailLog.variables).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between text-xs">
                            <span className="font-mono text-muted-foreground">{key}:</span>
                            <span className="font-mono bg-muted px-1 rounded max-w-32 truncate">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timing Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Scheduled:</span>
                      <span>{formatDate(emailLog.scheduledAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sent:</span>
                      <span>{formatDate(emailLog.sentAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Delivered:</span>
                      <span>{formatDate(emailLog.deliveredAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Opened:</span>
                      <span>{formatDate(emailLog.openedAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Clicked:</span>
                      <span>{formatDate(emailLog.clickedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Email Subject</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-3 rounded-md font-medium">
                  {emailLog.subject}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Email Content</CardTitle>
                <CardDescription>
                  Preview of the email content sent to the recipient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-md max-h-64 overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    {/* This would be the actual email content */}
                    <p className="text-muted-foreground text-sm">
                      Email content preview not available. The full content was delivered to {emailLog.to}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Delivery Timeline</CardTitle>
                <CardDescription>
                  Track the complete email delivery process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Timeline items would be generated based on emailLog data */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Send className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Email Sent</p>
                      <p className="text-xs text-muted-foreground">{formatDate(emailLog.sentAt)}</p>
                    </div>
                  </div>
                  
                  {emailLog.deliveredAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Email Delivered</p>
                        <p className="text-xs text-muted-foreground">{formatDate(emailLog.deliveredAt)}</p>
                      </div>
                    </div>
                  )}

                  {emailLog.openedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <Eye className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Email Opened</p>
                        <p className="text-xs text-muted-foreground">{formatDate(emailLog.openedAt)}</p>
                      </div>
                    </div>
                  )}

                  {emailLog.clickedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                        <MousePointer className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Link Clicked</p>
                        <p className="text-xs text-muted-foreground">{formatDate(emailLog.clickedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            Email ID: {emailLog.id}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            
            {canResend && (
              <Button 
                onClick={handleResend}
                disabled={resendEmailMutation.isPending}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {resendEmailMutation.isPending ? 'Resending...' : 'Resend Email'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}