'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Save, 
  Eye, 
  Code, 
  Type,
  Variable,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
  GitCompare
} from 'lucide-react';
import { Template, CreateTemplateDto, UpdateTemplateDto } from '@/types/notifications';
import TemplatePreviewModal from './TemplatePreviewModal';
import { cn } from '@/lib/utils';

interface TemplateEditorProps {
  template?: Template;
  onSave: (data: CreateTemplateDto | UpdateTemplateDto) => Promise<void> | void;
  onPreview?: (content: string) => void;
  onCompare?: (formData: any) => void;
  isSaving?: boolean;
}

interface ValidationErrors {
  name?: string;
  subject?: string;
  content?: string;
  type?: string;
}

const availableVariables = [
  'user.name',
  'user.email',
  'user.firstName',
  'user.lastName',
  'company.name',
  'company.website',
  'current.date',
  'current.year',
  'current.month',
  'notification.title',
  'notification.message',
  'action.url',
  'action.text',
  'support.email',
  'support.phone'
];

const templateTypes = [
  { value: 'transactional', label: 'Transactional', description: 'Order confirmations, receipts, etc.' },
  { value: 'marketing', label: 'Marketing', description: 'Newsletters, promotions, announcements' },
  { value: 'alert', label: 'Alert', description: 'Security alerts, system notifications' },
  { value: 'system', label: 'System', description: 'System messages, maintenance notices' }
];

