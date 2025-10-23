import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client';

// Types for profile data
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  status: 'active' | 'inactive' | 'suspended';
  kycStatus: 'not_started' | 'pending' | 'verified' | 'rejected';
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    language: string;
  };
  lifetimeValue: number;
  totalSpent: number;
  createdAt: string;
  lastActivity: string;
  activeSubscriptions: number;
  subscriptionHistory: number;
}

export interface SubscriberSubscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'canceled' | 'past_due' | 'paused' | 'trialing';
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  startDate: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialStart?: string;
  trialEnd?: string;
  processor: string;
  processorSubscriptionId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  preferences?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    language: string;
  };
}

export interface UpdateKycStatusData {
  status: 'not_started' | 'pending' | 'verified' | 'rejected';
  reason?: string;
}

// Hook to fetch subscriber profile
export const useSubscriberProfile = (subscriberId: string) => {
  return useQuery({
    queryKey: ['subscriber-profile', subscriberId],
    queryFn: async (): Promise<UserProfile> => {
      const data = await apiClient.get<UserProfile>(`/users/subscriber-profile/${subscriberId}`);
      return data;
    },
    enabled: !!subscriberId,
  });
};

// Hook to update subscriber profile
export const useUpdateSubscriberProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ subscriberId, data }: { subscriberId: string; data: UpdateProfileData }) => {
      const result = await apiClient.patch(`/users/subscriber-profile/${subscriberId}`, data);
      return result;
    },
    onSuccess: (_, { subscriberId }) => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({
        queryKey: ['subscriber-profile', subscriberId],
      });
    },
  });
};

// Hook to fetch subscriber subscriptions
export const useSubscriberSubscriptions = (subscriberId: string) => {
  return useQuery({
    queryKey: ['subscriber-subscriptions', subscriberId],
    queryFn: async (): Promise<SubscriberSubscription[]> => {
      const data = await apiClient.get<SubscriberSubscription[]>(`/users/subscriber-profile/${subscriberId}/subscriptions`);
      return data;
    },
    enabled: !!subscriberId,
  });
};

// Hook to update KYC status
export const useUpdateKycStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ subscriberId, data }: { subscriberId: string; data: UpdateKycStatusData }) => {
      const result = await apiClient.patch(`/users/subscriber-profile/${subscriberId}/kyc-status`, data);
      return result;
    },
    onSuccess: (_, { subscriberId }) => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({
        queryKey: ['subscriber-profile', subscriberId],
      });
    },
  });
};

// Hook to get profile summary for dashboard
export const useSubscriberProfileSummary = (subscriberId: string) => {
  return useQuery({
    queryKey: ['subscriber-profile-summary', subscriberId],
    queryFn: async () => {
      const [profile, subscriptions] = await Promise.all([
        apiClient.get<UserProfile>(`/users/subscriber-profile/${subscriberId}`),
        apiClient.get<SubscriberSubscription[]>(`/users/subscriber-profile/${subscriberId}/subscriptions`),
      ]);
      
      return {
        profile,
        subscriptions,
        summary: {
          totalSpent: profile.totalSpent,
          activeSubscriptions: profile.activeSubscriptions,
          lifetimeValue: profile.lifetimeValue,
          kycStatus: profile.kycStatus,
          lastActivity: profile.lastActivity,
          memberSince: profile.createdAt,
        },
      };
    },
    enabled: !!subscriberId,
  });
};