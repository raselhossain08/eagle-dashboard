import { NextRequest, NextResponse } from 'next/server';
import { TokenUtils } from '@/lib/utils/token.utils';

// Mock subscription data (same as other routes)
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
  }
];

/**
 * POST /api/subscriptions/[id]/cancel - Cancel subscription
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
    const body = await request.json();
    const { reason, immediate = false, refund = false } = body;

    if (!reason || reason.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Cancellation reason is required' },
        { status: 400 }
      );
    }

    const subscriptionIndex = mockSubscriptions.findIndex(sub => sub._id === id);
    
    if (subscriptionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const subscription = mockSubscriptions[subscriptionIndex];

    if (subscription.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Subscription is already cancelled' },
        { status: 400 }
      );
    }

    // Update subscription to cancelled status
    const cancelledSubscription = {
      ...subscription,
      status: 'cancelled',
      isActive: false,
      adminNotes: `Cancelled: ${reason}${refund ? ' (Refund requested)' : ''}`,
      updatedAt: new Date().toISOString(),
      ...(immediate && { endDate: new Date().toISOString() })
    };

    mockSubscriptions[subscriptionIndex] = cancelledSubscription;

    // In real implementation:
    // - Cancel with payment provider (Stripe, PayPal, etc.)
    // - Process refund if requested
    // - Send notification email to user
    // - Update billing system

    return NextResponse.json({
      success: true,
      data: cancelledSubscription,
      message: `Subscription cancelled successfully${refund ? ' with refund' : ''}`
    });

  } catch (error) {
    const { id } = await params;
    console.error(`POST /api/subscriptions/${id}/cancel error:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}