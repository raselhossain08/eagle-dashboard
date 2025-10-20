// lib/utils/subscriber-utils.ts
import { SubscriberProfile } from '@/types/subscribers';

export const calculateLifetimeValue = (subscriber: SubscriberProfile): number => {
  // Simple LTV calculation - in real app, this would be more complex
  return subscriber.totalSpent * 1.5; // Example multiplier
};

export const getSubscriberStatus = (subscriber: SubscriberProfile): string => {
  if (subscriber.status === 'active' && subscriber.kycStatus === 'verified') {
    return 'fully_verified';
  }
  if (subscriber.status === 'active' && subscriber.kycStatus !== 'verified') {
    return 'active_pending_verification';
  }
  return subscriber.status;
};

export const formatSubscriberName = (subscriber: SubscriberProfile): string => {
  return `${subscriber.firstName} ${subscriber.lastName}`.trim();
};

export const getSubscriberInitials = (subscriber: SubscriberProfile): string => {
  return `${subscriber.firstName?.[0] || ''}${subscriber.lastName?.[0] || ''}`.toUpperCase();
};

export const isSubscriberActive = (subscriber: SubscriberProfile): boolean => {
  return subscriber.status === 'active';
};