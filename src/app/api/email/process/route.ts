// src/app/api/email/process/route.ts
// Externals
import { NextRequest, NextResponse } from 'next/server'
// Locals
import type { 
  ExtractedInboundEmailData,
  ProcessedInboundEmail,
} from '@/types'
import { dataProcessingService } from '@/services/data/processing-service'
import { getConsoleMetadata } from '@/utils'


const LOG_TYPE = 'API_CALL'
const FILE_NAME: string = 'src/app/api/email/process/route.ts'


// ------------------------------ POST Request ---------------------------------
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const extractedInboundEmailData: ExtractedInboundEmailData = await request.json()

    // Process the email data using DataProcessingService
    const processedInboundEmail: ProcessedInboundEmail = 
      await dataProcessingService.processInboundEmailData(
        extractedInboundEmailData
      )

    const jsonBody = {
      message: 'Email processed successfully',
      data: processedInboundEmail
    }
    const responseInit: ResponseInit = {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }

    // Return the processed data
    return NextResponse.json(jsonBody, responseInit)
  } catch (error) {
    const consoleMetadata: string = getConsoleMetadata(
      LOG_TYPE, 
      false,
      FILE_NAME, 
      'POST()'
    )
    console.error(`${ consoleMetadata } Error processing email data: `, error)
  
    const jsonBody = {
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
    const responseInit: ResponseInit = {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  
    // Return error response
    return NextResponse.json(jsonBody, responseInit)
  }
} 