import { NextRequest, NextResponse } from 'next/server';
import { TokenUtils } from '@/lib/utils/token.utils';

// Mock subscription data (same as in main route)
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
 * GET /api/subscriptions/[id] - Get subscription by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const subscription = mockSubscriptions.find(sub => sub._id === id);

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: subscription
    });

  } catch (error) {
    const { id } = await params;
    console.error(`GET /api/subscriptions/${id} error:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/subscriptions/[id] - Update subscription
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { status, price, billingCycle, adminNotes, endDate } = body;

    const subscriptionIndex = mockSubscriptions.findIndex(sub => sub._id === id);
    
    if (subscriptionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const subscription = mockSubscriptions[subscriptionIndex];

    // Update subscription fields
    const updatedSubscription = {
      ...subscription,
      ...(status && { status }),
      ...(price !== undefined && { price }),
      ...(billingCycle && { billingCycle }),
      ...(adminNotes !== undefined && { adminNotes }),
      ...(endDate !== undefined && { endDate }),
      updatedAt: new Date().toISOString()
    };

    // Update isActive based on status
    if (status) {
      updatedSubscription.isActive = status === 'active';
    }

    mockSubscriptions[subscriptionIndex] = updatedSubscription;

    return NextResponse.json({
      success: true,
      data: updatedSubscription
    });

  } catch (error) {
    const { id } = await params;
    console.error(`PUT /api/subscriptions/${id} error:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/subscriptions/[id] - Delete subscription
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const subscriptionIndex = mockSubscriptions.findIndex(sub => sub._id === id);
    
    if (subscriptionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Remove subscription
    mockSubscriptions.splice(subscriptionIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Subscription deleted successfully'
    });

  } catch (error) {
    const { id } = await params;
    console.error(`DELETE /api/subscriptions/${id} error:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}