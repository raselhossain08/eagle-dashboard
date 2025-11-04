import { NextRequest, NextResponse } from 'next/server';

// Note: PDF parsing is disabled due to missing dependencies
// To enable PDF parsing, install: npm install pdf-parse @napi-rs/canvas
const pdfParse: any = null;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('document') as File;
    
    if (!file) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No document file provided',
          error: 'Document file is required' 
        },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid file type',
          error: 'Only PDF, DOC, and DOCX files are supported' 
        },
        { status: 400 }
      );
    }

    // Check file size (25MB limit)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'File too large',
          error: 'File size must be less than 25MB' 
        },
        { status: 400 }
      );
    }

    let extractedText = '';

    // Handle PDF files
    if (file.type === 'application/pdf') {
      if (!pdfParse) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'PDF processing not available',
            error: 'PDF parsing dependencies are not installed. Please install @napi-rs/canvas and pdf-parse.' 
          },
          { status: 501 }
        );
      }
      
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Failed to parse PDF',
            error: 'PDF extraction failed: Unable to read PDF content' 
          },
          { status: 500 }
        );
      }
    }
    // Handle Word documents (basic implementation)
    else if (file.type.includes('word') || file.type.includes('officedocument')) {
      // For Word documents, you might need additional libraries like mammoth
      // For now, we'll return a placeholder message
      return NextResponse.json(
        { 
          success: false, 
          message: 'Word document processing not implemented',
          error: 'Word document extraction is not yet supported. Please convert to PDF.' 
        },
        { status: 501 }
      );
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No text content found',
          error: 'The document appears to be empty or contains no extractable text' 
        },
        { status: 400 }
      );
    }

    // Extract contract data using simple text analysis
    const extractedData = extractContractData(extractedText);

    return NextResponse.json({
      success: true,
      message: 'Document processed successfully',
      data: extractedData
    });

  } catch (error: any) {
    console.error('Document extraction error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to extract document data',
        error: error.message || 'An unexpected error occurred during processing' 
      },
      { status: 500 }
    );
  }
}

// Helper function to extract contract data from text
function extractContractData(text: string) {
  const data: any = {
    content: text,
    title: null,
    parties: [],
    amount: null,
    duration: null,
    startDate: null,
    endDate: null
  };

  // Extract title (first significant line or header)
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  if (lines.length > 0) {
    // Look for a title-like line (usually short and at the beginning)
    for (const line of lines.slice(0, 5)) {
      const trimmedLine = line.trim();
      if (trimmedLine.length > 5 && trimmedLine.length < 100 && 
          (trimmedLine.includes('Contract') || trimmedLine.includes('Agreement') || 
           trimmedLine.includes('Advisory') || /^[A-Z\s]+$/.test(trimmedLine))) {
        data.title = trimmedLine;
        break;
      }
    }
  }

  // Extract parties (names mentioned in context)
  const partyPatterns = [
    /between\s+([A-Z][a-zA-Z\s]+)\s+(?:and|&)\s+([A-Z][a-zA-Z\s]+)/gi,
    /parties?:\s*([A-Z][a-zA-Z\s]+)(?:\s+(?:and|&)\s+([A-Z][a-zA-Z\s]+))?/gi,
    /client[:\s]+([A-Z][a-zA-Z\s]+)/gi,
    /advisor[:\s]+([A-Z][a-zA-Z\s]+)/gi
  ];

  partyPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1] && match[1].trim().length > 2) {
        const name = match[1].trim();
        if (!data.parties.some((p: any) => p.name === name)) {
          data.parties.push({
            name: name,
            type: 'individual', // Default to individual, could be enhanced
            contact: null
          });
        }
      }
      if (match[2] && match[2].trim().length > 2) {
        const name = match[2].trim();
        if (!data.parties.some((p: any) => p.name === name)) {
          data.parties.push({
            name: name,
            type: 'individual',
            contact: null
          });
        }
      }
    }
  });

  // Extract monetary amounts
  const moneyPatterns = [
    /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollars?|USD|usd)/gi,
    /fee[:\s]+\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi
  ];

  moneyPatterns.forEach(pattern => {
    const match = pattern.exec(text);
    if (match && match[1]) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (amount > data.amount || data.amount === null) {
        data.amount = amount;
      }
    }
  });

  // Extract dates
  const datePatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g,
    /(?:start|begin|commence|effective)(?:\s+date)?[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
    /(?:end|expir|terminat)(?:\s+date)?[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi
  ];

  datePatterns.forEach((pattern, index) => {
    const match = pattern.exec(text);
    if (match && match[1]) {
      const dateStr = match[1];
      if (index === 1) { // Start date pattern
        data.startDate = dateStr;
      } else if (index === 2) { // End date pattern
        data.endDate = dateStr;
      } else if (!data.startDate) { // First date found
        data.startDate = dateStr;
      }
    }
  });

  // Extract duration/term information
  const durationPatterns = [
    /(?:term|duration|period)[:\s]*(\d+)\s*(month|year|day)s?/gi,
    /(\d+)[-\s]+(month|year|day)\s*(?:term|period|contract)/gi
  ];

  durationPatterns.forEach(pattern => {
    const match = pattern.exec(text);
    if (match && match[1] && match[2]) {
      data.duration = `${match[1]} ${match[2]}${match[1] !== '1' ? 's' : ''}`;
    }
  });

  return data;
}