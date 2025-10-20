// lib/utils/support-utils.ts
import { SupportNote } from '@/types/support';

export const formatSupportNote = (content: string): string => {
  // Implement rich text formatting logic
  return content;
};

export const categorizeNote = (content: string): SupportNote['category'] => {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('billing') || lowerContent.includes('payment') || lowerContent.includes('invoice')) {
    return 'billing';
  }
  if (lowerContent.includes('login') || lowerContent.includes('password') || lowerContent.includes('access')) {
    return 'account';
  }
  if (lowerContent.includes('fraud') || lowerContent.includes('suspicious') || lowerContent.includes('security')) {
    return 'fraud';
  }
  if (lowerContent.includes('urgent') || lowerContent.includes('emergency') || lowerContent.includes('critical')) {
    return 'high_priority';
  }
  if (lowerContent.includes('technical') || lowerContent.includes('bug') || lowerContent.includes('error')) {
    return 'technical';
  }
  
  return 'general';
};

export const calculateResponseTime = (createdAt: string, resolvedAt?: string): number => {
  const created = new Date(createdAt).getTime();
  const resolved = resolvedAt ? new Date(resolvedAt).getTime() : Date.now();
  return Math.round((resolved - created) / 60000); // minutes
};

// lib/utils/impersonation-utils.ts
export const generateImpersonationToken = (): string => {
  return `imp_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
};

export const validateImpersonationSession = (session: any): boolean => {
  if (!session.startedAt) return false;
  
  const sessionStart = new Date(session.startedAt).getTime();
  const now = Date.now();
  const sessionDuration = now - sessionStart;
  const maxDuration = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  
  return sessionDuration <= maxDuration;
};

export const getSessionDuration = (startedAt: string, endedAt?: string): string => {
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  const duration = end - start;
  
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};