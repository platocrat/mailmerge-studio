// Externals
import { NextRequest, NextResponse } from 'next/server'
import { QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb'
// Locals
import { getConsoleMetadata } from '@/utils'
import { ACCOUNT__DYNAMODB } from '@/types'
import { DYNAMODB_TABLE_NAMES, ddbDocClient } from '@/lib'


const LOG_TYPE = `API_CALL`
const FILE_PATH = 'src/app/api/auth/email/route.ts'


export async function GET(
  req: NextRequest
): Promise<NextResponse<{ message: string }> | NextResponse<{ error: any }>> {
  const email = req.nextUrl.searchParams.get('email')

  if (!email) {
    const consoleMetadata = getConsoleMetadata(
      LOG_TYPE,
      false,
      FILE_PATH,
      'GET()'
    )
    console.error(`${ consoleMetadata } Missing email parameter`)

    const jsonBody = { error: 'Missing email parameter' }
    const responseInit = {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    } 

    return NextResponse.json(jsonBody, responseInit)
  }

  const TableName = DYNAMODB_TABLE_NAMES.accounts
  const KeyConditionExpression = 'email = :emailValue'
  const ExpressionAttributeValues = { ':emailValue': email }

  const input: QueryCommandInput = {
    TableName,
    KeyConditionExpression,
    ExpressionAttributeValues,
  }

  const command = new QueryCommand(input)

  try {
    const response = await ddbDocClient.send(command)
    const account = response.Items?.[0] as ACCOUNT__DYNAMODB

    if (account) {
      const jsonBody = { message: 'Email with password exists' }
      const responseInit = {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      return NextResponse.json(jsonBody, responseInit)
    } else {
      const jsonBody = { message: 'Email with password does not exist' }
      const responseInit = {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
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
    console.error(
      `${ consoleMetadata } Error sending GET request to '${ 
        TableName 
      }' DynamoDB table: `, 
      error
    )

    const isExpiredTokenException = error.name === 'ExpiredTokenException'
    const isCredentialsProviderError = error.name === `CredentialsProviderError`

    if (isExpiredTokenException) {
      const jsonBody = { 
        error: 'ExpiredTokenException: AWS access keys have expired.' 
      }
      const responseInit = {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      return NextResponse.json(jsonBody, responseInit)
    } else if (isCredentialsProviderError) {
      const consoleMetadata = getConsoleMetadata(
        LOG_TYPE,
        false,
        FILE_PATH,
        'GET()'
      )
      console.error(
        `${ consoleMetadata } Error sending GET request to '${ 
          TableName 
        }' DynamoDB table: `, 
        error
      )

      const jsonBody = { 
        error: `CredentialsProviderError: Could not load credentials from any providers.` 
      }
      const responseInit = {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      return NextResponse.json(jsonBody, responseInit)
    } else {
      const consoleMetadata = getConsoleMetadata(
        LOG_TYPE,
        false,
        FILE_PATH,
        'GET()'
      )
      console.error(
        `${ consoleMetadata } Error sending GET request to '${ 
          TableName 
        }' DynamoDB table: `, 
        error
      )

      const jsonBody = { error: error }
      const responseInit = {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      return NextResponse.json(jsonBody, responseInit)
    }
  }
} 