// Externals
import { NextResponse } from 'next/server'
// Locals
import { openaiService } from '@/services/open-ai/openaiService'


export async function POST(request: Request) {
  try {
    const { attachments, textContent } = await request.json()

    if (!attachments || !Array.isArray(attachments)) {
      return NextResponse.json(
        { error: 'Attachments are required and must be an array' },
        { status: 400 }
      )
    }

    // Validate attachments
    for (const attachment of attachments) {
      if (!attachment.name || !attachment.type || !attachment.content) {
        return NextResponse.json(
          { error: 'Each attachment must have name, type, and content' },
          { status: 400 }
        )
      }
    }

    // Process the data using OpenAI
    const result = await openaiService.analyzeData(
      textContent || '',
      attachments,
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in analyze endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to analyze data' },
      { status: 500 }
    )
  }
} 