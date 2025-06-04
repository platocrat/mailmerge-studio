// `src/app/api/postmark/webhook/inbound/route.ts`
// Externals
import { NextRequest, NextResponse } from 'next/server'
// Locals
import type { 
  INBOUND_EMAIL__POSTMARK,
  ProcessedInboundEmail,
} from '@/types'
import { postmarkService } from '@/services'
import { dataProcessingService } from '@/services/data/processing-service'

// // Verify Postmark webhook signature
// function verifyPostmarkWebhook(request: NextRequest): boolean {
//   const signature = request.headers.get('X-Postmark-Server-Token')
//   return signature === process.env.POSTMARK_SERVER_TOKEN
// }

// ------------------------------ POST Request ---------------------------------
export async function POST(request: NextRequest) {
  try {    
    // if (!verifyPostmarkWebhook(request)) {
    //   return NextResponse.json(
    //     { 
    //       error: 'Invalid signature: ' + request.headers.get('X-Postmark-Server-Token'),
    //       details: 'The signature provided in the request does not match the expected value.'
    //     },
    //     { 
    //       status: 401,
    //       headers: {
    //         'Content-Type': 'application/json'
    //       }
    //     }
    //   )
    // }
    
    // Parse the request body
    const postmarkInboundEmail: INBOUND_EMAIL__POSTMARK = await request.json()
    // console.log(
    //   `postmarkInboundEmail: `,
    //   JSON.stringify(postmarkInboundEmail, null, 2)
    // )

    // Extract the inbound email data using PostmarkService
    const extractedInboundEmailData = postmarkService.extractInboundEmailData(
      postmarkInboundEmail
    )
    console.log('extractedInboundEmailData: ', extractedInboundEmailData)

    // Process the email data using DataProcessingService
    const processedInboundEmail: ProcessedInboundEmail = 
      await dataProcessingService.processInboundEmailData(
        extractedInboundEmailData
      )
    console.log('processedInboundEmail: ', processedInboundEmail)
  
    const jsonBody = {
      success: true,
      message: 'Email processed successfully',
      data: {
        ...processedInboundEmail,
        // Include text content and image files for display
        summaryFileUrl: processedInboundEmail.summaryFileUrl,
        visualizationUrls: processedInboundEmail.visualizationUrls,
        attachmentUrls: processedInboundEmail.attachmentUrls
      }
    }

    const responseInit: ResponseInit = {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    
    // Return success response
    return NextResponse.json(jsonBody, responseInit)
  } catch (error) {
    console.error('Error processing inbound webhook:', error)
  
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