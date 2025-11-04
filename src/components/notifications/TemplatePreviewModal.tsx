'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  X, 
  Monitor, 
  Smartphone, 
  Code,
  Download,
  Send,
  Settings
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePreviewTemplate } from '@/hooks/useNotifications';
import { toast } from 'sonner';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId?: string;
  content: string;
  subject: string;
  variables: string[];
}

const sampleVariables = {
  'user.name': 'John Doe',
  'user.email': 'john.doe@example.com', 
  'user.firstName': 'John',
  'user.lastName': 'Doe',
  'company.name': 'Acme Corp',
  'company.website': 'https://acmecorp.com',
  'current.date': new Date().toLocaleDateString(),
  'current.year': new Date().getFullYear().toString(),
  'current.month': new Date().toLocaleDateString('en-US', { month: 'long' }),
  'notification.title': 'Welcome to Our Platform',
  'notification.message': 'Get started with your new account today',
  'action.url': 'https://dashboard.acmecorp.com/activate',
  'action.text': 'Activate Account',
  'support.email': 'support@acmecorp.com',
  'support.phone': '+1 (555) 123-4567'
};

export default function TemplatePreviewModal({ 
  isOpen, 
  onClose, 
  templateId,
  content, 
  subject, 
  variables 
}: TemplatePreviewModalProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showCode, setShowCode] = useState(false);
  const previewMutation = usePreviewTemplate();

  // Replace variables in content with sample data
  const processedContent = variables.reduce((acc, variable) => {
    const placeholder = `{{${variable}}}`;
    const sampleValue = sampleVariables[variable as keyof typeof sampleVariables] || `[${variable}]`;
    return acc.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), sampleValue.toString());
  }, content);

  const processedSubject = variables.reduce((acc, variable) => {
    const placeholder = `{{${variable}}}`;
    const sampleValue = sampleVariables[variable as keyof typeof sampleVariables] || `[${variable}]`;
    return acc.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), sampleValue.toString());
  }, subject);

  const handleServerPreview = async () => {
    if (!templateId) {
      toast.error('Template ID required for server preview');
      return;
    }

    try {
      const variableData = variables.reduce((acc, variable) => {
        acc[variable] = sampleVariables[variable as keyof typeof sampleVariables] || `[${variable}]`;
        return acc;
      }, {} as Record<string, any>);

      await previewMutation.mutateAsync({ id: templateId, variables: variableData });
      toast.success('Server preview generated successfully');
    } catch (error) {
      toast.error('Failed to generate server preview');
    }
  };

  const handleDownloadPreview = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${processedSubject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
          .email-container { max-width: 600px; margin: 0 auto; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <h2>${processedSubject}</h2>
          ${processedContent}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template-preview-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Preview downloaded successfully');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Template Preview
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Preview how your email template will appear to recipients
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {variables.length} Variables
              </Badge>
              <Badge variant={showCode ? 'default' : 'secondary'}>
                {showCode ? 'Code View' : 'Visual View'}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Controls */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('desktop')}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Desktop
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('mobile')}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile
              </Button>
              <Button
                variant={showCode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowCode(!showCode)}
              >
                <Code className="h-4 w-4 mr-2" />
                {showCode ? 'Hide Code' : 'Show Code'}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {templateId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleServerPreview}
                  disabled={previewMutation.isPending}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Server Preview
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPreview}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="h-[500px] overflow-auto border rounded-lg">
            {showCode ? (
              <div className="p-4 font-mono text-sm">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Subject:</h4>
                    <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                      {processedSubject}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">HTML Content:</h4>
                    <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                      {processedContent}
                    </pre>
                  </div>
                  {variables.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Variables Used:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {variables.map((variable) => (
                          <div key={variable} className="text-xs bg-muted p-2 rounded">
                            <code>{`{{${variable}}}`}</code> → <span className="text-green-600">{sampleVariables[variable as keyof typeof sampleVariables] || `[${variable}]`}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={`bg-gray-50 p-4 ${viewMode === 'mobile' ? 'max-w-sm mx-auto' : 'max-w-2xl mx-auto'}`}>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Email Header */}
                  <div className="bg-gray-100 p-3 border-b">
                    <div className="text-sm font-medium text-gray-600">Subject:</div>
                    <div className="text-base font-semibold">{processedSubject}</div>
                  </div>
                  
                  {/* Email Content */}
                  <div className="p-6">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: processedContent }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
            <div className="flex items-center gap-4">
              <span>Preview Mode: {viewMode}</span>
              <span>Variables: {variables.length}</span>
              <span>Content Length: {content.length} chars</span>
            </div>
            <span>Sample data is used for preview</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}