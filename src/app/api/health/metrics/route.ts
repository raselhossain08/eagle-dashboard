import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}${API_PREFIX}/health/metrics`, {
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
    console.error('Health metrics API proxy error:', error);
    
    // Return fallback metrics
    return NextResponse.json({
      memory: { heap: 0, rss: 0, total: 0, used: 0 },
      disk: { total: 0, used: 0, free: 0, usagePercentage: 0 },
      cpu: { usage: 0, cores: 1 },
      timestamp: new Date().toISOString()
    }, { status: 200 });
  }
}