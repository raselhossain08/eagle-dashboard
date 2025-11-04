import { NextRequest } from 'next/server'
import { API_BASE_URL } from '@/lib/config'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const contractId = resolvedParams.id

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/download`, {
      method: 'GET',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    })

    if (!response.ok) {
      return new Response('Failed to download contract', { 
        status: response.status 
      })
    }

    // Get the PDF content
    const pdfBuffer = await response.arrayBuffer()
    
    // Return the PDF with proper headers
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="contract-${contractId}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error downloading contract:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}