'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, X, User, Users, CheckCircle, AlertTriangle, Clock, Eye, RefreshCw, FileText, BarChart3 } from 'lucide-react';
import { useSendEmail, useTemplates } from '@/hooks/useNotifications';
import { SendEmailDto, Template } from '@/types/notifications';
import { toast } from 'sonner';
import Link from 'next/link';
import { SendEmailErrorBoundary } from '@/components/notifications/SendEmailErrorBoundary';
import { SendEmailSkeleton } from '@/components/notifications/SendEmailSkeleton';
import EmailPreviewModal from '@/components/notifications/EmailPreviewModal';
import { EmailValidator, emailToast } from '@/lib/email-validation';

function SendEmailContent() {
  const router = useRouter();
  const [recipients, setRecipients] = useState<string[]>([]);
  const [currentRecipient, setCurrentRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [sendOption, setSendOption] = useState<'now' | 'schedule'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  
  const sendEmailMutation = useSendEmail();
  const { 
    data: templates, 
    isLoading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates 
  } = useTemplates();

  // Auto-navigation prevention
  useEffect(() => {
    if (sendEmailMutation.isSuccess && !hasNavigated) {
      setHasNavigated(true);
      // Navigation handled in handleSend after success message
    }
  }, [sendEmailMutation.isSuccess, hasNavigated]);

  const handleAddRecipient = () => {
    const email = currentRecipient.trim();
    if (!email) {
      emailToast.error('Please enter an email address');
      return;
    }

    if (!EmailValidator.isValidEmail(email)) {
      const suggestions = EmailValidator.suggestEmailCorrections(email);
      if (suggestions.length > 0) {
        emailToast.error(`Invalid email. Did you mean: ${suggestions[0]}?`);
      } else {
        emailToast.error('Please enter a valid email address');
      }
      return;
    }

    if (recipients.includes(email)) {
      emailToast.error('Email address already added');
      return;
    }

    if (recipients.length >= 100) {
      emailToast.error('Maximum 100 recipients allowed');
      return;
    }

    setRecipients(prev => [...prev, email]);
    setCurrentRecipient('');
    emailToast.info(`Added ${email} to recipients`);
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(prev => prev.filter(r => r !== email));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentRecipient.trim()) {
      e.preventDefault();
      handleAddRecipient();
    }
  };

  const handleBulkAddRecipients = (emailText: string) => {
    const emailList = emailText
      .split(/[,;\n\t]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);
    
    const validation = EmailValidator.validateBulkEmails(emailList);
    
    if (validation.invalid.length > 0) {
      emailToast.error(`Invalid emails: ${validation.invalid.slice(0, 3).join(', ')}${validation.invalid.length > 3 ? '...' : ''}`);
      return;
    }

    if (validation.duplicates.length > 0) {
      emailToast.info(`Skipped duplicates: ${validation.duplicates.slice(0, 2).join(', ')}`);
    }

    const newEmails = validation.valid.filter(email => !recipients.includes(email));
    
    if (newEmails.length === 0) {
      emailToast.info('No new email addresses to add');
      return;
    }

    if (recipients.length + newEmails.length > 100) {
      emailToast.error(`Cannot add ${newEmails.length} emails. Maximum 100 recipients allowed.`);
      return;
    }

    setRecipients(prev => [...prev, ...newEmails]);
    emailToast.success(`Added ${newEmails.length} email addresses`);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setContent(template.content);
      
      // Initialize variables for template
      const templateVariables: Record<string, any> = {};
      template.variables?.forEach(variable => {
        templateVariables[variable] = '';
      });
      setVariables(templateVariables);
    }
  };

  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const validateEmailData = (): boolean => {
    const template = templates?.find(t => t.id === selectedTemplate);
    
    const emailData: Partial<SendEmailDto> = {
      to: recipients,
      subject: subject.trim(),
      content: content.trim(),
      templateId: selectedTemplate || undefined,
      variables: Object.keys(variables).length > 0 ? variables : undefined,
      scheduledAt: sendOption === 'schedule' ? scheduledDate : undefined,
    };

    const validation = EmailValidator.validateEmailData(emailData, {
      templateVariables: template?.variables || [],
      maxRecipients: 100,
      minContentLength: 10,
      requireSubject: true,
      allowScheduling: true,
    });

    if (!validation.isValid) {
      const firstError = Object.entries(validation.errors)[0];
      if (firstError) {
        emailToast.validationError(firstError[0], firstError[1]);
      }
      return false;
    }

    return true;
  };

  const handlePreview = () => {
    if (!validateEmailData()) {
      return;
    }
    setShowPreview(true);
  };

  const handleSend = async () => {
    if (!validateEmailData()) {
      return;
    }

    const emailData: SendEmailDto = {
      to: recipients,
      subject: subject.trim(),
      content: content.trim(),
      templateId: selectedTemplate || undefined,
      variables: Object.keys(variables).length > 0 ? variables : undefined,
      scheduledAt: sendOption === 'schedule' ? scheduledDate : undefined,
    };

    // Show loading toast
    const loadingToast = emailToast.loading(
      sendOption === 'schedule' ? 'Scheduling email...' : 'Sending email...'
    );

    try {
      const result = await sendEmailMutation.mutateAsync(emailData);
      emailToast.dismiss(loadingToast);

      if (result) {
        if (sendOption === 'schedule') {
          emailToast.success(
            `Email scheduled successfully! ${result.sent} email(s) will be sent on ${new Date(scheduledDate).toLocaleString()}`,
            {
              action: {
                label: 'View Logs',
                onClick: () => router.push('/dashboard/notifications/email'),
              },
            }
          );
        } else {
          emailToast.success(
            `Email sent successfully! ${result.sent} out of ${recipients.length} email(s) sent.`,
            {
              action: {
                label: 'View Logs',
                onClick: () => router.push('/dashboard/notifications/email'),
              },
            }
          );
        }

        // Navigate back after delay
        setTimeout(() => {
          router.push('/dashboard/notifications/email');
        }, 2000);
      }
    } catch (apiError: any) {
      emailToast.dismiss(loadingToast);
      console.error('Failed to send email:', apiError);
      
      emailToast.error(
        apiError.response?.data?.message || apiError.message || 'Failed to send email',
        {
          action: {
            label: 'Retry',
            onClick: () => handleSend(),
          },
        }
      );
    }
  };

  const selectedTemplateData = templates?.find(t => t.id === selectedTemplate);
  const contentStats = EmailValidator.getContentStats(content);

  // Error handling for templates
  if (templatesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto max-w-4xl p-4">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/notifications/email">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Send Email</h1>
                <p className="text-muted-foreground">Send emails to individuals or groups</p>
              </div>
            </div>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Failed to load templates:</strong> {templatesError instanceof Error ? templatesError.message : 'An error occurred'}
              </AlertDescription>
            </Alert>

            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <div>
                  <p className="text-lg font-medium text-muted-foreground mb-2">Templates Unavailable</p>
                  <p className="text-sm text-muted-foreground">
                    You can still compose and send emails without templates
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <Button onClick={() => refetchTemplates()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Loading Templates
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedTemplate('')}>
                    Continue Without Templates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto max-w-6xl p-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/notifications/email">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Send Email</h1>
                <p className="text-muted-foreground">
                  Send emails to individuals or groups
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handlePreview} disabled={!content.trim() || recipients.length === 0}>
                <Eye className="h-4 w-4 mr-2" />
                Preview Email
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compose Email</CardTitle>
                  <CardDescription>
                    Create your email message and choose recipients
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Template Selection */}
                  <div className="grid gap-2">
                    <Label htmlFor="template">Use Template (Optional)</Label>
                    <Select value={selectedTemplate} onValueChange={handleTemplateChange} disabled={templatesLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder={templatesLoading ? "Loading templates..." : "Select a template"} />
                      </SelectTrigger>
                      <SelectContent>
                        {templates && templates.length > 0 ? (
                          templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            No templates available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {!templatesLoading && (!templates || templates.length === 0) && (
                      <p className="text-xs text-muted-foreground">
                        No email templates found. You can still send emails without templates.
                      </p>
                    )}
                  </div>

                  {/* Template Variables */}
                  {selectedTemplateData?.variables && selectedTemplateData.variables.length > 0 && (
                    <div className="grid gap-2">
                      <Label>Template Variables</Label>
                      <div className="space-y-3 p-4 border rounded-md bg-muted/30">
                        {selectedTemplateData.variables.map((variable) => (
                          <div key={variable} className="grid gap-1">
                            <Label htmlFor={`var-${variable}`} className="text-sm">
                              {variable} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id={`var-${variable}`}
                              placeholder={`Enter value for ${variable}`}
                              value={variables[variable] || ''}
                              onChange={(e) => handleVariableChange(variable, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recipients */}
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="recipients">Recipients <span className="text-red-500">*</span></Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const emails = prompt('Enter multiple emails separated by commas, semicolons, or new lines:');
                          if (emails) handleBulkAddRecipients(emails);
                        }}
                      >
                        <Users className="h-3 w-3 mr-1" />
                        Bulk Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter email address and press Enter"
                          value={currentRecipient}
                          onChange={(e) => setCurrentRecipient(e.target.value)}
                          onKeyPress={handleKeyPress}
                          type="email"
                        />
                        <Button type="button" onClick={handleAddRecipient} disabled={!currentRecipient.trim()}>
                          Add
                        </Button>
                      </div>
                      
                      {/* Recipient Tags */}
                      <div className="flex flex-wrap gap-2">
                        {recipients.map((email) => (
                          <Badge key={email} variant="secondary" className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {email}
                            <button
                              onClick={() => handleRemoveRecipient(email)}
                              className="hover:bg-muted-foreground/20 rounded-sm"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      
                      {recipients.length > 0 && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="grid gap-2">
                    <Label htmlFor="subject">Subject <span className="text-red-500">*</span></Label>
                    <Input
                      id="subject"
                      placeholder="Email subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  {/* Content */}
                  <div className="grid gap-2">
                    <Label htmlFor="content">Email Content <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="content"
                      placeholder="Write your email content here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[300px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      You can use HTML formatting in your email content.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Send Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Send Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>When to Send</Label>
                    <Select value={sendOption} onValueChange={(value: 'now' | 'schedule') => setSendOption(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="now">Send Now</SelectItem>
                        <SelectItem value="schedule">Schedule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {sendOption === 'schedule' && (
                    <div className="space-y-2">
                      <Label htmlFor="scheduleDate">Schedule Date & Time <span className="text-red-500">*</span></Label>
                      <Input
                        id="scheduleDate"
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                      {scheduledDate && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Will be sent on {new Date(scheduledDate).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    onClick={handleSend}
                    disabled={sendEmailMutation.isPending}
                  >
                    {sendEmailMutation.isPending ? (
                      sendOption === 'schedule' ? 'Scheduling...' : 'Sending...'
                    ) : (
                      sendOption === 'schedule' ? 'Schedule Email' : 'Send Email'
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Preview Info */}
              {selectedTemplateData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Template Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <strong>Template:</strong> {selectedTemplateData.name}
                    </div>
                    <div>
                      <strong>Type:</strong> {selectedTemplateData.type || 'Standard'}
                    </div>
                    {selectedTemplateData.variables && selectedTemplateData.variables.length > 0 && (
                      <div>
                        <strong>Variables:</strong> {selectedTemplateData.variables.join(', ')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quick Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• Use templates to save time on common emails</p>
                  <p>• Add multiple recipients by entering emails one by one</p>
                  <p>• Schedule emails for optimal delivery times</p>
                  <p>• Fill in all template variables before sending</p>
                  <p>• Check email logs for delivery status</p>
                  <p>• Preview emails before sending</p>
                </CardContent>
              </Card>

              {/* Content Statistics */}
              {content && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Content Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Words:</span>
                      <Badge variant="outline">{contentStats.wordCount}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Characters:</span>
                      <Badge variant="outline">{contentStats.charCount}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Reading Time:</span>
                      <Badge variant="outline">{contentStats.estimatedReadingTime}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Email Preview Modal */}
          {showPreview && (
            <EmailPreviewModal
              emailData={{
                to: recipients,
                subject: subject.trim(),
                content: content.trim(),
                templateId: selectedTemplate || undefined,
                variables: Object.keys(variables).length > 0 ? variables : undefined,
                scheduledAt: sendOption === 'schedule' ? scheduledDate : undefined,
              }}
              isOpen={showPreview}
              onClose={() => setShowPreview(false)}
              onConfirmSend={() => {
                setShowPreview(false);
                handleSend();
              }}
              isScheduled={sendOption === 'schedule'}
              scheduledDate={scheduledDate}
              isSending={sendEmailMutation.isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function SendEmailPage() {
  return (
    <SendEmailErrorBoundary>
      <Suspense fallback={<SendEmailSkeleton />}>
        <SendEmailContent />
      </Suspense>
    </SendEmailErrorBoundary>
  );
}