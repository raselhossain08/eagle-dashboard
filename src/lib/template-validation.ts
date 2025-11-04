'use client';

import { toast } from 'sonner';

interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const templateToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, {
      duration: options?.duration || 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    toast.error(message, {
      duration: options?.duration || 6000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, {
      duration: options?.duration || 5000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    toast.info(message, {
      duration: options?.duration || 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      duration: Infinity,
    });
  },

  dismiss: (id?: string | number) => {
    toast.dismiss(id);
  },

  // Template-specific toasts
  templateCreated: (templateName: string, redirectAction?: () => void) => {
    templateToast.success(`Template "${templateName}" created successfully!`, {
      duration: 5000,
      action: redirectAction ? {
        label: 'View Templates',
        onClick: redirectAction,
      } : undefined,
    });
  },

  templateCreateError: (error: string, retryAction?: () => void) => {
    templateToast.error(`Failed to create template: ${error}`, {
      duration: 7000,
      action: retryAction ? {
        label: 'Retry',
        onClick: retryAction,
      } : undefined,
    });
  },

  validationError: (fieldName: string, error: string) => {
    templateToast.warning(`${fieldName}: ${error}`, {
      duration: 4000,
    });
  },

  previewGenerated: () => {
    templateToast.info('Template preview generated successfully', {
      duration: 3000,
    });
  },

  unsavedChanges: (saveAction: () => void) => {
    templateToast.warning('You have unsaved changes!', {
      duration: 6000,
      action: {
        label: 'Save Now',
        onClick: saveAction,
      },
    });
  },
};

// Template validation utilities
export const validateTemplateName = (name: string): string | null => {
  if (!name.trim()) {
    return 'Template name is required';
  }
  if (name.length < 3) {
    return 'Template name must be at least 3 characters';
  }
  if (name.length > 100) {
    return 'Template name must be less than 100 characters';
  }
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    return 'Template name can only contain letters, numbers, spaces, hyphens, and underscores';
  }
  return null;
};

export const validateEmailSubject = (subject: string): string | null => {
  if (!subject.trim()) {
    return 'Email subject is required';
  }
  if (subject.length > 200) {
    return 'Subject must be less than 200 characters';
  }
  return null;
};

export const validateTemplateContent = (content: string): string | null => {
  if (!content.trim()) {
    return 'Email content is required';
  }
  if (content.length < 10) {
    return 'Content must be at least 10 characters';
  }
  if (content.length > 50000) {
    return 'Content is too long (max 50,000 characters)';
  }
  return null;
};

export const validateTemplateVariables = (content: string): { 
  isValid: boolean; 
  errors: string[]; 
  variables: string[] 
} => {
  const errors: string[] = [];
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = variableRegex.exec(content)) !== null) {
    const variable = match[1].trim();
    
    if (!variable) {
      errors.push('Empty variable found: {{}}');
      continue;
    }
    
    if (!/^[a-zA-Z0-9._]+$/.test(variable)) {
      errors.push(`Invalid variable name: ${variable} (only letters, numbers, dots, and underscores allowed)`);
      continue;
    }
    
    if (!variables.includes(variable)) {
      variables.push(variable);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    variables
  };
};

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateTemplateForm = (data: {
  name: string;
  subject: string;
  content: string;
  type: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Validate name
  const nameError = validateTemplateName(data.name);
  if (nameError) errors.name = nameError;

  // Validate subject
  const subjectError = validateEmailSubject(data.subject);
  if (subjectError) errors.subject = subjectError;

  // Validate content
  const contentError = validateTemplateContent(data.content);
  if (contentError) errors.content = contentError;

  // Validate type
  const validTypes = ['transactional', 'marketing', 'alert', 'system'];
  if (!validTypes.includes(data.type)) {
    errors.type = 'Please select a valid template type';
  }

  // Validate variables
  const variableValidation = validateTemplateVariables(data.content);
  if (!variableValidation.isValid) {
    errors.variables = variableValidation.errors.join(', ');
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};