import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Mock signatures data
    const signatures = Array.from({ length: limit }, (_, i) => ({
      id: `sig_${i}`,
      contractId: `cnt_${i}`,
      fullName: `User ${i}`,
      email: `user${i}@example.com`,
      signatureType: i % 3 === 0 ? 'drawn' : i % 3 === 1 ? 'typed' : 'uploaded',
      signedAt: new Date(Date.now() - i * 86400000).toISOString(),
      ipAddress: `192.168.1.${i}`,
      userAgent: 'Mozilla/5.0...',
      contentHash: `hash_${i}`
    }))

    const response = {
      data: signatures,
      pagination: {
        page,
        limit,
        total: 100
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to fetch signatures:', error)
    return NextResponse.json(
      { error: 'Failed to fetch signatures' },
      { status: 500 }
    )
  }
}