// lib/utils/validation-utils.ts
import { z } from 'zod';

/**
 * Common validation patterns
 */
export const validationPatterns = {
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  url: z.string().url('Invalid URL'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
};

/**
 * Transform empty strings to undefined
 */
export const emptyStringToUndefined = z.literal('').transform(() => undefined);

/**
 * Optional string that transforms empty strings to undefined
 */
export const optionalString = z.string().optional().or(emptyStringToUndefined);

/**
 * Required field with custom error messages
 */
export const requiredField = (fieldName: string) => 
  z.string().min(1, `${fieldName} is required`);

/**
 * Validate file upload
 */
export const fileValidation = (maxSizeMB = 5) => 
  z.instanceof(File).refine(
    (file) => file.size <= maxSizeMB * 1024 * 1024,
    `File size must be less than ${maxSizeMB}MB`
  );

/**
 * Validate array with minimum length
 */
export const minArray = (min: number, message?: string) =>
  z.array(z.any()).min(min, message || `Must have at least ${min} item(s)`);

/**
 * Validate date range
 */
export const dateRangeSchema = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
}).refine(
  (data) => !data.from || !data.to || data.from <= data.to,
  'End date must be after start date'
);

/**
 * Async validation for unique email
 */
export const createUniqueEmailValidator = (existingEmails: string[]) => 
  z.string().email().refine(
    (email) => !existingEmails.includes(email),
    'Email already exists'
  );

/**
 * Debounced validation function
 */
export const debouncedValidation = <T>(
  schema: z.ZodSchema<T>,
  delay: number = 300
) => {
  let timeoutId: NodeJS.Timeout;
  
  return async (data: unknown): Promise<{ valid: boolean; errors?: string[] }> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          await schema.parseAsync(data);
          resolve({ valid: true });
        } catch (error) {
          if (error instanceof z.ZodError) {
            resolve({
              valid: false,
              errors: error.errors.map(err => err.message)
            });
          } else {
            resolve({ valid: false, errors: ['Validation failed'] });
          }
        }
      }, delay);
    });
  };
};