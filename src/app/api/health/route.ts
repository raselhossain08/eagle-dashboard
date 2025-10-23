import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    
    // Build query string if limit is provided
    const queryString = limit ? `?limit=${limit}` : '';
    
    const response = await fetch(`${BACKEND_URL}${API_PREFIX}/health${queryString}`, {
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
    console.error('Health API proxy error:', error);
    
    // Return fallback health data if backend is unavailable
    return NextResponse.json({
      overall: 'critical',
      services: [
        {
          name: 'backend',
          status: 'down',
          details: { error: 'Backend service unavailable' }
        }
      ],
      systemMetrics: {
        memory: { heap: 0, rss: 0, total: 0, used: 0 },
        disk: { total: 0, used: 0, free: 0, usagePercentage: 0 },
        cpu: { usage: 0, cores: 1 },
        timestamp: new Date().toISOString()
      },
      lastCheck: new Date().toISOString(),
      healthScore: 0
    }, { status: 200 }); // Return 200 to prevent frontend errors
  }
}