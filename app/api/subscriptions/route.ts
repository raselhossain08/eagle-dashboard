import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { TokenUtils } from '@/lib/utils/token.utils';

// Mock subscription data for development
const mockSubscriptions = [
  {
    _id: 'sub_1',
    userId: {
      _id: 'user_1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890'
    },
    planId: {
      _id: 'plan_diamond',
      name: 'diamond',
      displayName: 'Diamond Plan',
      category: 'diamond',
      pricing: {
        monthly: { price: 99.99 },
        annual: { price: 999.99 }
      }
    },
    planName: 'Diamond Plan',
    planType: 'subscription',
    billingCycle: 'monthly',
    price: 99.99,
    originalPrice: 129.99,
    currency: 'USD',
    status: 'active',
    startDate: '2024-10-01T00:00:00.000Z',
    endDate: '2024-11-01T00:00:00.000Z',
    nextBillingDate: '2024-11-01T00:00:00.000Z',
    paymentMethod: 'stripe',
    daysRemaining: 15,
    isActive: true,
    displayName: 'Diamond Plan - Monthly',
    createdAt: '2024-09-01T00:00:00.000Z',
    updatedAt: '2024-10-01T00:00:00.000Z'
  },
  {
    _id: 'sub_2',
    userId: {
      _id: 'user_2',
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    planId: {
      _id: 'plan_infinity',
      name: 'infinity',
      displayName: 'Infinity Plan',
      category: 'infinity',
      pricing: {
        annual: { price: 1999.99 }
      }
    },
    planName: 'Infinity Plan',
    planType: 'subscription',
    billingCycle: 'annual',
    price: 1999.99,
    originalPrice: 2499.99,
    currency: 'USD',
    status: 'active',
    startDate: '2024-08-15T00:00:00.000Z',
    endDate: '2025-08-15T00:00:00.000Z',
    nextBillingDate: '2025-08-15T00:00:00.000Z',
    paymentMethod: 'paypal',
    daysRemaining: 289,
    isActive: true,
    displayName: 'Infinity Plan - Annual',
    createdAt: '2024-08-01T00:00:00.000Z',
    updatedAt: '2024-08-15T00:00:00.000Z'
  },
  {
    _id: 'sub_3',
    userId: {
      _id: 'user_3',
      name: 'Bob Wilson',
      email: 'bob@example.com'
    },
    planId: {
      _id: 'plan_basic',
      name: 'basic',
      displayName: 'Basic Plan',
      category: 'basic',
      pricing: {
        monthly: { price: 29.99 }
      }
    },
    planName: 'Basic Plan',
    planType: 'subscription',
    billingCycle: 'monthly',
    price: 29.99,
    originalPrice: 39.99,
    currency: 'USD',
    status: 'cancelled',
    startDate: '2024-07-01T00:00:00.000Z',
    endDate: '2024-10-01T00:00:00.000Z',
    paymentMethod: 'stripe',
    daysRemaining: 0,
    isActive: false,
    displayName: 'Basic Plan - Monthly',
    createdAt: '2024-06-15T00:00:00.000Z',
    updatedAt: '2024-09-25T00:00:00.000Z',
    adminNotes: 'Cancelled due to upgrade to Diamond plan'
  }
];

/**
 * GET /api/subscriptions - Get all subscriptions with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = TokenUtils.getToken();
    if (!token || TokenUtils.isTokenExpired(token)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions
    const userInfo = TokenUtils.getUserInfo();
    if (!userInfo || !['admin', 'superadmin'].includes(userInfo.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const status = searchParams.get('status');
    const planType = searchParams.get('planType');
    const userId = searchParams.get('userId');
    const planId = searchParams.get('planId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Filter subscriptions based on query parameters
    let filteredSubscriptions = [...mockSubscriptions];

    if (status) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => sub.status === status);
    }

    if (planType) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => sub.planType === planType);
    }

    if (userId) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => sub.userId._id === userId);
    }

    if (planId) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => sub.planId._id === planId);
    }

    if (startDate) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => 
        new Date(sub.startDate) >= new Date(startDate)
      );
    }

    if (endDate) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => 
        sub.endDate && new Date(sub.endDate) <= new Date(endDate)
      );
    }

    // Sort subscriptions
    filteredSubscriptions.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];
      
      // Handle nested properties
      if (sortBy === 'userId.name') {
        aValue = a.userId.name;
        bValue = b.userId.name;
      } else if (sortBy === 'planName') {
        aValue = a.planName;
        bValue = b.planName;
      }
      
      // Convert to string for comparison if needed
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    // Pagination
    const total = filteredSubscriptions.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedSubscriptions,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });

  } catch (error) {
    console.error('GET /api/subscriptions error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscriptions - Create new subscription
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = TokenUtils.getToken();
    if (!token || TokenUtils.isTokenExpired(token)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions
    const userInfo = TokenUtils.getUserInfo();
    if (!userInfo || !['admin', 'superadmin'].includes(userInfo.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, planId, billingCycle, price, currency, paymentMethod, startDate, endDate } = body;

    // Validate required fields
    if (!userId || !planId || !billingCycle) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, planId, billingCycle' },
        { status: 400 }
      );
    }

    // Create new subscription (mock implementation)
    const newSubscription = {
      _id: `sub_${Date.now()}`,
      userId: {
        _id: userId,
        name: 'New User',
        email: 'newuser@example.com'
      },
      planId: {
        _id: planId,
        name: 'new-plan',
        displayName: 'New Plan',
        category: 'basic',
        pricing: {}
      },
      planName: 'New Plan',
      planType: 'subscription',
      billingCycle,
      price: price || 0,
      originalPrice: price || 0,
      currency: currency || 'USD',
      status: 'active',
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || null,
      nextBillingDate: null,
      paymentMethod: paymentMethod || 'stripe',
      daysRemaining: null,
      isActive: true,
      displayName: `New Plan - ${billingCycle}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In real implementation, save to database
    // mockSubscriptions.push(newSubscription); // Commented out due to type mismatch

    return NextResponse.json({
      success: true,
      data: newSubscription
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/subscriptions error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}