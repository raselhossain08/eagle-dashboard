// lib/validators/user-schemas.ts
import { z } from 'zod';

// Base user schema
export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  phone: z.string().optional().or(z.literal('')),
  company: z.string().optional().or(z.literal('')),
});

// Address schema
export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
});

// Preferences schema
export const preferencesSchema = z.object({
  notifications: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(true),
  }),
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
});

// Complete user schema for creation
export const createUserSchema = userSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  address: addressSchema.optional(),
  preferences: preferencesSchema.optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// User update schema (all fields optional)
export const updateUserSchema = userSchema.extend({
  address: addressSchema.optional(),
  preferences: preferencesSchema.optional(),
}).partial();

// User status update schema
export const userStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended']),
  reason: z.string().optional(),
});

// User search and filters schema
export const usersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  kycStatus: z.enum(['pending', 'verified', 'rejected']).optional(),
  emailVerified: z.coerce.boolean().optional(),
  sortBy: z.string().default('createdAt_desc'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// Bulk action schema
export const bulkActionSchema = z.object({
  userIds: z.array(z.string()).min(1, 'At least one user must be selected'),
  action: z.enum(['activate', 'deactivate', 'suspend', 'delete', 'export']),
  data: z.record(z.string(), z.any()).optional(),
});

// KYC document schema
export const kycDocumentSchema = z.object({
  type: z.enum(['id_card', 'passport', 'drivers_license', 'utility_bill']),
  frontImage: z.string().url('Invalid image URL'),
  backImage: z.string().url('Invalid image URL').optional(),
  verified: z.boolean().default(false),
  verifiedAt: z.string().optional(),
  verifiedBy: z.string().optional(),
});

// Export types
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserStatusInput = z.infer<typeof userStatusSchema>;
export type UsersQueryInput = z.infer<typeof usersQuerySchema>;
export type BulkActionInput = z.infer<typeof bulkActionSchema>;
export type KYCDocumentInput = z.infer<typeof kycDocumentSchema>;