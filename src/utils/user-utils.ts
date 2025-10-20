// lib/utils/user-utils.ts
import { User, UserActivity } from '@/types/users';

// Format user display name
export const formatUserName = (user: User): string => {
  return `${user.firstName} ${user.lastName}`;
};

// Format user initials for avatars
export const getUserInitials = (user: User): string => {
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
};

// Calculate user age based on created date
export const getUserAccountAge = (createdAt: string): string => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return '1 day';
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
  return `${Math.floor(diffDays / 365)} years`;
};

// Check if user is active (logged in within last 30 days)
export const isUserActive = (user: User): boolean => {
  if (!user.lastLogin) return false;
  const lastLogin = new Date(user.lastLogin);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return lastLogin > thirtyDaysAgo;
};

// Get user status badge variant
export const getUserStatusVariant = (status: User['status']) => {
  switch (status) {
    case 'active': return 'default';
    case 'inactive': return 'secondary';
    case 'suspended': return 'destructive';
    default: return 'secondary';
  }
};

// Get KYC status badge variant
export const getKYCStatusVariant = (status: User['kycStatus']) => {
  switch (status) {
    case 'verified': return 'default';
    case 'pending': return 'secondary';
    case 'rejected': return 'destructive';
    default: return 'secondary';
  }
};

// Sort users by various criteria
export const sortUsers = (users: User[], sortBy: string): User[] => {
  const [field, direction] = sortBy.split('_');
  const sorted = [...users].sort((a, b) => {
    let aValue: any = a[field as keyof User];
    let bValue: any = b[field as keyof User];
    
    // Handle nested fields
    if (field === 'name') {
      aValue = `${a.firstName} ${a.lastName}`;
      bValue = `${b.firstName} ${b.lastName}`;
    }
    
    // Handle dates
    if (field.includes('At') || field === 'lastLogin') {
      aValue = new Date(aValue || 0).getTime();
      bValue = new Date(bValue || 0).getTime();
    }
    
    if (aValue < bValue) return -1;
    if (aValue > bValue) return 1;
    return 0;
  });
  
  return direction === 'desc' ? sorted.reverse() : sorted;
};

// Filter users based on criteria
export const filterUsers = (users: User[], filters: any): User[] => {
  return users.filter(user => {
    if (filters.status && user.status !== filters.status) return false;
    if (filters.kycStatus && user.kycStatus !== filters.kycStatus) return false;
    if (filters.emailVerified !== undefined && user.emailVerified !== filters.emailVerified) return false;
    
    // Date range filter
    if (filters.dateRange) {
      const userDate = new Date(user.createdAt);
      if (filters.dateRange.from && userDate < filters.dateRange.from) return false;
      if (filters.dateRange.to && userDate > filters.dateRange.to) return false;
    }
    
    return true;
  });
};

// Search users across multiple fields
export const searchUsers = (users: User[], query: string): User[] => {
  if (!query.trim()) return users;
  
  const searchTerm = query.toLowerCase();
  return users.filter(user =>
    user.email.toLowerCase().includes(searchTerm) ||
    user.firstName.toLowerCase().includes(searchTerm) ||
    user.lastName.toLowerCase().includes(searchTerm) ||
    user.company?.toLowerCase().includes(searchTerm) ||
    user.phone?.includes(searchTerm)
  );
};

// Export users to various formats
export const exportUsersToCSV = (users: User[]): string => {
  const headers = ['ID', 'Email', 'First Name', 'Last Name', 'Status', 'KYC Status', 'Company', 'Phone', 'Created At'];
  const rows = users.map(user => [
    user.id,
    user.email,
    user.firstName,
    user.lastName,
    user.status,
    user.kycStatus,
    user.company || '',
    user.phone || '',
    new Date(user.createdAt).toLocaleDateString()
  ]);
  
  return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
};

// Generate user statistics
export const generateUserStats = (users: User[]) => {
  const total = users.length;
  const active = users.filter(user => user.status === 'active').length;
  const verified = users.filter(user => user.kycStatus === 'verified').length;
  const withEmailVerified = users.filter(user => user.emailVerified).length;
  
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const newThisMonth = users.filter(user => new Date(user.createdAt) > thirtyDaysAgo).length;
  
  return {
    total,
    active,
    inactive: users.filter(user => user.status === 'inactive').length,
    suspended: users.filter(user => user.status === 'suspended').length,
    verified,
    pendingVerification: users.filter(user => user.kycStatus === 'pending').length,
    emailVerified: withEmailVerified,
    newThisMonth,
    activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
    verifiedPercentage: total > 0 ? Math.round((verified / total) * 100) : 0,
  };
};

// Format activity description
export const formatActivityDescription = (activity: UserActivity): string => {
  const actionMap: { [key: string]: string } = {
    login: 'logged in',
    logout: 'logged out',
    profile_update: 'updated profile',
    password_change: 'changed password',
    email_verification: 'verified email',
    subscription_update: 'updated subscription',
    support_ticket: 'created support ticket',
  };
  
  return actionMap[activity.action] || activity.action;
};