// src/lib/utils/webhook-utils.ts
import { WebhookEvent } from '@/types/system';

export const validateWebhookUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

export const generateSignature = (payload: any, secret: string): string => {
  // In a real implementation, this would create a cryptographic signature
  const payloadString = JSON.stringify(payload);
  return `sig_${btoa(payloadString).slice(0, 32)}`;
};

export const shouldRetryWebhook = (event: WebhookEvent): boolean => {
  if (event.status === 'success') return false;
  if (event.attempts >= 3) return false;
  
  // Don't retry immediately for server errors
  const lastAttempt = event.lastAttempt ? new Date(event.lastAttempt) : new Date();
  const timeSinceLastAttempt = Date.now() - lastAttempt.getTime();
  
  if (event.attempts === 1) return timeSinceLastAttempt > 60000; // 1 minute
  if (event.attempts === 2) return timeSinceLastAttempt > 300000; // 5 minutes
  
  return false;
};

export const calculateBackoffDelay = (attempts: number): number => {
  // Exponential backoff: 1min, 5min, 15min, 30min
  const delays = [60000, 300000, 900000, 1800000];
  return delays[Math.min(attempts, delays.length - 1)];
};