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
import { ArrowLeft, X, User, Users } from 'lucide-react';
import { useSendEmail, useTemplates } from '@/hooks/useNotifications';
import { SendEmailDto } from '@/types/notifications';
import Link from 'next/link';

export default function SendEmailPage() {
  const router = useRouter();
  const [recipients, setRecipients] = useState<string[]>([]);
  const [currentRecipient, setCurrentRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [sendOption, setSendOption] = useState<'now' | 'schedule'>('now');
  
  const sendEmailMutation = useSendEmail();
  const { data: templates } = useTemplates();

  const handleAddRecipient = () => {
    if (currentRecipient.trim() && isValidEmail(currentRecipient.trim())) {
      setRecipients(prev => [...prev, currentRecipient.trim()]);
      setCurrentRecipient('');
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
    }
  };

  const handleSend = async () => {
    if (recipients.length === 0 || !subject.trim() || !content.trim()) {
      return;
    }

    const emailData: SendEmailDto = {
      to: recipients,
      subject: subject.trim(),
      content: content.trim(),
      templateId: selectedTemplate || undefined,
    };

    try {
      await sendEmailMutation.mutateAsync(emailData);
      router.push('/dashboard/notifications/email');
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

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
                <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates?.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Recipients */}
              <div className="grid gap-2">
                <Label htmlFor="recipients">Recipients</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter email address"
                      value={currentRecipient}
                      onChange={(e) => setCurrentRecipient(e.target.value)}
                      onKeyPress={handleKeyPress}
                      type="email"
                    />
                    <Button type="button" onClick={handleAddRecipient}>
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
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              {/* Content */}
              <div className="grid gap-2">
                <Label htmlFor="content">Email Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your email content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[300px]"
                />
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
                  <Label htmlFor="scheduleDate">Schedule Date & Time</Label>
                  <Input
                    id="scheduleDate"
                    type="datetime-local"
                  />
                </div>
              )}

              <Button 
                className="w-full" 
                onClick={handleSend}
                disabled={
                  sendEmailMutation.isPending || 
                  recipients.length === 0 || 
                  !subject.trim() || 
                  !content.trim()
                }
              >
                {sendEmailMutation.isPending ? 'Sending...' : 'Send Email'}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Use templates to save time on common emails</p>
              <p>• Add multiple recipients by entering emails one by one</p>
              <p>• Test your email before sending to multiple users</p>
              <p>• Check email logs for delivery status</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}