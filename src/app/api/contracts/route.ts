import { NextRequest, NextResponse } from 'next/server'
import { contractsService } from '@/lib/api/contracts.service'
import { CreateContractDto, ContractsQueryParams } from '@/lib/types/contracts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const queryParams: ContractsQueryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      status: searchParams.get('status')?.split(','),
      customerId: searchParams.get('customerId') || undefined,
      templateId: searchParams.get('templateId') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc'
    }

    const contracts = await contractsService.getContracts(queryParams)
    return NextResponse.json(contracts)
  } catch (error) {
    console.error('Failed to fetch contracts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contracts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateContractDto = await request.json()
    
    // Validate required fields
    if (!body.templateId || !body.userId || !body.title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const contract = await contractsService.createContract(body)
    return NextResponse.json(contract, { status: 201 })
  } catch (error) {
    console.error('Failed to create contract:', error)
    return NextResponse.json(
      { error: 'Failed to create contract' },
      { status: 500 }
    )
  }
}