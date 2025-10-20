// lib/validators/subscriber-schemas.ts
import { z } from 'zod';

export const subscriberProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
  preferences: z.object({
    emailNotifications: z.boolean().default(true),
    smsNotifications: z.boolean().default(false),
    language: z.string().default('en'),
  }).optional(),
});

export const subscriptionSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  subscriberId: z.string().min(1, 'Subscriber ID is required'),
  billingCycle: z.enum(['monthly', 'yearly']),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
});

export const kycVerificationSchema = z.object({
  documentType: z.enum(['passport', 'drivers_license', 'national_id']),
  documentNumber: z.string().min(1, 'Document number is required'),
  documentImages: z.array(z.string()).min(1, 'At least one document image is required'),
});

export type SubscriberProfileFormData = z.infer<typeof subscriberProfileSchema>;
export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;
export type KycVerificationFormData = z.infer<typeof kycVerificationSchema>;