export default function TemplateEditor({ template, onSave, onPreview, onCompare, isSaving = false }: TemplateEditorProps) {
  const [name, setName] = useState(template?.name || '');
  const [subject, setSubject] = useState(template?.subject || '');
  const [content, setContent] = useState(template?.content || '');
  const [textContent, setTextContent] = useState(template?.textContent || '');
  const [type, setType] = useState(template?.type || 'transactional');
  const [isActive, setIsActive] = useState(template?.isActive ?? true);
  const [variables, setVariables] = useState<string[]>(template?.variables || []);
  const [activeTab, setActiveTab] = useState('editor');
  const [customVariable, setCustomVariable] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [hasChanges, setHasChanges] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Track changes for unsaved data warning
  useEffect(() => {
    const hasUnsavedChanges = 
      name !== (template?.name || '') ||
      subject !== (template?.subject || '') ||
      content !== (template?.content || '') ||
      textContent !== (template?.textContent || '') ||
      type !== (template?.type || 'transactional') ||
      isActive !== (template?.isActive ?? true) ||
      JSON.stringify(variables) !== JSON.stringify(template?.variables || []);
    
    setHasChanges(hasUnsavedChanges);
  }, [name, subject, content, textContent, type, isActive, variables, template]);

  // Auto-extract variables from content
  useEffect(() => {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const foundVariables = new Set<string>();
    let match;
    
    while ((match = variableRegex.exec(content)) !== null) {
      foundVariables.add(match[1].trim());
    }
    
    // Only update if variables have actually changed
    const newVariables = Array.from(foundVariables);
    if (JSON.stringify(newVariables.sort()) !== JSON.stringify(variables.sort())) {
      setVariables(newVariables);
    }
  }, [content]);

  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Template name is required';
    } else if (name.length < 3) {
      newErrors.name = 'Template name must be at least 3 characters';
    } else if (name.length > 100) {
      newErrors.name = 'Template name must be less than 100 characters';
    }

    if (!subject.trim()) {
      newErrors.subject = 'Email subject is required';
    } else if (subject.length > 200) {
      newErrors.subject = 'Subject must be less than 200 characters';
    }

    if (!content.trim()) {
      newErrors.content = 'Email content is required';
    } else if (content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    }

    if (!type) {
      newErrors.type = 'Template type is required';
    }

    return newErrors;
  };

  const handleAddVariable = (variable: string) => {
    // Insert variable at cursor position
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = content.substring(0, start) + `{{${variable}}}` + content.substring(end);
      setContent(newContent);
      
      // Focus back to textarea
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };

  const handleRemoveVariable = (variable: string) => {
    // Remove variable from content as well
    const placeholder = `{{${variable}}}`;
    setContent(prev => prev.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), ''));
  };

  const handleAddCustomVariable = () => {
    if (customVariable.trim()) {
      const variable = customVariable.trim();
      handleAddVariable(variable);
      setCustomVariable('');
    }
  };

  const handleSave = async () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const templateData: CreateTemplateDto | UpdateTemplateDto = {
      name: name.trim(),
      subject: subject.trim(),
      content: content.trim(),
      textContent: textContent.trim() || undefined,
      variables: variables,
      type: type as any,
      isActive,
    };

    try {
      await onSave(templateData);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const generateTextVersion = () => {
    // Simple HTML to text conversion
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textVersion = tempDiv.textContent || tempDiv.innerText || '';
    setTextContent(textVersion);
  };

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Editor */}
        <div className="lg:col-span-3 space-y-6">
          {/* Changes Alert */}
          {hasChanges && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                You have unsaved changes. Don't forget to save your template.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    Template Editor
                  </CardTitle>
                  <CardDescription>
                    Create and edit your email template with rich text and variables
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {template && (
                    <Badge variant="outline">
                      Editing: {template.name}
                    </Badge>
                  )}
                  <Badge variant={isActive ? 'default' : 'secondary'}>
                    {isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className={cn(errors.name && 'text-red-500')}>
                    Template Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Welcome Email"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={cn(errors.name && 'border-red-500')}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className={cn(errors.type && 'text-red-500')}>
                    Template Type *
                  </Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className={cn(errors.type && 'border-red-500')}>
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateTypes.map((templateType) => (
                        <SelectItem key={templateType.value} value={templateType.value}>
                          <div>
                            <div className="font-medium">{templateType.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {templateType.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.type}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject" className={cn(errors.subject && 'text-red-500')}>
                  Email Subject *
                </Label>
                <Input
                  id="subject"
                  placeholder="Welcome to Our Platform!"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={cn(errors.subject && 'border-red-500')}
                />
                {errors.subject && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.subject}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {subject.length}/200 characters
                </p>
              </div>
              
              {/* Content Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content" className={cn(errors.content && 'text-red-500')}>
                    Email Content *
                  </Label>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Code className="h-3 w-3" />
                      HTML supported
                    </div>
                    <div className="flex items-center gap-1">
                      <Variable className="h-3 w-3" />
                      {variables.length} variables
                    </div>
                  </div>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="editor">HTML Editor</TabsTrigger>
                    <TabsTrigger value="text">Text Version</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="editor" className="space-y-2">
                    <Textarea
                      ref={textareaRef}
                      id="content"
                      placeholder={`Write your email content here... You can use variables like {{user.name}}

Example:
<h1>Welcome {{user.name}}!</h1>
<p>Thanks for joining {{company.name}}. Your account is now active.</p>
<a href="{{action.url}}">Get Started</a>`}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className={cn(
                        "min-h-[400px] font-mono text-sm resize-none",
                        errors.content && 'border-red-500'
                      )}
                    />
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">Use the variables panel to insert dynamic content</span>
                        {variables.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {variables.length} variables detected
                          </Badge>
                        )}
                      </div>
                      <span className="text-muted-foreground">{content.length} characters</span>
                    </div>
                    {errors.content && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.content}
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="text" className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm">Text Version (Optional)</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateTextVersion}
                        disabled={!content.trim()}
                      >
                        Generate from HTML
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Plain text version of your email for better compatibility..."
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      className="min-h-[400px] text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Text version ensures your email displays correctly for recipients who can't view HTML emails
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="preview">
                    <div className="border rounded-lg p-6 min-h-[400px] bg-white">
                      <div className="max-w-2xl mx-auto">
                        {/* Email Header Simulation */}
                        <div className="border-b pb-4 mb-6">
                          <div className="text-sm text-muted-foreground mb-1">Subject:</div>
                          <div className="font-medium text-lg">{subject || 'Email Subject'}</div>
                        </div>
                        
                        {/* Content Preview */}
                        <div className="prose prose-sm max-w-none">
                          {content ? (
                            <div dangerouslySetInnerHTML={{ __html: content }} />
                          ) : (
                            <p className="text-muted-foreground italic">
                              Enter content in the HTML Editor to see preview
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="font-medium">Template Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {isActive ? 'Template is active and can be used for sending emails' : 'Template is inactive and cannot be used'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => setIsActive(!isActive)}
                  className="min-w-24"
                >
                  {isActive ? 'Active' : 'Inactive'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Variables Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Variable className="h-4 w-4" />
                Variables ({variables.length})
              </CardTitle>
              <CardDescription>
                Insert dynamic content into your template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Available Variables */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Available Variables</Label>
                <div className="space-y-1 max-h-60 overflow-y-auto pr-2">
                  {availableVariables.map((variable) => (
                    <div
                      key={variable}
                      className="flex items-center justify-between p-2 rounded-lg border text-sm hover:bg-muted/50 cursor-pointer transition-colors group"
                      onClick={() => handleAddVariable(variable)}
                    >
                      <code className="text-xs font-mono bg-muted/50 px-1 rounded">
                        {`{{${variable}}}`}
                      </code>
                      <Plus className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Variables */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Add Custom Variable</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., order.number"
                    value={customVariable}
                    onChange={(e) => setCustomVariable(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomVariable()}
                    className="flex-1 text-sm"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleAddCustomVariable}
                    disabled={!customVariable.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Create custom variables for specific use cases
                </p>
              </div>

              {/* Detected Variables */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Detected Variables</Label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {variables.length === 0 ? (
                    <div className="text-center py-4 border border-dashed rounded-lg">
                      <Variable className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No variables detected
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add variables from the list above
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {variables.map((variable) => (
                        <div
                          key={variable}
                          className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg group"
                        >
                          <code className="text-xs font-mono text-green-700 bg-green-100 px-1 rounded">
                            {variable}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveVariable(variable)}
                            className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {template ? 'Update' : 'Create'}
                      </>
                    )}
                  </Button>
                  
                  {template && onCompare && (
                    <Button 
                      variant="outline"
                      onClick={() => onCompare({
                        name,
                        subject,
                        content,
                        type,
                        isActive,
                        variables
                      })}
                      disabled={isSaving}
                    >
                      <GitCompare className="h-4 w-4 mr-2" />
                      Compare Changes
                    </Button>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handlePreview}
                  disabled={!content.trim() || !subject.trim()}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Advanced Preview
                </Button>

                {/* Template Info */}
                <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Template Type:</span>
                    <Badge variant="outline" className="text-xs">
                      {templateTypes.find(t => t.value === type)?.label || type}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Variables:</span>
                    <span>{variables.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Content Length:</span>
                    <span>{content.length} chars</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      <TemplatePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        templateId={template?.id}
        content={content}
        subject={subject}
        variables={variables}
      />
    </>
  );
}