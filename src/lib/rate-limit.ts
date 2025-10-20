import { NextResponse } from 'next/server'

class RateLimiter {
  private requests = new Map<string, number[]>()
  
  constructor(private windowMs: number, private max: number) {}

  isRateLimited(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [])
    }
    
    const timestamps = this.requests.get(identifier)!
    const recentRequests = timestamps.filter(time => time > windowStart)
    
    this.requests.set(identifier, [...recentRequests, now])
    
    // Clean up old entries
    if (recentRequests.length === 0) {
      setTimeout(() => {
        if (this.requests.get(identifier)?.every(time => time <= windowStart)) {
          this.requests.delete(identifier)
        }
      }, this.windowMs)
    }
    
    return recentRequests.length >= this.max
  }

  getRemaining(identifier: string): number {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    const timestamps = this.requests.get(identifier) || []
    const recentRequests = timestamps.filter(time => time > windowStart)
    
    return Math.max(0, this.max - recentRequests.length)
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter(60 * 1000, 100) // 100 requests per minute

export function withRateLimit(handler: Function) {
  return async (request: Request, ...args: any[]) => {
    const identifier = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'anonymous'
    
    if (rateLimiter.isRateLimited(identifier)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': (Date.now() + 60000).toString()
          }
        }
      )
    }
    
    const response = await handler(request, ...args)
    
    if (response) {
      response.headers.set('X-RateLimit-Limit', '100')
      response.headers.set('X-RateLimit-Remaining', rateLimiter.getRemaining(identifier).toString())
    }
    
    return response
  }
}