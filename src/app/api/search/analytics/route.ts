import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api/v1';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Dashboard analytics API route called');
    
    // Get authorization token from cookies (check multiple cookie names)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value || 
                       cookieStore.get('eagle_access_token')?.value ||
                       cookieStore.get('access_token')?.value ||
                       cookieStore.get('token')?.value;
    
    console.log('🔑 Access token found:', !!accessToken);
    console.log('🍪 Available cookies:', {
      accessToken: !!cookieStore.get('accessToken')?.value,
      eagle_access_token: !!cookieStore.get('eagle_access_token')?.value,
      access_token: !!cookieStore.get('access_token')?.value,
      token: !!cookieStore.get('token')?.value,
    });

    if (!accessToken) {
      console.log('❌ No access token found in any cookie');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const backendUrl = `${BACKEND_API_URL}/search/analytics`;
    console.log('🚀 Calling backend:', backendUrl);

    // Call backend API
    const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('📡 Backend response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }

      if (response.status === 403) {
        return NextResponse.json(
          { error: 'Insufficient permissions to view search analytics' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { 
          error: errorData.message || 'Failed to get search analytics',
          status: response.status 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=900', // Cache for 15 minutes
      },
    });

  } catch (error) {
    console.error('Search analytics API error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}