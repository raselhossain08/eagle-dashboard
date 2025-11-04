import { NextRequest, NextResponse } from 'next/server';
import { TokenUtils } from '@/lib/utils/token.utils';

// Mock subscription data
const mockSubscriptions = [
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
 * POST /api/subscriptions/[id]/reactivate - Reactivate cancelled subscription
 */
export async function POST(
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

    const subscription = mockSubscriptions[subscriptionIndex];

    if (subscription.status === 'active') {
      return NextResponse.json(
        { success: false, error: 'Subscription is already active' },
        { status: 400 }
      );
    }

    if (subscription.status !== 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Only cancelled subscriptions can be reactivated' },
        { status: 400 }
      );
    }

    // Calculate new billing dates
    const now = new Date();
    const nextBillingDate = new Date(now);
    
    if (subscription.billingCycle === 'monthly') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else if (subscription.billingCycle === 'annual') {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    // Calculate days remaining
    const daysRemaining = Math.ceil((nextBillingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Reactivate subscription
    const reactivatedSubscription = {
      ...subscription,
      status: 'active',
      isActive: true,
      startDate: now.toISOString(),
      endDate: nextBillingDate.toISOString(),
      nextBillingDate: nextBillingDate.toISOString(),
      daysRemaining,
      adminNotes: `${subscription.adminNotes || ''}\nReactivated on ${now.toISOString()}`.trim(),
      updatedAt: now.toISOString()
    };

    mockSubscriptions[subscriptionIndex] = reactivatedSubscription;

    // In real implementation:
    // - Reactivate with payment provider (Stripe, PayPal, etc.)
    // - Process initial payment if required
    // - Send confirmation email to user
    // - Update billing system
    // - Grant access to services

    return NextResponse.json({
      success: true,
      data: reactivatedSubscription,
      message: 'Subscription reactivated successfully'
    });

  } catch (error) {
    const { id } = await params;
    console.error(`POST /api/subscriptions/${id}/reactivate error:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}