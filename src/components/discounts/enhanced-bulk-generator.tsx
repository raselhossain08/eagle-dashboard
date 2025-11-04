// components/discounts/enhanced-bulk-generator.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { CreateDiscountDto } from '@/types/discounts';
import { BulkGenerationTemplate } from '@/lib/api/bulk-discount.service';
import { 
  useBulkDiscountGeneration, 
  useBulkDiscountPreview, 
  useBulkDiscountValidation,
  useCodeGenerationSuggestions
} from '@/hooks/use-bulk-discounts';
import { useActivePlans } from '@/hooks/use-plans';
import { useActiveCampaigns } from '@/hooks/use-campaigns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Copy, 
  X, 
  Wand2, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Settings,
  Eye,
  Sparkles,
  Target,
  Library
} from 'lucide-react';
import { BulkTemplateLibrary } from '@/components/discounts/bulk-template-library';

interface EnhancedBulkGeneratorProps {
  onSuccess?: (result: any) => void;
  maxCount?: number;
}

export function EnhancedBulkGenerator({ 
  onSuccess, 
  maxCount = 1000 
}: EnhancedBulkGeneratorProps) {
  // Template state
  const [template, setTemplate] = useState<CreateDiscountDto>({
    code: '', // Will be generated
    description: '',
    type: 'percentage',
    value: 10,
    currency: 'USD',
    duration: 'once',
    applicablePlans: [],
    applicableProducts: [],
    maxRedemptions: 100,
    isActive: true,
    newCustomersOnly: false,
    eligibleCountries: [],
    eligibleEmailDomains: [],
    minAmount: 0,
    isStackable: false,
    priority: 1,
    maxUsesPerCustomer: 1,
  });

  // Generation settings
  const [generationSettings, setGenerationSettings] = useState({
    count: 10,
    prefix: '',
    suffix: '',
    enableRandomization: false,
    valueVariation: {
      enabled: false,
      minValue: 5,
      maxValue: 25,
    },
    expirationSettings: {
      useCustomExpiry: false,
      daysFromCreation: 30,
    },
  });

  // UI state
  const [previewCodes, setPreviewCodes] = useState<string[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [businessContext, setBusinessContext] = useState({
    businessType: '',
    campaignType: '',
    targetAudience: '',
    seasonality: '',
  });

  // API hooks
  const bulkGeneration = useBulkDiscountGeneration();
  const previewMutation = useBulkDiscountPreview();
  const validation = useBulkDiscountValidation();
  const suggestions = useCodeGenerationSuggestions();
  
  // Data hooks
  const { data: plans, isLoading: isLoadingPlans } = useActivePlans();
  const { data: campaigns, isLoading: isLoadingCampaigns } = useActiveCampaigns();

  // Memoized template for API calls
  const bulkTemplate: BulkGenerationTemplate = useMemo(() => ({
    baseTemplate: template,
    count: generationSettings.count,
    prefix: generationSettings.prefix,
    suffix: generationSettings.suffix,
    enableRandomization: generationSettings.enableRandomization,
    valueVariation: generationSettings.valueVariation.enabled ? generationSettings.valueVariation : undefined,
    expirationSettings: generationSettings.expirationSettings.useCustomExpiry ? {
      useCustomExpiry: true,
      daysFromCreation: generationSettings.expirationSettings.daysFromCreation,
    } : undefined,
  }), [template, generationSettings]);

  // Auto-validate when template changes
  useEffect(() => {
    if (template.type && generationSettings.count > 0) {
      validation.mutate(bulkTemplate);
    }
  }, [bulkTemplate]);

  // Handle preview generation
  const handlePreview = async () => {
    try {
      const result = await previewMutation.mutateAsync(bulkTemplate);
      setPreviewCodes(result.previewCodes);
      setValidationResult(result.validation);
    } catch (error) {
      console.error('Preview failed:', error);
    }
  };

  // Handle bulk generation
  const handleGenerate = async () => {
    try {
      const result = await bulkGeneration.mutateAsync(bulkTemplate);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  // Handle getting suggestions
  const handleGetSuggestions = async () => {
    try {
      const result = await suggestions.mutateAsync(businessContext);
      if (result.suggestedTemplates.length > 0) {
        const suggested = result.suggestedTemplates[0];
        setTemplate(prev => ({ ...prev, ...suggested }));
      }
      if (result.suggestedPrefixes.length > 0) {
        setGenerationSettings(prev => ({ 
          ...prev, 
          prefix: result.suggestedPrefixes[0] 
        }));
      }
    } catch (error) {
      console.error('Suggestions failed:', error);
    }
  };

  // Update template field
  const updateTemplate = (field: keyof CreateDiscountDto, value: any) => {
    setTemplate(prev => ({ ...prev, [field]: value }));
  };

  // Update generation settings
  const updateGenerationSettings = (field: string, value: any) => {
    setGenerationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Copy codes to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(previewCodes.join('\n'));
  };

  // Download CSV
  const downloadCSV = () => {
    const csvContent = previewCodes.map(code => `"${code}"`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discount-codes-preview-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const isLoading = bulkGeneration.isPending || previewMutation.isPending;
  const hasValidationErrors = validationResult && !validationResult.isValid;

  return (
    <div className="space-y-6">
      {/* Smart Suggestions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Smart Generation Assistant
          </CardTitle>
          <CardDescription>
            Get intelligent suggestions for your bulk discount generation based on your business context
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Business Type</Label>
              <Select 
                value={businessContext.businessType} 
                onValueChange={(value) => setBusinessContext(prev => ({ ...prev, businessType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Campaign Type</Label>
              <Select 
                value={businessContext.campaignType} 
                onValueChange={(value) => setBusinessContext(prev => ({ ...prev, campaignType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promotional">Promotional</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                  <SelectItem value="loyalty">Loyalty</SelectItem>
                  <SelectItem value="affiliate">Affiliate</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select 
                value={businessContext.targetAudience} 
                onValueChange={(value) => setBusinessContext(prev => ({ ...prev, targetAudience: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_customers">New Customers</SelectItem>
                  <SelectItem value="existing_customers">Existing Customers</SelectItem>
                  <SelectItem value="vip_customers">VIP Customers</SelectItem>
                  <SelectItem value="inactive_customers">Inactive Customers</SelectItem>
                  <SelectItem value="all_customers">All Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Seasonality</Label>
              <Select 
                value={businessContext.seasonality} 
                onValueChange={(value) => setBusinessContext(prev => ({ ...prev, seasonality: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spring">Spring</SelectItem>
                  <SelectItem value="summer">Summer</SelectItem>
                  <SelectItem value="fall">Fall</SelectItem>
                  <SelectItem value="winter">Winter</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="back_to_school">Back to School</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGetSuggestions}
            disabled={suggestions.isPending}
            className="mt-4"
            variant="outline"
          >
            {suggestions.isPending ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Getting Suggestions...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Get Smart Suggestions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Validation Status */}
      {validation.data && (
        <Alert className={validation.data.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {validation.data.isValid ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription>
            {validation.data.isValid ? (
              <span className="text-green-800">Template is valid and ready for generation</span>
            ) : (
              <div className="space-y-1 text-red-800">
                <p className="font-medium">Template validation failed:</p>
                {validation.data.errors.map((error: string, index: number) => (
                  <p key={index} className="text-sm">• {error}</p>
                ))}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Configuration */}
      <Tabs defaultValue="template" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="library">Template Library</TabsTrigger>
          <TabsTrigger value="template">Template Settings</TabsTrigger>
          <TabsTrigger value="generation">Generation Options</TabsTrigger>
          <TabsTrigger value="preview">Preview & Test</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Library className="h-5 w-5" />
                Template Library
              </CardTitle>
              <CardDescription>
                Choose from our collection of proven discount templates designed for different business scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BulkTemplateLibrary
                onTemplateSelect={(selectedTemplate) => {
                  // Apply the selected template to our current template
                  setTemplate(prev => ({
                    ...prev,
                    ...selectedTemplate.template
                  }));
                  
                  // Apply suggested prefix
                  setGenerationSettings(prev => ({
                    ...prev,
                    prefix: selectedTemplate.suggestedPrefix
                  }));
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="template" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Discount Template Configuration
              </CardTitle>
              <CardDescription>
                Configure the base template that will be used for all generated codes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template form fields - similar to discount form but simplified */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select 
                    value={template.type} 
                    onValueChange={(value: any) => updateTemplate('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                      <SelectItem value="free_trial">Free Trial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Discount Value</Label>
                  <Input
                    type="number"
                    value={template.value}
                    onChange={(e) => updateTemplate('value', parseFloat(e.target.value))}
                    placeholder={template.type === 'percentage' ? '10' : '5.00'}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Redemptions (per code)</Label>
                  <Input
                    type="number"
                    value={template.maxRedemptions}
                    onChange={(e) => updateTemplate('maxRedemptions', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Uses Per Customer</Label>
                  <Input
                    type="number"
                    value={template.maxUsesPerCustomer}
                    onChange={(e) => updateTemplate('maxUsesPerCustomer', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={template.description || ''}
                  onChange={(e) => updateTemplate('description', e.target.value)}
                  placeholder="Brief description of the discount"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={template.newCustomersOnly}
                  onCheckedChange={(checked) => updateTemplate('newCustomersOnly', checked)}
                />
                <Label>New Customers Only</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Generation Settings
              </CardTitle>
              <CardDescription>
                Configure how the codes will be generated and formatted
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Number of Codes</Label>
                  <Input
                    type="number"
                    min="1"
                    max={maxCount}
                    value={generationSettings.count}
                    onChange={(e) => updateGenerationSettings('count', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum {maxCount} codes per batch
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Code Prefix</Label>
                  <Input
                    value={generationSettings.prefix}
                    onChange={(e) => updateGenerationSettings('prefix', e.target.value.toUpperCase())}
                    placeholder="SUMMER"
                  />
                  <p className="text-sm text-muted-foreground">
                    Preview: {generationSettings.prefix || 'CODE'}_XXXXX
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={generationSettings.enableRandomization}
                    onCheckedChange={(checked) => updateGenerationSettings('enableRandomization', checked)}
                  />
                  <Label>Enable Value Randomization</Label>
                </div>

                {generationSettings.enableRandomization && (
                  <Card className="p-4 bg-muted/50">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={generationSettings.valueVariation.enabled}
                          onCheckedChange={(checked) => updateGenerationSettings('valueVariation', { 
                            ...generationSettings.valueVariation, 
                            enabled: checked 
                          })}
                        />
                        <Label>Randomize Discount Values</Label>
                      </div>

                      {generationSettings.valueVariation.enabled && (
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Min Value</Label>
                            <Input
                              type="number"
                              value={generationSettings.valueVariation.minValue}
                              onChange={(e) => updateGenerationSettings('valueVariation', {
                                ...generationSettings.valueVariation,
                                minValue: parseFloat(e.target.value)
                              })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Max Value</Label>
                            <Input
                              type="number"
                              value={generationSettings.valueVariation.maxValue}
                              onChange={(e) => updateGenerationSettings('valueVariation', {
                                ...generationSettings.valueVariation,
                                maxValue: parseFloat(e.target.value)
                              })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview Generated Codes
              </CardTitle>
              <CardDescription>
                Preview how your codes will look before generating the full batch
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button 
                  onClick={handlePreview}
                  disabled={previewMutation.isPending || hasValidationErrors}
                  variant="outline"
                >
                  {previewMutation.isPending ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Generating Preview...
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Generate Preview
                    </>
                  )}
                </Button>

                <Button 
                  onClick={handleGenerate}
                  disabled={isLoading || hasValidationErrors || previewCodes.length === 0}
                >
                  {bulkGeneration.isPending ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Generating {generationSettings.count} Codes...
                    </>
                  ) : (
                    `Generate ${generationSettings.count} Codes`
                  )}
                </Button>
              </div>

              {bulkGeneration.isPending && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Generating codes...</span>
                    <span>Please wait</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              )}

              {previewCodes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Preview: {previewCodes.length} codes
                    </p>
                    <div className="flex space-x-2">
                      <Button onClick={copyToClipboard} variant="outline" size="sm">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy All
                      </Button>
                      <Button onClick={downloadCSV} variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export Preview
                      </Button>
                    </div>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto border rounded-lg p-4 bg-muted/30">
                    <div className="grid grid-cols-2 gap-2">
                      {previewCodes.map((code, index) => (
                        <Badge key={index} variant="secondary" className="font-mono">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Additional configuration options for power users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={generationSettings.expirationSettings.useCustomExpiry}
                    onCheckedChange={(checked) => updateGenerationSettings('expirationSettings', {
                      ...generationSettings.expirationSettings,
                      useCustomExpiry: checked
                    })}
                  />
                  <Label>Set Custom Expiration</Label>
                </div>

                {generationSettings.expirationSettings.useCustomExpiry && (
                  <div className="space-y-2">
                    <Label>Days Until Expiration</Label>
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={generationSettings.expirationSettings.daysFromCreation}
                      onChange={(e) => updateGenerationSettings('expirationSettings', {
                        ...generationSettings.expirationSettings,
                        daysFromCreation: parseInt(e.target.value)
                      })}
                    />
                    <p className="text-sm text-muted-foreground">
                      Codes will expire {generationSettings.expirationSettings.daysFromCreation} days after creation
                    </p>
                  </div>
                )}

                {/* Plans targeting */}
                {!isLoadingPlans && plans && plans.length > 0 && (
                  <div className="space-y-2">
                    <Label>Applicable Plans (Optional)</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                      {plans.map((plan: any) => (
                        <div key={plan.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`plan-${plan.id}`}
                            checked={template.applicablePlans.includes(plan.id)}
                            onChange={(e) => {
                              const planIds = e.target.checked
                                ? [...template.applicablePlans, plan.id]
                                : template.applicablePlans.filter(id => id !== plan.id);
                              updateTemplate('applicablePlans', planIds);
                            }}
                          />
                          <Label htmlFor={`plan-${plan.id}`} className="text-sm">
                            {plan.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}