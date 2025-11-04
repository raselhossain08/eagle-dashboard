// components/discounts/bulk-template-library.tsx
'use client';

import { useState } from 'react';
import { CreateDiscountDto } from '@/types/discounts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Percent, 
  DollarSign, 
  Gift, 
  Users, 
  Star, 
  Zap,
  Calendar,
  Target,
  Trophy,
  Heart
} from 'lucide-react';

interface BulkTemplateLibraryProps {
  onTemplateSelect?: (template: DiscountTemplate) => void;
  className?: string;
}

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  templates: DiscountTemplate[];
}

interface DiscountTemplate {
  id: string;
  name: string;
  description: string;
  template: Partial<CreateDiscountDto>;
  tags: string[];
  popularity: number;
  useCase: string;
  suggestedPrefix: string;
  estimatedImpact: 'low' | 'medium' | 'high';
}

const templateCategories: TemplateCategory[] = [
  {
    id: 'promotional',
    name: 'Promotional Campaigns',
    description: 'General marketing and promotional discounts',
    icon: Percent,
    templates: [
      {
        id: 'seasonal-sale',
        name: 'Seasonal Sale',
        description: '20% off for seasonal promotions',
        template: {
          type: 'percentage',
          value: 20,
          duration: 'once',
          maxRedemptions: 100,
          maxUsesPerCustomer: 1,
          newCustomersOnly: false,
          minAmount: 2500, // $25.00
          description: 'Seasonal promotional discount'
        },
        tags: ['seasonal', 'general', 'popular'],
        popularity: 95,
        useCase: 'Perfect for seasonal sales like summer, winter, or holiday promotions',
        suggestedPrefix: 'SEASON',
        estimatedImpact: 'high'
      },
      {
        id: 'flash-sale',
        name: 'Flash Sale',
        description: '30% off limited time offer',
        template: {
          type: 'percentage',
          value: 30,
          duration: 'once',
          maxRedemptions: 50,
          maxUsesPerCustomer: 1,
          newCustomersOnly: false,
          minAmount: 5000, // $50.00
          description: 'Limited time flash sale discount'
        },
        tags: ['urgent', 'limited', 'high-value'],
        popularity: 88,
        useCase: 'Short-term promotions to drive immediate sales',
        suggestedPrefix: 'FLASH',
        estimatedImpact: 'high'
      },
      {
        id: 'clearance',
        name: 'Clearance Sale',
        description: '40% off clearance items',
        template: {
          type: 'percentage',
          value: 40,
          duration: 'once',
          maxRedemptions: 200,
          maxUsesPerCustomer: 3,
          newCustomersOnly: false,
          minAmount: 1000, // $10.00
          description: 'Clearance inventory discount'
        },
        tags: ['clearance', 'inventory', 'high-discount'],
        popularity: 75,
        useCase: 'Moving old inventory or discontinued products',
        suggestedPrefix: 'CLEAR',
        estimatedImpact: 'medium'
      }
    ]
  },
  {
    id: 'acquisition',
    name: 'Customer Acquisition',
    description: 'Attract new customers with special offers',
    icon: Users,
    templates: [
      {
        id: 'welcome-new',
        name: 'Welcome Offer',
        description: '15% off for new customers',
        template: {
          type: 'percentage',
          value: 15,
          duration: 'once',
          maxRedemptions: 1,
          maxUsesPerCustomer: 1,
          newCustomersOnly: true,
          minAmount: 0,
          description: 'Welcome discount for new customers'
        },
        tags: ['new-customer', 'welcome', 'acquisition'],
        popularity: 92,
        useCase: 'Encourage first-time purchases from new customers',
        suggestedPrefix: 'WELCOME',
        estimatedImpact: 'high'
      },
      {
        id: 'first-purchase',
        name: 'First Purchase Bonus',
        description: '$10 off first purchase',
        template: {
          type: 'fixed_amount',
          value: 1000, // $10.00
          duration: 'once',
          maxRedemptions: 1,
          maxUsesPerCustomer: 1,
          newCustomersOnly: true,
          minAmount: 2500, // $25.00
          description: 'Fixed discount for first purchase'
        },
        tags: ['new-customer', 'fixed-amount', 'first-purchase'],
        popularity: 87,
        useCase: 'Provide a specific dollar amount off for new customers',
        suggestedPrefix: 'FIRST',
        estimatedImpact: 'high'
      },
      {
        id: 'referral-friend',
        name: 'Friend Referral',
        description: '25% off through referral',
        template: {
          type: 'percentage',
          value: 25,
          duration: 'once',
          maxRedemptions: 1,
          maxUsesPerCustomer: 1,
          newCustomersOnly: true,
          minAmount: 2000, // $20.00
          description: 'Referral discount for new customers'
        },
        tags: ['referral', 'friend', 'viral'],
        popularity: 82,
        useCase: 'Reward customers who bring friends to your business',
        suggestedPrefix: 'FRIEND',
        estimatedImpact: 'high'
      }
    ]
  },
  {
    id: 'loyalty',
    name: 'Customer Loyalty',
    description: 'Reward your existing customers',
    icon: Heart,
    templates: [
      {
        id: 'vip-exclusive',
        name: 'VIP Exclusive',
        description: '35% off for loyal customers',
        template: {
          type: 'percentage',
          value: 35,
          duration: 'once',
          maxRedemptions: 1,
          maxUsesPerCustomer: 1,
          newCustomersOnly: false,
          minAmount: 7500, // $75.00
          description: 'Exclusive discount for VIP customers'
        },
        tags: ['vip', 'exclusive', 'loyalty'],
        popularity: 79,
        useCase: 'Reward high-value or long-term customers',
        suggestedPrefix: 'VIP',
        estimatedImpact: 'medium'
      },
      {
        id: 'birthday-special',
        name: 'Birthday Special',
        description: '$20 off birthday celebration',
        template: {
          type: 'fixed_amount',
          value: 2000, // $20.00
          duration: 'once',
          maxRedemptions: 1,
          maxUsesPerCustomer: 1,
          newCustomersOnly: false,
          minAmount: 5000, // $50.00
          description: 'Birthday celebration discount'
        },
        tags: ['birthday', 'celebration', 'personal'],
        popularity: 71,
        useCase: 'Celebrate customer birthdays and increase engagement',
        suggestedPrefix: 'BDAY',
        estimatedImpact: 'medium'
      },
      {
        id: 'thank-you',
        name: 'Thank You Reward',
        description: '10% off as appreciation',
        template: {
          type: 'percentage',
          value: 10,
          duration: 'once',
          maxRedemptions: 500,
          maxUsesPerCustomer: 1,
          newCustomersOnly: false,
          minAmount: 1500, // $15.00
          description: 'Thank you discount for loyal customers'
        },
        tags: ['thank-you', 'appreciation', 'loyalty'],
        popularity: 68,
        useCase: 'Show appreciation to existing customers',
        suggestedPrefix: 'THANKS',
        estimatedImpact: 'medium'
      }
    ]
  },
  {
    id: 'volume',
    name: 'Volume & Bulk',
    description: 'Encourage larger purchases',
    icon: Target,
    templates: [
      {
        id: 'bulk-buy',
        name: 'Bulk Purchase Discount',
        description: '$50 off orders over $200',
        template: {
          type: 'fixed_amount',
          value: 5000, // $50.00
          duration: 'once',
          maxRedemptions: 100,
          maxUsesPerCustomer: 2,
          newCustomersOnly: false,
          minAmount: 20000, // $200.00
          description: 'Bulk purchase discount'
        },
        tags: ['bulk', 'volume', 'large-order'],
        popularity: 73,
        useCase: 'Encourage customers to buy more items at once',
        suggestedPrefix: 'BULK',
        estimatedImpact: 'high'
      },
      {
        id: 'spend-save',
        name: 'Spend & Save',
        description: '15% off orders over $100',
        template: {
          type: 'percentage',
          value: 15,
          duration: 'once',
          maxRedemptions: 200,
          maxUsesPerCustomer: 1,
          newCustomersOnly: false,
          minAmount: 10000, // $100.00
          description: 'Spend threshold discount'
        },
        tags: ['spend-threshold', 'incentive'],
        popularity: 85,
        useCase: 'Increase average order value with minimum spend requirement',
        suggestedPrefix: 'SAVE',
        estimatedImpact: 'high'
      }
    ]
  },
  {
    id: 'subscription',
    name: 'Subscription & Recurring',
    description: 'Promote subscription-based services',
    icon: Calendar,
    templates: [
      {
        id: 'free-trial',
        name: 'Free Trial Extension',
        description: 'Free trial for subscription',
        template: {
          type: 'free_trial',
          value: 0,
          duration: 'once',
          maxRedemptions: 1,
          maxUsesPerCustomer: 1,
          newCustomersOnly: true,
          minAmount: 0,
          description: 'Extended free trial period'
        },
        tags: ['free-trial', 'subscription'],
        popularity: 89,
        useCase: 'Convert visitors to trial users with extended free periods',
        suggestedPrefix: 'TRIAL',
        estimatedImpact: 'high'
      },
      {
        id: 'first-month',
        name: 'First Month Special',
        description: '50% off first month',
        template: {
          type: 'percentage',
          value: 50,
          duration: 'once',
          maxRedemptions: 1,
          maxUsesPerCustomer: 1,
          newCustomersOnly: true,
          minAmount: 0,
          description: 'First month subscription discount'
        },
        tags: ['subscription', 'first-month', 'trial'],
        popularity: 84,
        useCase: 'Reduce barriers for subscription sign-ups',
        suggestedPrefix: 'MONTH1',
        estimatedImpact: 'high'
      }
    ]
  }
];

