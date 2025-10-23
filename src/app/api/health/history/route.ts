import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    
    const queryString = limit ? `?limit=${limit}` : '';
    
    const response = await fetch(`${BACKEND_URL}${API_PREFIX}/health/history${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Health history API proxy error:', error);
    
    // Return empty history if backend is unavailable
    return NextResponse.json([], { status: 200 });
  }
}