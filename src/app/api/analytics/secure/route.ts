import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { auth } from '@/lib/auth'
import { withRateLimit } from '@/lib/rate-limit'
import { securityHeaders } from '@/lib/middleware-security'

export async function GET(request: NextRequest) {
  // Apply security headers
  const response = securityHeaders(request)
  
  // Apply rate limiting
  const rateLimitResponse = withRateLimit(async (req: NextRequest) => {
    const session = await getServerSession(auth)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate request parameters
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: startDate and endDate' },
        { status: 400 }
      )
    }

    // Validate date format
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    // Prevent excessive date ranges (max 1 year)
    const oneYearMs = 365 * 24 * 60 * 60 * 1000
    if (end.getTime() - start.getTime() > oneYearMs) {
      return NextResponse.json(
        { error: 'Date range cannot exceed 1 year' },
        { status: 400 }
      )
    }

    try {
      // Simulate database query with timeout
      const data = await Promise.race([
        fetchAnalyticsData(start, end),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ])

      return NextResponse.json(data)
    } catch (error) {
      console.error('Analytics API error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })(request)

  return rateLimitResponse || response
}

async function fetchAnalyticsData(startDate: Date, endDate: Date) {
  // Simulate database query
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return {
    totalUsers: 12458,
    totalSessions: 18742,
    totalPageViews: 89214,
    bounceRate: 42.3,
    avgSessionDuration: 186,
    newUsers: 3247,
    returningUsers: 9211,
    conversionRate: 3.2,
    revenue: 84200,
    generatedAt: new Date().toISOString()
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  const response = securityHeaders(request)
  response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}