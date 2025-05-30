// Externals
import { NextRequest, NextResponse } from 'next/server'
// Locals
import { postmarkService } from '@/services/postmarkService'


// ------------------------------ POST Request ---------------------------------
export async function POST(request: NextRequest) {
  if (request.method === 'POST') {
    try {
      const emailData = await request.json()

      // Send email using Postmark API
      const params = {
        From: emailData.From,
        To: emailData.To,
        Subject: emailData.Subject,
        TextBody: emailData.TextBody,
        HtmlBody: emailData.HtmlBody,
        Attachments: emailData.Attachments,
      }

      const response = await postmarkService.sendEmail(params)

      if (response.ErrorCode === 0) {
        const jsonBody = {
          success: true,
          messageId: response.MessageID,
          submittedAt: response.SubmittedAt
        }

        const responseInit: ResponseInit = {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }

        return NextResponse.json(jsonBody, responseInit)
      } else {
        throw new Error(response.Message)
      }
    } catch (error) {
      console.error('Error sending email: ', error)

      const jsonBody = {
        error: 'Failed to send email'
      }

      const responseInit: ResponseInit = {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }

      return NextResponse.json(jsonBody, responseInit)
    }
  } else {
    const jsonBody = {
      error: 'Method Not Allowed'
    }

    const responseInit: ResponseInit = {
      status: 405,
      headers: {
        'Content-Type': 'application/json'
      }
    }

    return NextResponse.json(jsonBody, responseInit)
  }
} 