import { NextRequest, NextResponse } from 'next/server';
import { TokenUtils } from '@/lib/utils/token.utils';

// Mock subscription data for analytics calculations
const mockSubscriptions = [
  {
    _id: 'sub_1',
    status: 'active',
    planType: 'subscription',
    billingCycle: 'monthly',
    price: 99.99,
    createdAt: '2024-10-01T00:00:00.000Z'
  },
  {
    _id: 'sub_2',
    status: 'active',
    planType: 'subscription',
    billingCycle: 'annual',
    price: 1999.99,
    createdAt: '2024-08-15T00:00:00.000Z'
  },
  {
    _id: 'sub_3',
    status: 'cancelled',
    planType: 'subscription',
    billingCycle: 'monthly',
    price: 29.99,
    createdAt: '2024-07-01T00:00:00.000Z'
  },
  {
    _id: 'sub_4',
    status: 'active',
    planType: 'mentorship',
    billingCycle: 'monthly',
    price: 199.99,
    createdAt: '2024-09-15T00:00:00.000Z'
  },
  {
    _id: 'sub_5',
    status: 'active',
    planType: 'script',
    billingCycle: 'oneTime',
    price: 49.99,
    createdAt: '2024-10-10T00:00:00.000Z'
  },
  {
    _id: 'sub_6',
    status: 'cancelled',
    planType: 'subscription',
    billingCycle: 'annual',
    price: 999.99,
    createdAt: '2024-06-01T00:00:00.000Z'
  }
];

/**
 * GET /api/subscriptions/analytics - Get subscription analytics
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

    // Calculate analytics
    const totalActive = mockSubscriptions.filter(sub => sub.status === 'active').length;
    const totalCancelled = mockSubscriptions.filter(sub => sub.status === 'cancelled').length;
    
    // Calculate new subscriptions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newSubscriptions = mockSubscriptions.filter(sub => 
      new Date(sub.createdAt) >= thirtyDaysAgo
    ).length;

    // Calculate revenue (active subscriptions only)
    const activeSubscriptions = mockSubscriptions.filter(sub => sub.status === 'active');
    const revenue = activeSubscriptions.reduce((total, sub) => {
      // Convert annual to monthly for consistent calculation
      const monthlyRevenue = sub.billingCycle === 'annual' 
        ? sub.price / 12 
        : sub.billingCycle === 'oneTime' 
        ? sub.price / 12 // Assume one-time spreads over a year
        : sub.price;
      return total + monthlyRevenue;
    }, 0);

    // Calculate churn count (cancelled in last 30 days)
    const churnCount = mockSubscriptions.filter(sub => 
      sub.status === 'cancelled' && 
      new Date(sub.createdAt) >= thirtyDaysAgo // Using createdAt as proxy for cancellation date
    ).length;

    // Breakdown by status
    const statusBreakdown = mockSubscriptions.reduce((acc, sub) => {
      const existing = acc.find(item => item._id === sub.status);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ _id: sub.status, count: 1 });
      }
      return acc;
    }, [] as Array<{ _id: string; count: number }>);

    // Breakdown by plan type
    const planTypeBreakdown = mockSubscriptions.reduce((acc, sub) => {
      const existing = acc.find(item => item._id === sub.planType);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ _id: sub.planType, count: 1 });
      }
      return acc;
    }, [] as Array<{ _id: string; count: number }>);

    // Breakdown by billing cycle
    const billingCycleBreakdown = mockSubscriptions.reduce((acc, sub) => {
      const existing = acc.find(item => item._id === sub.billingCycle);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ _id: sub.billingCycle, count: 1 });
      }
      return acc;
    }, [] as Array<{ _id: string; count: number }>);

    const analytics = {
      summary: {
        totalActive,
        totalCancelled,
        newSubscriptions,
        revenue: Math.round(revenue * 100) / 100, // Round to 2 decimal places
        churnCount
      },
      breakdown: {
        byStatus: statusBreakdown,
        byPlanType: planTypeBreakdown,
        byBillingCycle: billingCycleBreakdown
      }
    };

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('GET /api/subscriptions/analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}