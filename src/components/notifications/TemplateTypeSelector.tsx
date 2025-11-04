'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  ShoppingCart, 
  Shield, 
  Settings,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateType {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  examples: string[];
}

const templateTypes: TemplateType[] = [
  {
    value: 'transactional',
    label: 'Transactional',
    description: 'Order confirmations, receipts, account updates',
    icon: <ShoppingCart className="h-5 w-5" />,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    examples: ['Order Confirmation', 'Password Reset', 'Account Activation']
  },
  {
    value: 'marketing',
    label: 'Marketing',
    description: 'Newsletters, promotions, announcements',
    icon: <Mail className="h-5 w-5" />,
    color: 'bg-green-50 border-green-200 text-green-700',
    examples: ['Newsletter', 'Product Launch', 'Special Offers']
  },
  {
    value: 'alert',
    label: 'Alert',
    description: 'Security alerts, urgent notifications',
    icon: <Shield className="h-5 w-5" />,
    color: 'bg-red-50 border-red-200 text-red-700',
    examples: ['Security Alert', 'System Down', 'Account Locked']
  },
  {
    value: 'system',
    label: 'System',
    description: 'System messages, maintenance notices',
    icon: <Settings className="h-5 w-5" />,
    color: 'bg-gray-50 border-gray-200 text-gray-700',
    examples: ['Maintenance Notice', 'System Update', 'Service Status']
  }
];

interface TemplateTypeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export default function TemplateTypeSelector({ value, onValueChange, className }: TemplateTypeSelectorProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="font-medium mb-2">Template Type</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the type that best describes your email template
        </p>
      </div>
      
      <div className="grid gap-3 md:grid-cols-2">
        {templateTypes.map((type) => (
          <Card
            key={type.value}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-md',
              value === type.value ? 'ring-2 ring-primary border-primary' : 'hover:border-muted-foreground/30'
            )}
            onClick={() => onValueChange(type.value)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg', type.color)}>
                  {type.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{type.label}</h4>
                    {value === type.value && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {type.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {type.examples.map((example) => (
                      <Badge key={example} variant="outline" className="text-xs">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}