import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}${API_PREFIX}/health/ping`, {
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
    console.error('Health ping API proxy error:', error);
    
    // Return fallback ping response
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      uptime: 0,
      message: 'Backend service unavailable'
    }, { status: 503 });
  }
}