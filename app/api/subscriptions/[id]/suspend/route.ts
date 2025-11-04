import { NextRequest, NextResponse } from 'next/server';
import { TokenUtils } from '@/lib/utils/token.utils';

// Mock subscription data
const mockSubscriptions = [
  {
    _id: 'sub_1',
    status: 'active',
    isActive: true,
    adminNotes: '',
    updatedAt: '2024-10-01T00:00:00.000Z'
  }
];

/**
 * POST /api/subscriptions/[id]/suspend - Suspend subscription
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
    const { reason } = body;

    if (!reason || reason.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Suspension reason is required' },
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

    if (subscription.status === 'suspended') {
      return NextResponse.json(
        { success: false, error: 'Subscription is already suspended' },
        { status: 400 }
      );
    }

    if (subscription.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Only active subscriptions can be suspended' },
        { status: 400 }
      );
    }

    // Suspend subscription
    const suspendedSubscription = {
      ...subscription,
      status: 'suspended',
      isActive: false,
      adminNotes: `${subscription.adminNotes || ''}\nSuspended: ${reason} (${new Date().toISOString()})`.trim(),
      updatedAt: new Date().toISOString()
    };

    mockSubscriptions[subscriptionIndex] = suspendedSubscription;

    // In real implementation:
    // - Suspend with payment provider
    // - Revoke access to services
    // - Send notification email to user
    // - Update billing system

    return NextResponse.json({
      success: true,
      data: suspendedSubscription,
      message: 'Subscription suspended successfully'
    });

  } catch (error) {
    const { id } = await params;
    console.error(`POST /api/subscriptions/${id}/suspend error:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}