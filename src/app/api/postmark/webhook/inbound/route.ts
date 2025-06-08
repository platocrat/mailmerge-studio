// src/app/api/postmark/webhook/inbound/route.ts
// Externals
import { NextRequest, NextResponse } from 'next/server'
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'
// Locals
import type { 
  INBOUND_EMAIL__POSTMARK,
  ExtractedInboundEmailData,
} from '@/types'
import { postmarkService } from '@/services'
import { getConsoleMetadata } from '@/utils'


const LOG_TYPE = 'API_CALL'
const FILE_NAME: string = 'src/app/api/postmark/webhook/inbound/route.ts'

// free tier works in any region
const sqs = new SQSClient({ region: process.env.AWS_REGION })
// e.g. https://sqs.us-east-1.amazonaws.com/123/...
const QUEUE_URL = process.env.AWS_SQS_QUEUE_URL

// ------------------------------ POST Request ---------------------------------
export async function POST(request: NextRequest) {
  try {    
    // Parse the request body
    const inboundEmail: INBOUND_EMAIL__POSTMARK = await request.json()

    // Extract the inbound email data using PostmarkService
    const extractedInboundEmailData: ExtractedInboundEmailData = 
      postmarkService.extractInboundEmailData(inboundEmail)

    // enqueue – one API call, a few ms
    const input = {
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(extractedInboundEmailData)
    }
    const command = new SendMessageCommand(input)

    try {
      const response = await sqs.send(command)

      if (response.MessageId) {
        const message = `Email data extracted successfully and enqueued to SQS`
        const consoleMetadata: string = getConsoleMetadata(
          LOG_TYPE, 
          true, 
          FILE_NAME, 
          'POST()'
        )
        console.log(`${ consoleMetadata } ${ message }`)

        const jsonBody = {
          message: 'Email data extracted successfully'
        }
        const responseInit: ResponseInit = {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }

        // Return the extracted data
        return NextResponse.json(jsonBody, responseInit)
      } else {
        const errorMessage = `Error in webhook handler: `
        const consoleMetadata: string = getConsoleMetadata(
          LOG_TYPE, 
          false, 
          FILE_NAME, 
          'POST()'
        )
        console.error(`${ consoleMetadata } ${ errorMessage }`)
      }
    } catch (error) {
      const errorMessage = `Error in webhook handler: `
      const consoleMetadata: string = getConsoleMetadata(
        LOG_TYPE, 
        false, 
        FILE_NAME, 
        'POST()'
      )
      console.error(`${ consoleMetadata } ${ errorMessage }`)
      
      const jsonBody = {
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      }

      const responseInit: ResponseInit = {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }

      return NextResponse.json(jsonBody, responseInit)
    }
  } catch (error) {
    const consoleMetadata: string = getConsoleMetadata(
      LOG_TYPE, 
      false,
      FILE_NAME, 
      'POST()'
    )
    console.error(`${ consoleMetadata } Error in webhook handler: `, error)
  
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
  
    return NextResponse.json(jsonBody, responseInit)
  }
} 