import { NextRequest, NextResponse } from 'next/server'
import { pdfService } from '@/lib/pdf-service'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // In real implementation, fetch contract data
    const contract = {
      id: params.id,
      title: 'Sample Contract',
      content: 'This is a sample contract content...',
      createdAt: new Date().toISOString()
    }

    const template = {
      content: contract.content
    }

    const customer = {
      name: 'Sample Customer',
      email: 'customer@example.com'
    }

    const pdfBlob = await pdfService.generateContractPdf(contract, template, customer)

    return new Response(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="contract-${params.id}.pdf"`
      }
    })
  } catch (error) {
    console.error('Failed to generate PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}