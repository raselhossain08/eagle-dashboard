// lib/validations/campaign.validation.ts
import { z } from 'zod';

export const campaignValidationSchema = z.object({
  name: z
    .string()
    .min(1, 'Campaign name is required')
    .min(3, 'Campaign name must be at least 3 characters')
    .max(100, 'Campaign name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Campaign name contains invalid characters'),

  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),

  type: z
    .enum(['promotional', 'affiliate', 'referral', 'loyalty', 'winback'], {
      message: 'Please select a valid campaign type'
    }),

  startDate: z
    .union([z.date(), z.string().datetime()])
    .transform((val) => {
      if (typeof val === 'string') {
        return new Date(val);
      }
      return val;
    })
    .refine(
      (date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), 
      'Start date cannot be in the past'
    ),

  endDate: z
    .union([z.date(), z.string().datetime()])
    .transform((val) => {
      if (typeof val === 'string') {
        return new Date(val);
      }
      return val;
    })
    .optional()
    .nullable(),

  isActive: z
    .boolean()
    .default(true),

  discountIds: z
    .array(z.string())
    .default([]),

  channels: z
    .array(z.string())
    .max(10, 'Maximum 10 channels allowed')
    .default([]),

  targetAudience: z
    .array(z.string())
    .default([]),

  targetCountries: z
    .array(z.string())
    .default([]),

  budget: z
    .number()
    .positive('Budget must be a positive number')
    .max(10000000, 'Budget cannot exceed $100,000') // 100k in cents
    .optional()
    .nullable(),

  revenueGoal: z
    .number()
    .positive('Revenue goal must be a positive number')
    .max(100000000, 'Revenue goal cannot exceed $1,000,000') // 1M in cents
    .optional()
    .nullable(),

  conversionGoal: z
    .number()
    .positive('Conversion goal must be a positive number')
    .max(1000000, 'Conversion goal cannot exceed 1,000,000')
    .optional()
    .nullable(),

  utmSource: z
    .string()
    .max(50, 'UTM Source must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\-_.]*$/, 'UTM Source contains invalid characters')
    .optional(),

  utmMedium: z
    .string()
    .max(50, 'UTM Medium must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\-_.]*$/, 'UTM Medium contains invalid characters')
    .optional(),

  utmCampaign: z
    .string()
    .max(50, 'UTM Campaign must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\-_.]*$/, 'UTM Campaign contains invalid characters')
    .optional(),

  utmContent: z
    .string()
    .max(50, 'UTM Content must be less than 50 characters')
    .optional(),

  utmTerm: z
    .string()
    .max(50, 'UTM Term must be less than 50 characters')
    .optional(),
}).refine((data) => {
  // Cross-field validation: endDate must be after startDate
  if (data.endDate && data.startDate) {
    return data.endDate > data.startDate;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
}).refine((data) => {
  // If budget is set, revenue goal should be reasonable
  if (data.budget && data.revenueGoal) {
    return data.revenueGoal >= data.budget;
  }
  return true;
}, {
  message: 'Revenue goal should be at least equal to the budget',
  path: ['revenueGoal']
});

export type CampaignValidationInput = z.input<typeof campaignValidationSchema>;
export type CampaignValidationOutput = z.output<typeof campaignValidationSchema>;

// Helper function to validate campaign data
export const validateCampaignData = (data: any) => {
  return campaignValidationSchema.safeParse(data);
};

// Helper function to get field-specific errors
export const getCampaignValidationErrors = (data: any): Record<string, string> => {
  const result = validateCampaignData(data);
  
  if (result.success) {
    return {};
  }

  const errors: Record<string, string> = {};
  
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });

  return errors;
};