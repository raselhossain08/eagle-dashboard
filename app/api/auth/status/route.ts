import { NextRequest, NextResponse } from 'next/server';
import { CookieManager } from '@/lib/utils/cookie-manager';
import { TokenUtils } from '@/lib/utils/token.utils';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies (try AdminToken first, then token for backward compatibility)
    const token = request.cookies.get('AdminToken')?.value || request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { authenticated: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (TokenUtils.isTokenExpired(token)) {
      return NextResponse.json(
        { authenticated: false, message: 'Token expired' },
        { status: 401 }
      );
    }

    // Decode token to get user info
    const tokenData = TokenUtils.decodeToken(token);
    
    if (!tokenData) {
      return NextResponse.json(
        { authenticated: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: tokenData.id,
        email: tokenData.email,
        role: tokenData.role,
      },
    });

  } catch (error) {
    console.error('Auth status check error:', error);
    return NextResponse.json(
      { authenticated: false, message: 'Authentication check failed' },
      { status: 500 }
    );
  }
}