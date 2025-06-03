// Externals
import { 
  UpdateCommand, 
  QueryCommand, 
  QueryCommandInput,
  UpdateCommandInput, 
} from '@aws-sdk/lib-dynamodb'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
// Locals
import { 
  COOKIE_NAMES, 
  ddbDocClient, 
  DYNAMODB_TABLE_NAMES,
  getConsoleMetadata,
} from '@/utils'
import { ACCOUNT__DYNAMODB } from '@/types'

const LOG_TYPE = 'API_CALL'
const FILE_PATH = 'src/app/api/auth/sign-out/route.ts'

/**
 * @dev Sign out
 * @param req - The request object
 * @returns A NextResponse object with the JSON body
 */
export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email) {
    const consoleMetadata = getConsoleMetadata(
      LOG_TYPE,
      false,
      FILE_PATH,
      'GET()'
    )
    const errorMessage = 'Unauthorized: Email was not sent with the request.'
    console.error(`${ consoleMetadata } ${ errorMessage }`)

    const jsonBody = { error: errorMessage }
    const responseInit = {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }

    return NextResponse.json(jsonBody, responseInit)
  }

  const TableName = DYNAMODB_TABLE_NAMES.accounts
  
  let input: QueryCommandInput | UpdateCommandInput = {
    TableName,
    KeyConditionExpression: 'email = :emailValue',
    ExpressionAttributeValues: { ':emailValue': email },
  },
    command: QueryCommand | UpdateCommand = new QueryCommand(input)

  /**
   * @dev Attempt to perform `Query` operation on DynamoDB table
   */
  try {
    const response = await ddbDocClient.send(command)
    const account = response.Items?.[0] as ACCOUNT__DYNAMODB | undefined

    if (!account) {
      const consoleMetadata = getConsoleMetadata(
        LOG_TYPE,
        false,
        FILE_PATH,
        'GET()'
      )
      const errorMessage = `Account not found for email: ${email}`
      console.error(`${ consoleMetadata } ${ errorMessage }`)

      const jsonBody = { error: errorMessage }
      const responseInit = {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }

      return NextResponse.json(jsonBody, responseInit)
    }

    input = {
      TableName,
      Key: { email },
      UpdateExpression: 'set lastSignOutTimestamp = :lastSignOutTimestamp',
      ExpressionAttributeValues: { ':lastSignOutTimestamp': Date.now() },
    }
    command = new UpdateCommand(input)

    /**
     * @dev Attempt to perform `Update` operation on DynamoDB table
     */
    try {
      await ddbDocClient.send(command)
    } catch (error: any) {
      const consoleMetadata = getConsoleMetadata(
        LOG_TYPE,
        false,
        FILE_PATH,
        'GET()'
      )
      const errorMessage = 'Something went wrong with the response!'
      console.error(`${ consoleMetadata } ${ errorMessage }`, error)

      const jsonBody = { error: errorMessage }
      const responseInit = {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }

      return NextResponse.json(jsonBody, responseInit)
    }

    /**
     * @dev Delete cookies from the signed in user.
     */
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAMES.USER_AUTH)

    const jsonBody = { message: 'User logged out' }
    const responseInit = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }

    return NextResponse.json(jsonBody, responseInit)
  } catch (error: any) {
    const consoleMetadata = getConsoleMetadata(
      LOG_TYPE,
      false,
      FILE_PATH,
      'GET()'
    )
    const errorMessage = 'Something went wrong with the response!'
    console.error(`${ consoleMetadata } ${ errorMessage }`, error)

    const jsonBody = { error: errorMessage }
    const responseInit = {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }

    return NextResponse.json(jsonBody, responseInit)
  }
}