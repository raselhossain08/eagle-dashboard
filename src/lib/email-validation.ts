import { SendEmailDto } from '@/types/notifications';
import { toast } from 'sonner';

export interface EmailValidationResult {
  isValid: boolean;
  errors: {
    recipients?: string;
    subject?: string;
    content?: string;
    schedule?: string;
    variables?: string;
    general?: string;
  };
}

export interface EmailValidationOptions {
  templateVariables?: string[];
  maxRecipients?: number;
  minContentLength?: number;
  requireSubject?: boolean;
  allowScheduling?: boolean;
}

export class EmailValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly COMMON_DOMAINS = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
    'aol.com', 'icloud.com', 'protonmail.com'
  ];

  static validateEmailData(
    data: Partial<SendEmailDto>, 
    options: EmailValidationOptions = {}
  ): EmailValidationResult {
    const errors: EmailValidationResult['errors'] = {};
    
    const {
      templateVariables = [],
      maxRecipients = 100,
      minContentLength = 10,
      requireSubject = true,
      allowScheduling = true
    } = options;

    // Validate recipients
    if (!data.to || data.to.length === 0) {
      errors.recipients = 'At least one recipient is required';
    } else {
      const invalidEmails = data.to.filter(email => !this.isValidEmail(email));
      if (invalidEmails.length > 0) {
        errors.recipients = `Invalid email addresses: ${invalidEmails.join(', ')}`;
      } else if (data.to.length > maxRecipients) {
        errors.recipients = `Too many recipients. Maximum allowed: ${maxRecipients}`;
      }
    }

    // Validate subject
    if (requireSubject && (!data.subject || data.subject.trim().length === 0)) {
      errors.subject = 'Email subject is required';
    } else if (data.subject && data.subject.length > 200) {
      errors.subject = 'Subject is too long (maximum 200 characters)';
    }

    // Validate content
    if (!data.content || data.content.trim().length === 0) {
      errors.content = 'Email content is required';
    } else if (data.content.trim().length < minContentLength) {
      errors.content = `Content is too short (minimum ${minContentLength} characters)`;
    } else if (data.content.length > 50000) {
      errors.content = 'Content is too long (maximum 50,000 characters)';
    }

    // Validate scheduling
    if (data.scheduledAt) {
      if (!allowScheduling) {
        errors.schedule = 'Email scheduling is not allowed';
      } else {
        const scheduledDate = new Date(data.scheduledAt);
        const now = new Date();
        
        if (isNaN(scheduledDate.getTime())) {
          errors.schedule = 'Invalid scheduled date format';
        } else if (scheduledDate <= now) {
          errors.schedule = 'Scheduled time must be in the future';
        } else if (scheduledDate.getTime() - now.getTime() > 365 * 24 * 60 * 60 * 1000) {
          errors.schedule = 'Cannot schedule more than 1 year in advance';
        }
      }
    }

    // Validate template variables
    if (templateVariables.length > 0) {
      const missingVariables = templateVariables.filter(variable => 
        !data.variables?.[variable] || 
        String(data.variables[variable]).trim() === ''
      );
      
      if (missingVariables.length > 0) {
        errors.variables = `Missing required variables: ${missingVariables.join(', ')}`;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    
    // Basic regex check
    if (!this.EMAIL_REGEX.test(email)) return false;
    
    // Length checks
    if (email.length > 254) return false;
    
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    
    const [local, domain] = parts;
    
    // Local part validation
    if (local.length === 0 || local.length > 64) return false;
    if (local.startsWith('.') || local.endsWith('.')) return false;
    if (local.includes('..')) return false;
    
    // Domain part validation
    if (domain.length === 0 || domain.length > 253) return false;
    if (domain.startsWith('-') || domain.endsWith('-')) return false;
    if (domain.includes('..')) return false;
    
    return true;
  }

  static validateBulkEmails(emails: string[]): {
    valid: string[];
    invalid: string[];
    duplicates: string[];
  } {
    const valid: string[] = [];
    const invalid: string[] = [];
    const seen = new Set<string>();
    const duplicates: string[] = [];

    emails.forEach(email => {
      const trimmedEmail = email.trim().toLowerCase();
      
      if (seen.has(trimmedEmail)) {
        if (!duplicates.includes(trimmedEmail)) {
          duplicates.push(trimmedEmail);
        }
        return;
      }
      
      seen.add(trimmedEmail);
      
      if (this.isValidEmail(trimmedEmail)) {
        valid.push(trimmedEmail);
      } else {
        invalid.push(email);
      }
    });

    return { valid, invalid, duplicates };
  }

  static suggestEmailCorrections(email: string): string[] {
    if (this.isValidEmail(email)) return [];
    
    const suggestions: string[] = [];
    const parts = email.split('@');
    
    if (parts.length === 2) {
      const [local, domain] = parts;
      
      // Suggest common domains for typos
      const domainLower = domain.toLowerCase();
      this.COMMON_DOMAINS.forEach(commonDomain => {
        if (this.getLevenshteinDistance(domainLower, commonDomain) <= 2) {
          suggestions.push(`${local}@${commonDomain}`);
        }
      });
    }
    
    return suggestions.slice(0, 3); // Return max 3 suggestions
  }

  private static getLevenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i += 1) {
      matrix[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j += 1) {
      matrix[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator, // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  static getContentStats(content: string) {
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const charCount = content.length;
    const charCountNoSpaces = content.replace(/\s/g, '').length;
    const estimatedReadingTime = Math.ceil(wordCount / 200); // 200 words per minute average
    
    return {
      wordCount,
      charCount,
      charCountNoSpaces,
      estimatedReadingTime: `${estimatedReadingTime} min${estimatedReadingTime !== 1 ? 's' : ''}`
    };
  }
}

export const emailToast = {
  validationError: (field: string, message: string) => {
    toast.error(`${field}: ${message}`, {
      duration: 5000,
      position: 'top-right',
    });
  },

  success: (message: string, options?: { action?: { label: string; onClick: () => void } }) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      ...options,
    });
  },

  error: (message: string, options?: { action?: { label: string; onClick: () => void } }) => {
    toast.error(message, {
      duration: 6000,
      position: 'top-right',
      ...options,
    });
  },

  info: (message: string) => {
    toast.info(message, {
      duration: 3000,
      position: 'top-right',
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
    });
  },

  dismiss: (toastId: string | number) => {
    toast.dismiss(toastId);
  },
};

export default EmailValidator;