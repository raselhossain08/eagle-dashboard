'use client';

import { useState } from 'react';
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
import { ArrowLeft, X, User, Users, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useSendEmail, useTemplates } from '@/hooks/useNotifications';
import { SendEmailDto } from '@/types/notifications';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SendEmailPage() {
  const router = useRouter();
  const [recipients, setRecipients] = useState<string[]>([]);
  const [currentRecipient, setCurrentRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [sendOption, setSendOption] = useState<'now' | 'schedule'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [variables, setVariables] = useState<Record<string, any>>({});
  
  const sendEmailMutation = useSendEmail();
  const { data: templates, isLoading: templatesLoading } = useTemplates();

  const handleAddRecipient = () => {
    if (currentRecipient.trim() && isValidEmail(currentRecipient.trim())) {
      if (!recipients.includes(currentRecipient.trim())) {
        setRecipients(prev => [...prev, currentRecipient.trim()]);
        setCurrentRecipient('');
      } else {
        toast.error('Email address already added');
      }
    } else {
      toast.error('Please enter a valid email address');
    }
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

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

  const validateForm = () => {
    if (recipients.length === 0) {
      toast.error('Please add at least one recipient');
      return false;
    }
    
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return false;
    }
    
    if (!content.trim()) {
      toast.error('Please enter email content');
      return false;
    }

    if (sendOption === 'schedule') {
      if (!scheduledDate) {
        toast.error('Please select a scheduled date and time');
        return false;
      }
      
      const scheduledDateTime = new Date(scheduledDate);
      if (scheduledDateTime <= new Date()) {
        toast.error('Scheduled time must be in the future');
        return false;
      }
    }

    // Validate template variables if template is selected
    const template = templates?.find(t => t.id === selectedTemplate);
    if (template?.variables) {
      const missingVariables = template.variables.filter(variable => 
        !variables[variable] || variables[variable].trim() === ''
      );
      
      if (missingVariables.length > 0) {
        toast.error(`Please fill in all template variables: ${missingVariables.join(', ')}`);
        return false;
      }
    }

    return true;
  };

  const handleSend = async () => {
    if (!validateForm()) {
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

    try {
      const response = await sendEmailMutation.mutateAsync(emailData);
      
      // Show success message based on send option
      if (sendOption === 'schedule') {
        toast.success(`Email scheduled successfully! ${response.sent} email(s) will be sent on ${new Date(scheduledDate).toLocaleString()}`);
      } else {
        toast.success(`Email sent successfully! ${response.sent} out of ${recipients.length} email(s) sent.`);
      }
      
      // Navigate back after short delay
      setTimeout(() => {
        router.push('/dashboard/notifications/email');
      }, 1500);
    } catch (error: any) {
      console.error('Failed to send email:', error);
      toast.error(error.message || 'Failed to send email');
    }
  };

  const selectedTemplateData = templates?.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/notifications/email">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Email Logs
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Send Email</h1>
          <p className="text-muted-foreground">
            Send emails to individuals or groups
          </p>
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
                <Label htmlFor="recipients">Recipients <span className="text-red-500">*</span></Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter email address"
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}