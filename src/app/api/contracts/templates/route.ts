import { NextRequest, NextResponse } from 'next/server'
import { templatesService } from '@/lib/api/templates.service'
import { CreateTemplateDto, TemplatesQueryParams } from '@/lib/types/contracts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const queryParams: TemplatesQueryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
      search: searchParams.get('search') || undefined
    }

    const templates = await templatesService.getTemplates(queryParams)
    return NextResponse.json(templates)
  } catch (error) {
    console.error('Failed to fetch templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTemplateDto = await request.json()
    
    if (!body.name || !body.content || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const template = await templatesService.createTemplate(body)
    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Failed to create template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}