export function BulkTemplateLibrary({ onTemplateSelect, className }: BulkTemplateLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState(templateCategories[0].id);

  const currentCategory = templateCategories.find(cat => cat.id === selectedCategory);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatValue = (template: Partial<CreateDiscountDto>) => {
    if (template.type === 'percentage') {
      return `${template.value}% off`;
    } else if (template.type === 'fixed_amount') {
      return `$${((template.value || 0) / 100).toFixed(2)} off`;
    } else if (template.type === 'free_trial') {
      return 'Free Trial';
    }
    return 'Discount';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Discount Template Library
        </CardTitle>
        <CardDescription>
          Choose from proven discount templates to kickstart your bulk generation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-4">
          {/* Category Sidebar */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Categories</h4>
            <div className="space-y-1">
              {templateCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="w-full justify-start gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="md:col-span-3">
            {currentCategory && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">{currentCategory.name}</h3>
                  <p className="text-sm text-muted-foreground">{currentCategory.description}</p>
                </div>

                <ScrollArea className="h-96">
                  <div className="grid gap-4 md:grid-cols-2">
                    {currentCategory.templates.map((template) => (
                      <Card key={template.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-base">{template.name}</CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {formatValue(template.template)}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getImpactColor(template.estimatedImpact)}`}
                                >
                                  {template.estimatedImpact} impact
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 fill-current text-yellow-500" />
                              {template.popularity}%
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            {template.description}
                          </p>
                          
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                              <strong>Use case:</strong> {template.useCase}
                            </p>
                            
                            <div className="flex flex-wrap gap-1">
                              {template.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="text-xs text-muted-foreground">
                              <strong>Suggested prefix:</strong> {template.suggestedPrefix}
                            </div>
                          </div>

                          <Button
                            onClick={() => onTemplateSelect?.(template)}
                            size="sm"
                            className="w-full"
                          >
                            Use This Template
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}