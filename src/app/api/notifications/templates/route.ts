import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    // Extract authorization from headers or cookies
    let authHeader = request.headers.get('Authorization') || '';
    
    // If no Authorization header, try to get token from cookies
    if (!authHeader) {
      const cookies = request.headers.get('cookie') || '';
      const tokenMatch = cookies.match(/(?:^|; )(?:accessToken|eagle_access_token|access_token|token)=([^;]*)/);
      if (tokenMatch) {
        authHeader = `Bearer ${tokenMatch[1]}`;
      }
    }

    console.log('🔄 Dashboard API Route - Forwarding GET to backend:', `${API_BASE_URL}/notifications/templates`);
    console.log('🔑 Dashboard API Route - Auth header:', authHeader ? 'Present' : 'Missing');
    
    const response = await fetch(`${API_BASE_URL}/notifications/templates?${queryString}`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '', // Forward cookies too
      },
    });

    console.log('📤 Dashboard API Route - Backend GET response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Dashboard API Route - Backend GET error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract authorization from headers or cookies
    let authHeader = request.headers.get('Authorization') || '';
    
    // If no Authorization header, try to get token from cookies
    if (!authHeader) {
      const cookies = request.headers.get('cookie') || '';
      const tokenMatch = cookies.match(/(?:^|; )(?:accessToken|eagle_access_token|access_token|token)=([^;]*)/);
      if (tokenMatch) {
        authHeader = `Bearer ${tokenMatch[1]}`;
      }
    }

    console.log('🔄 Dashboard API Route - Forwarding to backend:', `${API_BASE_URL}/notifications/templates`);
    console.log('🔑 Dashboard API Route - Auth header:', authHeader ? 'Present' : 'Missing');
    
    const response = await fetch(`${API_BASE_URL}/notifications/templates`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '', // Forward cookies too
      },
      body: JSON.stringify(body),
    });

    console.log('📤 Dashboard API Route - Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Dashboard API Route - Backend error:', errorText);
      return NextResponse.json(
        { error: errorText || 'Failed to create template' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}