// lib/utils/export-utils.ts
import { User } from '@/types/users';

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  fields?: string[];
  includeHeaders?: boolean;
}

export interface ExportResult {
  blob: Blob;
  filename: string;
  size: number;
}

/**
 * Export users to CSV format
 */
export const exportToCSV = (users: User[], options: ExportOptions = { format: 'csv' }): ExportResult => {
  const fields = options.fields || ['id', 'email', 'firstName', 'lastName', 'status', 'kycStatus', 'company', 'phone', 'createdAt'];
  const includeHeaders = options.includeHeaders !== false;
  
  const headers = fields.map(field => 
    field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  );
  
  const rows = users.map(user => 
    fields.map(field => {
      const value = getUserFieldValue(user, field);
      // Escape CSV special characters
      return `"${String(value).replace(/"/g, '""')}"`;
    })
  );
  
  const csvContent = [
    ...(includeHeaders ? [headers.join(',')] : []),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  return {
    blob,
    filename: `users-export-${new Date().toISOString().split('T')[0]}.csv`,
    size: blob.size
  };
};

/**
 * Export users to JSON format
 */
export const exportToJSON = (users: User[], options: ExportOptions = { format: 'json' }): ExportResult => {
  const fields = options.fields || ['id', 'email', 'firstName', 'lastName', 'status', 'kycStatus', 'company', 'phone', 'createdAt'];
  
  const data = users.map(user => {
    const userData: any = {};
    fields.forEach(field => {
      userData[field] = getUserFieldValue(user, field);
    });
    return userData;
  });
  
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  
  return {
    blob,
    filename: `users-export-${new Date().toISOString().split('T')[0]}.json`,
    size: blob.size
  };
};

/**
 * Get user field value with proper formatting
 */
const getUserFieldValue = (user: User, field: string): any => {
  const fieldMap: { [key: string]: any } = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`,
    status: user.status,
    kycStatus: user.kycStatus,
    company: user.company || '',
    phone: user.phone || '',
    emailVerified: user.emailVerified ? 'Yes' : 'No',
    createdAt: new Date(user.createdAt).toLocaleDateString(),
    updatedAt: new Date(user.updatedAt).toLocaleDateString(),
    lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
    // Address fields
    'address.street': user.address?.street || '',
    'address.city': user.address?.city || '',
    'address.state': user.address?.state || '',
    'address.country': user.address?.country || '',
    'address.postalCode': user.address?.postalCode || '',
  };
  
  return fieldMap[field] || '';
};

/**
 * Download exported file
 */
export const downloadExport = (result: ExportResult): void => {
  const url = URL.createObjectURL(result.blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = result.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate export report summary
 */
export const generateExportSummary = (users: User[], format: string) => {
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const verifiedUsers = users.filter(u => u.kycStatus === 'verified').length;
  
  return {
    totalUsers,
    activeUsers,
    verifiedUsers,
    format: format.toUpperCase(),
    exportedAt: new Date().toISOString(),
    fieldsIncluded: ['id', 'email', 'firstName', 'lastName', 'status', 'kycStatus', 'company', 'phone', 'createdAt'],
  };
};