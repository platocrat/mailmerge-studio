// `src/app/api/postmark/webhook/inbound/route.ts`
// Externals
import { NextRequest, NextResponse } from 'next/server'
// Locals
import type { 
  PostmarkInboundWebhookJson, 
  PROCESSED_DATA__DYNAMODB
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
    const webhookJson: PostmarkInboundWebhookJson = await request.json()
    console.log(`webhookJson:`, JSON.stringify(webhookJson, null, 2))

    // Process the inbound email using PostmarkService
    const processedEmail = postmarkService.processInboundWebhookData(
      webhookJson
    )
    console.log('processedEmail: ', processedEmail)

    // Process the email data using DataProcessingService
    const processedData: PROCESSED_DATA__DYNAMODB = 
      await dataProcessingService.processEmailData(processedEmail)
    console.log('processedData: ', processedData)
  
    const jsonBody = {
      success: true,
      message: 'Email processed successfully',
      data: {
        ...processedData,
        // Include text content and image files for display
        summaryFileUrl: processedData.summaryFileUrl,
        visualizationUrls: processedData.visualizationUrls,
        attachmentUrls: processedData.attachmentUrls
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