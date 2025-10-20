import { NextRequest, NextResponse } from 'next/server'
import { UpdateTemplateDto } from '@/lib/types/contracts'

interface RouteParams {
  params: {
    id: string
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body: UpdateTemplateDto = await request.json()

    // In real implementation, update template in database
    const updatedTemplate = {
      id: params.id,
      ...body,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(updatedTemplate)
  } catch (error) {
    console.error('Failed to update template:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // In real implementation, delete template from database
    // Check if template is being used before deletion

    return NextResponse.json({ 
      message: 'Template deleted successfully',
      id: params.id
    })
  } catch (error) {
    console.error('Failed to delete template:', error)
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}