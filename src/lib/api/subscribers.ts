// lib/api/subscribers.ts (Updated)
import { 
  SubscriberProfile, 
  Subscription, 
  Activity, 
  SubscriberParams, 
  SubscriberResponse 
} from '@/types/subscribers';

// Mock data for demonstration - replace with actual API calls
const mockSubscribers: SubscriberProfile[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    company: 'Acme Inc',
    phone: '+1-555-0123',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001'
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      language: 'en'
    },
    kycStatus: 'verified',
    status: 'active',
    totalSpent: 4500,
    lifetimeValue: 6800,
    lastActivity: '2024-01-20T10:30:00Z',
    createdAt: '2023-06-15T08:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  // Add more mock data as needed
];

class SubscribersService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  async getSubscribers(params?: SubscriberParams): Promise<SubscriberResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredSubscribers = [...mockSubscribers];

    // Apply search
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filteredSubscribers = filteredSubscribers.filter(sub =>
        sub.firstName.toLowerCase().includes(searchLower) ||
        sub.lastName.toLowerCase().includes(searchLower) ||
        sub.email.toLowerCase().includes(searchLower) ||
        sub.company?.toLowerCase().includes(searchLower)
      );
    }

    // Apply filters
    if (params?.filters) {
      if (params.filters.status?.length) {
        filteredSubscribers = filteredSubscribers.filter(sub =>
          params.filters!.status!.includes(sub.status)
        );
      }
      if (params.filters.kycStatus?.length) {
        filteredSubscribers = filteredSubscribers.filter(sub =>
          params.filters!.kycStatus!.includes(sub.kycStatus)
        );
      }
    }

    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSubscribers = filteredSubscribers.slice(startIndex, endIndex);

    return {
      subscribers: paginatedSubscribers,
      totalCount: filteredSubscribers.length,
      page,
      totalPages: Math.ceil(filteredSubscribers.length / limit),
    };
  }

  async getSubscriber(id: string): Promise<SubscriberProfile> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const subscriber = mockSubscribers.find(sub => sub.id === id);
    if (!subscriber) {
      throw new Error('Subscriber not found');
    }
    return subscriber;
  }

  async updateSubscriber(id: string, data: Partial<SubscriberProfile>): Promise<SubscriberProfile> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const subscriberIndex = mockSubscribers.findIndex(sub => sub.id === id);
    if (subscriberIndex === -1) {
      throw new Error('Subscriber not found');
    }

    const updatedSubscriber = {
      ...mockSubscribers[subscriberIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // In a real app, this would be an API call
    // mockSubscribers[subscriberIndex] = updatedSubscriber;

    return updatedSubscriber;
  }

  async deleteSubscriber(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const subscriberIndex = mockSubscribers.findIndex(sub => sub.id === id);
    if (subscriberIndex === -1) {
      throw new Error('Subscriber not found');
    }

    // In a real app, this would be an API call
    // mockSubscribers.splice(subscriberIndex, 1);
  }

  // Add real API integration methods
  async exportSubscribers(format: string, fields: string[], subscriberIds?: string[]): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/subscribers/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        format,
        fields,
        subscriberIds,
      }),
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  async getSubscriberAnalytics(params: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/analytics/subscribers?${new URLSearchParams(params)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }
    return response.json();
  }

  async createSegment(segmentData: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/segments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(segmentData),
    });

    if (!response.ok) {
      throw new Error('Failed to create segment');
    }

    return response.json();
  }
}

export const subscribersService = new SubscribersService();