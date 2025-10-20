// app/api/auth/_log/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the authentication event
    console.log('Auth log:', {
      timestamp: new Date().toISOString(),
      event: body.event || 'unknown',
      userId: body.userId,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    // In a real application, you would store this in your database
    // For now, just return success
    return NextResponse.json({ 
      success: true,
      message: 'Event logged successfully'
    });

  } catch (error) {
    console.error('Auth logging error:', error);
    return NextResponse.json(
      { error: 'Failed to log auth event' },
      { status: 500 }
    );
  }
}