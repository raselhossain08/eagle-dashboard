import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    // Mock metrics data - in real app, calculate from database
    const metrics = {
      totalContracts: 156,
      draftContracts: 23,
      sentContracts: 45,
      signedContracts: 84,
      expiredContracts: 4,
      signatureRate: 65.4,
      averageSigningTime: 2.3, // hours
      pendingSignatures: 12
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Failed to fetch contract metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}