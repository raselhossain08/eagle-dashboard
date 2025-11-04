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
    _id: 'sub_4',
    userId: {
      _id: 'user_2',
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    planId: {
      _id: 'plan_diamond',
      name: 'diamond',
      displayName: 'Diamond Plan',
      category: 'diamond'
    },
    planName: 'Diamond Plan',
    planType: 'subscription',
    billingCycle: 'annual',
    price: 999.99,
    status: 'active',
    createdAt: '2024-09-01T00:00:00.000Z'
  },
  {
    _id: 'sub_5',
    userId: {
      _id: 'user_3',
      name: 'Bob Wilson',
      email: 'bob@example.com'
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
    status: 'cancelled',
    createdAt: '2024-08-15T00:00:00.000Z'
  }
];

/**
 * GET /api/subscriptions/plan/[planId] - Get subscriptions for a specific plan
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
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
        { success: false, error: 'Insufficient permissions. Admin access required.' },
        { status: 403 }
      );
    }

    const { planId } = await params;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const billingCycle = searchParams.get('billingCycle');

    // Filter subscriptions by plan ID
    let planSubscriptions = mockSubscriptions.filter(sub => sub.planId._id === planId);

    if (status) {
      planSubscriptions = planSubscriptions.filter(sub => sub.status === status);
    }

    if (billingCycle) {
      planSubscriptions = planSubscriptions.filter(sub => sub.billingCycle === billingCycle);
    }

    // Sort by creation date (newest first)
    planSubscriptions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Calculate plan analytics
    const analytics = {
      total: planSubscriptions.length,
      active: planSubscriptions.filter(sub => sub.status === 'active').length,
      cancelled: planSubscriptions.filter(sub => sub.status === 'cancelled').length,
      revenue: planSubscriptions
        .filter(sub => sub.status === 'active')
        .reduce((total, sub) => {
          const monthlyRevenue = sub.billingCycle === 'annual' 
            ? sub.price / 12 
            : sub.billingCycle === 'oneTime' 
            ? sub.price / 12
            : sub.price;
          return total + monthlyRevenue;
        }, 0),
      billingCycleBreakdown: planSubscriptions.reduce((acc, sub) => {
        const existing = acc.find(item => item.cycle === sub.billingCycle);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({ cycle: sub.billingCycle, count: 1 });
        }
        return acc;
      }, [] as Array<{ cycle: string; count: number }>)
    };

    // Pagination
    const total = planSubscriptions.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSubscriptions = planSubscriptions.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedSubscriptions,
      analytics,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });

  } catch (error) {
    const { planId } = await params;
    console.error(`GET /api/subscriptions/plan/${planId} error:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}