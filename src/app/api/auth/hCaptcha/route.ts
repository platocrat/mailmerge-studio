// Externals
import { NextRequest, NextResponse } from 'next/server'
// Locals
import { getConsoleMetadata } from '@/utils'
import { AWS_PARAMETER_NAMES, fetchAwsParameter } from '@/lib'

const LOG_TYPE = 'API_CALL'
const FILE_PATH = 'src/app/api/auth/hCaptcha/route.ts'

/**
 * @dev hCaptcha verification
 */
export async function POST(req: NextRequest) {
  const { email, token } = await req.json()

  if (!email) {
    const consoleMetadata = getConsoleMetadata(
      LOG_TYPE,
      false,
      FILE_PATH,
      'GET()'
    )
    const errorMessage = 'Unauthorized: Email query parameter is required!'
    console.error(`${ consoleMetadata } ${ errorMessage }`)

    const jsonBody = { error: errorMessage }
    const responseInit = {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }

    return NextResponse.json(jsonBody, responseInit)
  }

  const VERIFY_URL = 'https://api.hcaptcha.com/siteverify'
  const parameterName = AWS_PARAMETER_NAMES.H_CAPTCHA_SECRET_KEY
  const secretKey = await fetchAwsParameter(parameterName)

  try {
    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `response=${token}&secret=${secretKey}`,
    })

    const json = await response.json()

    if (json.success === true) {
      const jsonBody = { success: true }
      const responseInit = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }

      return NextResponse.json(jsonBody, responseInit)
    } else {
      const consoleMetadata = getConsoleMetadata(
        LOG_TYPE,
        false,
        FILE_PATH,
        'GET()'
      )
      const errorMessage = `Something went wrong with the response: ${json['error-codes']}`
      console.error(`${ consoleMetadata } ${ errorMessage }`)
      
      const jsonBody = { error: errorMessage }
      const responseInit = {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }

      return NextResponse.json(jsonBody, responseInit)
    }
  } catch (error: any) {
    const consoleMetadata = getConsoleMetadata(
      LOG_TYPE,
      false,
      FILE_PATH,
      'GET()'
    )
    const errorMessage = 'Something went wrong with the response!'
    console.error(`${ consoleMetadata } ${ errorMessage }`)
    
    const jsonBody = { error: errorMessage }
    const responseInit = {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }

    return NextResponse.json(jsonBody, responseInit)
  }
}