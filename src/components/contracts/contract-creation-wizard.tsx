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
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { User } from '@/types/users'
import { ContractTemplate, CreateContractDto } from '@/lib/types/contracts'
import { Loader2, FileText, User as UserIcon, Settings, ChevronLeft, ChevronRight } from 'lucide-react'

const contractFormSchema = z.object({
  templateId: z.string().min(1, 'Template is required'),
  userId: z.string().min(1, 'Customer is required'),
  title: z.string().min(1, 'Title is required').max(100),
  variables: z.record(z.string(), z.any()),
  locale: z.string(),
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

  const onFormSubmit = async (data: ContractFormValues) => {
    await onSubmit(data)
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
    { number: 1, title: 'Template', description: 'Choose template' },
    { number: 2, title: 'Details', description: 'Fill details' },
    { number: 3, title: 'Review', description: 'Review & create' },
  ]

  const getCustomerName = (customer: User) => {
    return `${customer.firstName} ${customer.lastName}`.trim() || customer.email
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl h-[90vh] w-[95vw] sm:w-full mx-auto p-4 sm:p-6 overflow-y-auto">
        <DialogHeader className="px-1 sm:px-0">
          <DialogTitle className="text-xl sm:text-2xl">Create New Contract</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Create a new contract by selecting a template and filling in the details.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps - Responsive */}
        <div className="flex items-center justify-between mb-6 px-1 sm:px-0">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.number
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.number}
                </div>
                <div className="mt-2 text-xs text-center space-y-1">
                  <div className="font-medium hidden xs:block">{step.title}</div>
                  <div className="text-muted-foreground hidden sm:block">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 sm:mx-4 min-w-4 ${
                    currentStep > step.number ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile Step Indicator */}
        <div className="sm:hidden flex items-center justify-between mb-4 px-1">
          <div className="text-sm font-medium">
            Step {currentStep} of 3: {steps[currentStep - 1].title}
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={prevStep}
              disabled={currentStep === 1 || isLoading}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextStep}
              disabled={currentStep === 3 || isLoading}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
            <ScrollArea className="h-[50vh] sm:h-[400px] pr-2 sm:pr-4 -mr-2 sm:mr-0">
              {/* Step 1: Template Selection */}
              {currentStep === 1 && (
                <div className="space-y-4 px-1 sm:px-0">
                  <FormField
                    control={form.control}
                    name="templateId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Contract Template</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            handleTemplateSelect(value)
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="text-sm sm:text-base">
                              <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {templates
                              .filter(template => template.isActive)
                              .map((template) => (
                                <SelectItem key={template.id} value={template.id} className="text-sm sm:text-base">
                                  <div className="flex items-center gap-2 py-1">
                                    <FileText className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{template.name}</span>
                                    {template.isDefault && (
                                      <Badge variant="secondary" className="ml-2 flex-shrink-0">
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
                    <div className="p-3 sm:p-4 border rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Template Preview</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">
                        {selectedTemplate.content.substring(0, 150)}...
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {selectedTemplate.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {selectedTemplate.variables.length} variables
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Contract Details */}
              {currentStep === 2 && selectedTemplate && (
                <div className="space-y-4 px-1 sm:px-0">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Contract Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter contract title" 
                            {...field} 
                            className="text-sm sm:text-base"
                          />
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
                        <FormLabel className="text-sm sm:text-base">Customer</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-sm sm:text-base">
                              <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id} className="text-sm sm:text-base">
                                <div className="flex items-center gap-2 py-1">
                                  <UserIcon className="h-4 w-4 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="truncate">{getCustomerName(customer)}</div>
                                    <div className="text-muted-foreground text-xs truncate">
                                      {customer.email}
                                    </div>
                                  </div>
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
                        <h4 className="font-medium text-sm sm:text-base">Contract Variables</h4>
                      </div>
                      
                      <div className="grid gap-3 sm:gap-4">
                        {selectedTemplate.variables.map((variable) => (
                          <FormField
                            key={variable.name}
                            control={form.control}
                            name={`variables.${variable.name}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm sm:text-base capitalize">
                                  {variable.name.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                  {variable.required && <span className="text-destructive ml-1">*</span>}
                                </FormLabel>
                                <FormControl>
                                  {variable.type === 'select' && variable.options ? (
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value as string}
                                    >
                                      <SelectTrigger className="text-sm sm:text-base">
                                        <SelectValue placeholder={`Select ${variable.name}`} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {variable.options.map((option) => (
                                          <SelectItem key={option} value={option} className="text-sm sm:text-base">
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
                                      <SelectTrigger className="text-sm sm:text-base">
                                        <SelectValue placeholder={`Select ${variable.name}`} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="true" className="text-sm sm:text-base">Yes</SelectItem>
                                        <SelectItem value="false" className="text-sm sm:text-base">No</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Input
                                      type={variable.type === 'number' ? 'number' : 'text'}
                                      placeholder={`Enter ${variable.name}`}
                                      {...field}
                                      value={field.value?.toString() || ''}
                                      onChange={(e) => field.onChange(variable.type === 'number' ? Number(e.target.value) : e.target.value)}
                                      className="text-sm sm:text-base"
                                    />
                                  )}
                                </FormControl>
                                {variable.description && (
                                  <FormDescription className="text-xs sm:text-sm">
                                    {variable.description}
                                  </FormDescription>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-4 px-1 sm:px-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Contract Details</h4>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Title:</dt>
                          <dd className="text-right font-medium">{form.watch('title')}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Template:</dt>
                          <dd className="text-right">{selectedTemplate?.name}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Customer:</dt>
                          <dd className="text-right">
                            {customers.find(c => c.id === form.watch('userId')) && 
                             getCustomerName(customers.find(c => c.id === form.watch('userId'))!)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Language:</dt>
                          <dd className="text-right">{form.watch('locale')}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Variables</h4>
                      <dl className="space-y-2 text-sm">
                        {Object.entries(form.watch('variables') || {}).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <dt className="text-muted-foreground capitalize flex-1 truncate pr-2">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                            </dt>
                            <dd className="text-right font-medium truncate max-w-[120px] sm:max-w-none">
                              {value?.toString()}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Preview</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      The contract will be created and available in your drafts. 
                      You can review it before sending to the customer.
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>

            <DialogFooter className="px-1 sm:px-0">
              <div className="flex justify-between w-full flex-col-reverse sm:flex-row gap-3 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={currentStep === 1 ? onCancel : prevStep}
                  disabled={isLoading}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  {currentStep === 1 ? 'Cancel' : 'Back'}
                </Button>
                
                <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
                  {currentStep < 3 ? (
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      className="w-full sm:w-auto"
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full sm:w-auto"
                    >
                      {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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