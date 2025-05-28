// Externals
import { NextRequest, NextResponse } from 'next/server'
// Locals
import { postmarkService } from '@/services/postmarkService'
import { dataProcessingService } from '@/services/dataProcessingService'


// Verify Postmark webhook signature
function verifyPostmarkWebhook(request: NextRequest): boolean {
  const signature = request.headers.get('X-Postmark-Server-Token')
  return signature === process.env.POSTMARK_SERVER_TOKEN
}

// ------------------------------ POST Request ---------------------------------
export async function POST(request: NextRequest) {
  if (request.method === 'POST') {
    try {
      // Verify the webhook signature
      if (!verifyPostmarkWebhook(request)) {
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        )
      }
    
      // Parse the request body
      const webhookData = await request.json()
      console.log('webhookData: ', webhookData)

      // Process the inbound email using PostmarkService
      const processedEmail = postmarkService.processInboundWebhook(webhookData)
      console.log('processedEmail: ', processedEmail)

      // Process the email data using DataProcessingService
      const processedData = await dataProcessingService.processEmailData(
        processedEmail
      )
      console.log('processedData: ', processedData)
    
      const jsonBody = {
        success: true,
        message: 'Email processed successfully',
        data: processedData
      }
      // 
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
        error: 'Internal server error'
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
  } else {
    return NextResponse.json(
      { error: 'Method Not Allowed' },
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json'
        }
      },
    )
  }
} 