import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Get authorization token from cookies (check multiple cookie names)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value || 
                       cookieStore.get('eagle_access_token')?.value ||
                       cookieStore.get('access_token')?.value ||
                       cookieStore.get('token')?.value;

    if (!accessToken) {
      console.log('❌ No access token found in users search API');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      q: query,
      ...(role && { role }),
      ...(status && { status }),
      ...(limit && { limit }),
      ...(offset && { offset }),
    });

    // Call backend API
    const response = await fetch(
      `${BACKEND_API_URL}/search/users?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

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
          { error: 'Insufficient permissions to search users' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { 
          error: errorData.message || 'Failed to search users',
          status: response.status 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('User search API error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}