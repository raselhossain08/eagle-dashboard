import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { suggestions: [], query: query || '', category },
        { status: 200 }
      );
    }

    // Get authorization token from cookies (check multiple cookie names)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value || 
                       cookieStore.get('eagle_access_token')?.value ||
                       cookieStore.get('access_token')?.value ||
                       cookieStore.get('token')?.value;

    if (!accessToken) {
      console.log('❌ No access token found in suggestions API');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      q: query,
      ...(category && { category }),
    });

    // Call backend API
    const response = await fetch(
      `${BACKEND_API_URL}/search/suggestions?${queryParams}`,
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

      // For suggestions, we can return empty results instead of error
      console.warn('Search suggestions API warning:', errorData.message || 'Failed to get suggestions');
      return NextResponse.json(
        { suggestions: [], query, category },
        { status: 200 }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });

  } catch (error) {
    console.error('Search suggestions API error:', error);
    
    // Return empty suggestions on error instead of failing
    return NextResponse.json(
      { 
        suggestions: [], 
        query: request.nextUrl.searchParams.get('q') || '',
        category: request.nextUrl.searchParams.get('category'),
      },
      { status: 200 }
    );
  }
}