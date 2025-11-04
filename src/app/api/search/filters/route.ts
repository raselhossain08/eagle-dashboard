import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api/v1';

export async function GET(request: NextRequest) {
  try {
    // Get authorization token from cookies (check multiple cookie names)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value || 
                       cookieStore.get('eagle_access_token')?.value ||
                       cookieStore.get('access_token')?.value ||
                       cookieStore.get('token')?.value;

    if (!accessToken) {
      console.log('❌ No access token found in filters API');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Call backend API
    const response = await fetch(
      `${BACKEND_API_URL}/search/filters`,
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

      // For filters, we can provide fallback data
      console.warn('Search filters API warning:', errorData.message || 'Failed to get filters');
      
      // Return default filter structure
      return NextResponse.json({
        userFilters: {
          roles: ['admin', 'user', 'support'],
          statuses: ['active', 'inactive', 'pending', 'suspended'],
        },
        subscriberFilters: {
          statuses: ['active', 'inactive', 'unsubscribed'],
        },
        contractFilters: {
          statuses: ['draft', 'active', 'completed', 'cancelled'],
        },
        categories: ['users', 'subscribers', 'contracts', 'emails', 'companies'],
        sortOptions: [
          { label: 'Relevance', value: 'relevance' },
          { label: 'Date Created', value: 'createdAt' },
          { label: 'Name', value: 'name' },
          { label: 'Email', value: 'email' },
        ],
      }, { status: 200 });
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Search filters API error:', error);
    
    // Return default filter structure on error
    return NextResponse.json({
      userFilters: {
        roles: ['admin', 'user', 'support'],
        statuses: ['active', 'inactive', 'pending', 'suspended'],
      },
      subscriberFilters: {
        statuses: ['active', 'inactive', 'unsubscribed'],
      },
      contractFilters: {
        statuses: ['draft', 'active', 'completed', 'cancelled'],
      },
      categories: ['users', 'subscribers', 'contracts', 'emails', 'companies'],
      sortOptions: [
        { label: 'Relevance', value: 'relevance' },
        { label: 'Date Created', value: 'createdAt' },
        { label: 'Name', value: 'name' },
        { label: 'Email', value: 'email' },
      ],
    }, { status: 200 });
  }
}