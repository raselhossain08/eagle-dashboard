'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TestTube, 
  CheckCircle, 
  AlertTriangle, 
  Send, 
  Eye,
  Loader2,
  Mail,
  User,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface TemplateTestData {
  name: string;
  subject: string;
  content: string;
  variables: string[];
  type: string;
}

interface TemplateTesterProps {
  onTest?: (data: TemplateTestData) => void;
  className?: string;
}

const sampleTemplates: TemplateTestData[] = [
  {
    name: 'Welcome New User',
    subject: 'Welcome to {{company.name}}, {{user.name}}!',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome {{user.name}}!</h1>
        <p>Thank you for joining <strong>{{company.name}}</strong>. We're excited to have you on board!</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Getting Started</h3>
          <ul>
            <li>Complete your profile setup</li>
            <li>Explore our dashboard features</li>
            <li>Join our community</li>
          </ul>
        </div>
        
        <p>If you have any questions, our support team is here to help at {{support.email}}.</p>
        
        <a href="{{action.url}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Get Started Now
        </a>
        
        <p style="font-size: 12px; color: #666; margin-top: 30px;">
          This email was sent on {{current.date}} to {{user.email}}.
        </p>
      </div>
    `,
    variables: ['user.name', 'user.email', 'company.name', 'support.email', 'action.url', 'current.date'],
    type: 'transactional'
  },
  {
    name: 'Password Reset Request',
    subject: 'Reset your password - {{company.name}}',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Password Reset Request</h2>
        <p>Hello {{user.name}},</p>
        
        <p>We received a request to reset the password for your account ({{user.email}}).</p>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>Security Notice:</strong> If you didn't request this reset, please ignore this email.
          </p>
        </div>
        
        <a href="{{action.url}}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Reset Password
        </a>
        
        <p>This link will expire in 1 hour for security reasons.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #666;">
          {{company.name}} Security Team<br>
          {{current.date}}
        </p>
      </div>
    `,
    variables: ['user.name', 'user.email', 'company.name', 'action.url', 'current.date'],
    type: 'alert'
  },
  {
    name: 'Monthly Newsletter',
    subject: '📧 {{company.name}} Newsletter - {{current.month}} {{current.year}}',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">{{company.name}} Newsletter</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">{{current.month}} {{current.year}} Edition</p>
        </header>
        
        <div style="background: white; padding: 30px;">
          <p>Hi {{user.name}},</p>
          
          <p>Welcome to our monthly newsletter! Here's what's new this month:</p>
          
          <h3 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">🚀 New Features</h3>
          <ul>
            <li>Enhanced dashboard with real-time analytics</li>
            <li>Improved notification system</li>
            <li>Advanced template editor</li>
          </ul>
          
          <h3 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">📊 Your Stats</h3>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>You've been with us since joining {{company.name}}. Thank you for being a valued member!</p>
          </div>
          
          <h3 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">🎯 Take Action</h3>
          <a href="{{action.url}}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">
            Explore New Features
          </a>
        </div>
        
        <footer style="background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px;">
          <p>{{company.name}} • {{support.email}} • {{current.date}}</p>
          <p>You're receiving this because you're subscribed to our newsletter.</p>
        </footer>
      </div>
    `,
    variables: ['user.name', 'company.name', 'current.month', 'current.year', 'current.date', 'support.email', 'action.url'],
    type: 'marketing'
  }
];

export default function TemplateTester({ onTest, className }: TemplateTesterProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateTestData | null>(null);

  const handleTestTemplate = async (template: TemplateTestData) => {
    setIsTesting(true);
    setSelectedTemplate(template);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onTest) {
        onTest(template);
      }
      
      toast.success(`Template "${template.name}" loaded successfully!`);
    } catch (error) {
      toast.error('Failed to load template');
    } finally {
      setIsTesting(false);
      setSelectedTemplate(null);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'transactional': return 'bg-blue-100 text-blue-700';
      case 'marketing': return 'bg-green-100 text-green-700';
      case 'alert': return 'bg-red-100 text-red-700';
      case 'system': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Template Examples
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <TestTube className="h-4 w-4" />
          <AlertDescription>
            Load pre-built professional templates to get started quickly. These templates demonstrate real-world use cases with proper variable usage.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {sampleTemplates.map((template, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  <Badge variant="outline" className={getTypeColor(template.type)}>
                    {template.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {template.subject}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {template.variables.length} variables
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Professional
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Ready to use
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestTemplate(template)}
                  disabled={isTesting}
                  className="text-xs"
                >
                  {isTesting && selectedTemplate?.name === template.name ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Send className="h-3 w-3 mr-1" />
                      Load
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>💡 Click "Load" to populate the editor with sample data</span>
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Real Examples
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}