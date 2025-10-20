import { NextRequest, NextResponse } from 'next/server'
import { contractsService } from '@/lib/api/contracts.service'

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const contract = await contractsService.sendContract(params.id)
    return NextResponse.json(contract)
  } catch (error) {
    console.error('Failed to send contract:', error)
    return NextResponse.json(
      { error: 'Failed to send contract' },
      { status: 500 }
    )
  }
}