import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}${API_PREFIX}/health/alerts`, {
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
    console.error('Health alerts API proxy error:', error);
    
    // Return fallback alert if backend is unavailable
    return NextResponse.json([
      {
        id: 'backend-unavailable',
        title: 'Backend Service Unavailable',
        description: 'Unable to connect to the backend health service',
        severity: 'critical',
        service: 'backend',
        timestamp: new Date().toISOString(),
        acknowledged: false
      }
    ], { status: 200 });
  }
}