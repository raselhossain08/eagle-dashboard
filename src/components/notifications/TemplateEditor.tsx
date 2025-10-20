'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  X
} from 'lucide-react';
import { Template, CreateTemplateDto, UpdateTemplateDto } from '@/types/notifications';

interface TemplateEditorProps {
  template?: Template;
  onSave: (data: CreateTemplateDto | UpdateTemplateDto) => void;
  onPreview?: (content: string) => void;
  isSaving?: boolean;
}

const availableVariables = [
  'user.name',
  'user.email',
  'company.name',
  'current.date',
  'current.year',
  'notification.title',
  'notification.message',
  'action.url'
];

export default function TemplateEditor({ template, onSave, onPreview, isSaving = false }: TemplateEditorProps) {
  const [name, setName] = useState(template?.name || '');
  const [subject, setSubject] = useState(template?.subject || '');
  const [content, setContent] = useState(template?.content || '');
  const [variables, setVariables] = useState<string[]>(template?.variables || []);
  const [activeTab, setActiveTab] = useState('editor');
  const [customVariable, setCustomVariable] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAddVariable = (variable: string) => {
    if (!variables.includes(variable)) {
      setVariables(prev => [...prev, variable]);
    }
    
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
    setVariables(prev => prev.filter(v => v !== variable));
  };

  const handleAddCustomVariable = () => {
    if (customVariable.trim() && !variables.includes(customVariable.trim())) {
      setVariables(prev => [...prev, customVariable.trim()]);
      setCustomVariable('');
    }
  };

  const handleSave = () => {
    if (!name.trim() || !subject.trim() || !content.trim()) {
      return;
    }

    const templateData = {
      name: name.trim(),
      subject: subject.trim(),
      content: content.trim(),
      variables,
    };

    onSave(templateData);
  };

  const handlePreview = () => {
    onPreview?.(content);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Editor */}
      <div className="lg:col-span-3 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Template Editor</CardTitle>
            <CardDescription>
              Create and edit your email template with rich text and variables
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                placeholder="Welcome Email"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                placeholder="Welcome to Our Platform!"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Email Content</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Type className="h-4 w-4" />
                  Supports HTML and template variables
                </div>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="editor" className="space-y-2">
                  <Textarea
                    ref={textareaRef}
                    id="content"
                    placeholder="Write your email content here... You can use variables like {{user.name}}"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Use the variables panel to insert dynamic content</span>
                    <span>{content.length} characters</span>
                  </div>
                </TabsContent>
                <TabsContent value="preview">
                  <div className="border rounded-lg p-4 min-h-[400px] bg-muted/50">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <h3>{subject}</h3>
                      <div dangerouslySetInnerHTML={{ __html: content }} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
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
              Variables
            </CardTitle>
            <CardDescription>
              Insert dynamic content into your template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Available Variables */}
            <div className="space-y-2">
              <Label>Available Variables</Label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {availableVariables.map((variable) => (
                  <div
                    key={variable}
                    className="flex items-center justify-between p-2 rounded-lg border text-sm hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleAddVariable(variable)}
                  >
                    <code className="text-xs">{`{{${variable}}}`}</code>
                    <Plus className="h-3 w-3 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Variables */}
            <div className="space-y-2">
              <Label>Custom Variables</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="variable.name"
                  value={customVariable}
                  onChange={(e) => setCustomVariable(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCustomVariable()}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleAddCustomVariable}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Selected Variables */}
            <div className="space-y-2">
              <Label>Selected Variables</Label>
              <div className="space-y-1">
                {variables.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No variables selected
                  </p>
                ) : (
                  variables.map((variable) => (
                    <Badge
                      key={variable}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      <code className="text-xs">{variable}</code>
                      <button
                        onClick={() => handleRemoveVariable(variable)}
                        className="hover:bg-muted-foreground/20 rounded-sm"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={handleSave}
                disabled={isSaving || !name.trim() || !subject.trim() || !content.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handlePreview}
                disabled={!content.trim()}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}