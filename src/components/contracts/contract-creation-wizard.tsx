import React, { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { User, ContractTemplate, CreateContractDto } from '@/lib/types/contracts'
import { useCreateContract } from '@/hooks/use-contracts'
import { Loader2, FileText, User as UserIcon, Settings } from 'lucide-react'

const contractFormSchema = z.object({
  templateId: z.string().min(1, 'Template is required'),
  userId: z.string().min(1, 'Customer is required'),
  title: z.string().min(1, 'Title is required').max(100),
  variables: z.record(z.any()),
  locale: z.string().default('en-US'),
  subscriptionId: z.string().optional(),
})

type ContractFormValues = z.infer<typeof contractFormSchema>

interface ContractCreationWizardProps {
  templates: ContractTemplate[]
  customers: User[]
  onSubmit: (data: CreateContractDto) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  open?: boolean
}

export function ContractCreationWizard({
  templates,
  customers,
  onSubmit,
  onCancel,
  isLoading = false,
  open = true
}: ContractCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate>()

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      title: '',
      locale: 'en-US',
      variables: {},
    },
  })

  const { mutate: createContract, isPending } = useCreateContract()

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    setSelectedTemplate(template)
    
    // Initialize variables with default values
    if (template) {
      const initialVariables: Record<string, any> = {}
      template.variables.forEach(variable => {
        if (variable.defaultValue !== undefined) {
          initialVariables[variable.name] = variable.defaultValue
        }
      })
      
      form.setValue('templateId', templateId)
      form.setValue('variables', initialVariables)
      
      // Auto-generate title if not set
      if (!form.getValues('title')) {
        form.setValue('title', `${template.name} Contract`)
      }
    }
  }

  const onFormSubmit = (data: ContractFormValues) => {
    createContract(data, {
      onSuccess: () => {
        onCancel()
        form.reset()
        setCurrentStep(1)
        setSelectedTemplate(undefined)
      }
    })
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const steps = [
    { number: 1, title: 'Template', description: 'Choose a template' },
    { number: 2, title: 'Details', description: 'Fill contract details' },
    { number: 3, title: 'Review', description: 'Review and create' },
  ]

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Contract</DialogTitle>
          <DialogDescription>
            Create a new contract by selecting a template and filling in the details.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.number
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.number}
                </div>
                <div className="mt-2 text-xs text-center">
                  <div className="font-medium">{step.title}</div>
                  <div className="text-muted-foreground">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
            <ScrollArea className="h-[400px] pr-4">
              {/* Step 1: Template Selection */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="templateId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Template</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            handleTemplateSelect(value)
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {templates
                              .filter(template => template.isActive)
                              .map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    {template.name}
                                    {template.isDefault && (
                                      <Badge variant="secondary" className="ml-2">
                                        Default
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedTemplate && (
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-2">Template Preview</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedTemplate.content.substring(0, 200)}...
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{selectedTemplate.type}</Badge>
                        <Badge variant="outline">{selectedTemplate.locale}</Badge>
                        <Badge variant="outline">
                          {selectedTemplate.variables.length} variables
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Contract Details */}
              {currentStep === 2 && selectedTemplate && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contract title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                <div className="flex items-center gap-2">
                                  <UserIcon className="h-4 w-4" />
                                  {customer.name}
                                  <span className="text-muted-foreground">
                                    ({customer.email})
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dynamic Variables */}
                  {selectedTemplate.variables.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <h4 className="font-medium">Contract Variables</h4>
                      </div>
                      
                      {selectedTemplate.variables.map((variable) => (
                        <FormField
                          key={variable.name}
                          control={form.control}
                          name={`variables.${variable.name}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="capitalize">
                                {variable.name.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                {variable.required && <span className="text-destructive ml-1">*</span>}
                              </FormLabel>
                              <FormControl>
                                {variable.type === 'select' && variable.options ? (
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder={`Select ${variable.name}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {variable.options.map((option) => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : variable.type === 'boolean' ? (
                                  <Select
                                    onValueChange={(value) => field.onChange(value === 'true')}
                                    defaultValue={field.value?.toString()}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder={`Select ${variable.name}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="true">Yes</SelectItem>
                                      <SelectItem value="false">No</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input
                                    type={variable.type === 'number' ? 'number' : 'text'}
                                    placeholder={`Enter ${variable.name}`}
                                    {...field}
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                  />
                                )}
                              </FormControl>
                              {variable.description && (
                                <FormDescription>
                                  {variable.description}
                                </FormDescription>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Contract Details</h4>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Title:</dt>
                          <dd>{form.watch('title')}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Template:</dt>
                          <dd>{selectedTemplate?.name}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Customer:</dt>
                          <dd>
                            {customers.find(c => c.id === form.watch('userId'))?.name}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Language:</dt>
                          <dd>{form.watch('locale')}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Variables</h4>
                      <dl className="space-y-2 text-sm">
                        {Object.entries(form.watch('variables') || {}).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <dt className="text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                            </dt>
                            <dd>{value?.toString()}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">Preview</h4>
                    <p className="text-sm text-muted-foreground">
                      The contract will be created and available in your drafts. 
                      You can review it before sending to the customer.
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>

            <DialogFooter>
              <div className="flex justify-between w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={currentStep === 1 ? onCancel : prevStep}
                  disabled={isPending}
                >
                  {currentStep === 1 ? 'Cancel' : 'Back'}
                </Button>
                
                <div className="flex gap-2">
                  {currentStep < 3 ? (
                    <Button type="button" onClick={nextStep}>
                      Continue
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isPending}>
                      {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Contract
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}