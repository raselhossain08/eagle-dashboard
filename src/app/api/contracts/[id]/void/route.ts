import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { reason } = await request.json()

    if (!reason) {
      return NextResponse.json(
        { error: 'Void reason is required' },
        { status: 400 }
      )
    }

    // In real implementation, update contract status to 'void'
    // and store the void reason
    const voidedContract = {
      id: params.id,
      status: 'void' as const,
      voidReason: reason,
      voidedAt: new Date().toISOString()
    }

    return NextResponse.json(voidedContract)
  } catch (error) {
    console.error('Failed to void contract:', error)
    return NextResponse.json(
      { error: 'Failed to void contract' },
      { status: 500 }
    )
  }
}