// components/auth/remember-me.tsx
'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface RememberMeProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export function RememberMe({ 
  checked, 
  onChange, 
  label = "Remember me",
  description = "Stay logged in for 30 days"
}: RememberMeProps) {
  return (
    <div className="flex items-start space-x-2">
      <Checkbox
        id="rememberMe"
        checked={checked}
        onCheckedChange={(checked) => onChange(checked as boolean)}
        className="mt-1"
      />
      <div className="grid gap-1.5 leading-none">
        <Label
          htmlFor="rememberMe"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}