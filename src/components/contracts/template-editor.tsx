import React, { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TemplateVariablesManager } from '@/components/contracts/template-variables-manager'
import { ContractTemplate, CreateTemplateDto, UpdateTemplateDto, TemplateVariable } from '@/lib/types/contracts'
import { Loader2, Eye, Code, Settings } from 'lucide-react'

const templateFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  content: z.string().min(1, 'Content is required'),
  type: z.string().min(1, 'Type is required'),
  locale: z.string().min(1, 'Locale is required'),
  variables: z.array(z.any()),
  termsVersion: z.string().min(1, 'Terms version is required'),
  privacyVersion: z.string().min(1, 'Privacy version is required'),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
})

type TemplateFormValues = z.infer<typeof templateFormSchema>

interface TemplateEditorProps {
  template?: ContractTemplate
  onSave: (data: CreateTemplateDto | UpdateTemplateDto) => Promise<void>
  onPreview: (content: string, variables: Record<string, any>) => void
  onCancel: () => void
  isLoading?: boolean
}

export function TemplateEditor({
  template,
  onSave,
  onPreview,
  onCancel,
  isLoading = false
}: TemplateEditorProps) {
  const [activeTab, setActiveTab] = useState('content')
  const [variables, setVariables] = useState<TemplateVariable[]>(
    template?.variables || []
  )

  const isEditing = !!template

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: template?.name || '',
      content: template?.content || '',
      type: template?.type || 'standard',
      locale: template?.locale || 'en-US',
      variables: template?.variables || [],
      termsVersion: template?.termsVersion || '1.0',
      privacyVersion: template?.privacyVersion || '1.0',
      isActive: template?.isActive ?? true,
      isDefault: template?.isDefault ?? false,
    },
  })

  const extractVariablesFromContent = useCallback((content: string): TemplateVariable[] => {
    const variableRegex = /{{(\w+)}}/g
    const matches = content.matchAll(variableRegex)
    const variableNames = new Set<string>()
    
    for (const match of matches) {
      variableNames.add(match[1])
    }

    const existingVariables = new Map(variables.map(v => [v.name, v]))
    
    return Array.from(variableNames).map(name => {
      const existing = existingVariables.get(name)
      return existing || {
        name,
        type: 'text',
        required: false,
        description: `Variable: ${name}`
      }
    })
  }, [variables])

  const handleContentChange = (content: string) => {
    form.setValue('content', content)
    
    // Auto-extract variables when content changes
    const extractedVariables = extractVariablesFromContent(content)
    if (extractedVariables.length > variables.length) {
      setVariables(extractedVariables)
    }
  }

  const handleVariablesChange = (newVariables: TemplateVariable[]) => {
    setVariables(newVariables)
    form.setValue('variables', newVariables)
  }

  const onFormSubmit = (data: TemplateFormValues) => {
    const saveData = {
      ...data,
      variables: variables,
      ...(isEditing && { id: template.id })
    }
    
    onSave(saveData)
  }

  const handlePreview = () => {
    const content = form.getValues('content')
    const testVariables: Record<string, any> = {}
    
    variables.forEach(variable => {
      testVariables[variable.name] = variable.defaultValue || `[${variable.name}]`
    })
    
    onPreview(content, testVariables)
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update your contract template and variables.' 
              : 'Create a new contract template with dynamic variables.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter template name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., standard, service, agreement" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="locale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., en-US, fr-FR" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 flex-1">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Make this template available for use
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 flex-1">
                      <div className="space-y-0.5">
                        <FormLabel>Default</FormLabel>
                        <FormDescription>
                          Set as default for this type
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="variables" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Variables
                  {variables.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                      {variables.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Content</FormLabel>
                      <FormDescription className="flex items-center gap-2 mb-2">
                        Use {'{{variableName}}'} for dynamic variables
                        <Badge variant="outline" className="text-xs">
                          {variables.length} variables detected
                        </Badge>
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your contract template content here..."
                          className="min-h-[400px] font-mono text-sm"
                          {...field}
                          onChange={(e) => handleContentChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handlePreview}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Template
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      const extracted = extractVariablesFromContent(form.getValues('content'))
                      setVariables(extracted)
                      setActiveTab('variables')
                    }}
                  >
                    Extract Variables
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="variables" className="space-y-4">
                <TemplateVariablesManager
                  variables={variables}
                  onVariablesChange={handleVariablesChange}
                />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="termsVersion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms Version</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 1.0, 2.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="privacyVersion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Privacy Version</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 1.0, 2.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? 'Update Template' : 'Create Template'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}