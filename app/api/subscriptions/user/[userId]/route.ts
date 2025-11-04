import { NextRequest, NextResponse } from 'next/server';
import { TokenUtils } from '@/lib/utils/token.utils';

// Mock subscription data
const mockSubscriptions = [
  {
    _id: 'sub_1',
    userId: {
      _id: 'user_1',
      name: 'John Doe',
      email: 'john@example.com'
    },
    planId: {
      _id: 'plan_diamond',
      name: 'diamond',
      displayName: 'Diamond Plan',
      category: 'diamond'
    },
    planName: 'Diamond Plan',
    planType: 'subscription',
    billingCycle: 'monthly',
    price: 99.99,
    status: 'active',
    createdAt: '2024-10-01T00:00:00.000Z'
  },
  {
    _id: 'sub_2',
    userId: {
      _id: 'user_1',
      name: 'John Doe',
      email: 'john@example.com'
    },
    planId: {
      _id: 'plan_script',
      name: 'script',
      displayName: 'Script Access',
      category: 'script'
    },
    planName: 'Script Access',
    planType: 'script',
    billingCycle: 'oneTime',
    price: 49.99,
    status: 'active',
    createdAt: '2024-09-15T00:00:00.000Z'
  }
];

/**
 * GET /api/subscriptions/user/[userId] - Get user's subscriptions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
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
    if (!userInfo || !['admin', 'superadmin', 'user'].includes(userInfo.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { userId } = await params;

    // If user is not admin/superadmin, they can only access their own subscriptions
    if (!['admin', 'superadmin'].includes(userInfo.role) && userInfo.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You can only access your own subscriptions' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    // Filter subscriptions by user ID
    let userSubscriptions = mockSubscriptions.filter(sub => sub.userId._id === userId);

    if (status) {
      userSubscriptions = userSubscriptions.filter(sub => sub.status === status);
    }

    // Sort by creation date (newest first)
    userSubscriptions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Pagination
    const total = userSubscriptions.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSubscriptions = userSubscriptions.slice(startIndex, endIndex);

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
    const { userId } = await params;
    console.error(`GET /api/subscriptions/user/${userId} error:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}