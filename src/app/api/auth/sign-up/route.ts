// Externals
import {
  PutCommand,
  QueryCommand,
  UpdateCommand,
  PutCommandInput,
  QueryCommandInput,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
// Locals
import { ACCOUNT__DYNAMODB } from '@/types'
import { 
  AWS_PARAMETER_NAMES, 
  ddbDocClient, 
  DYNAMODB_TABLE_NAMES, 
  fetchAwsParameter,
} from '@/lib'
import { 
  getConsoleMetadata, 
  getEncryptedItems, 
  setJwtCookieAndGetCookieValue 
} from '@/utils'

const LOG_TYPE = 'API_CALL'
const FILE_PATH = 'src/app/api/auth/sign-up/route.ts'

/**
 * @dev Sign up
 * @param req - The request object
 * @returns A NextResponse object with the cookie value and the JSON body
 */
export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  const TableName = DYNAMODB_TABLE_NAMES.accounts

  // 1. Check if the email already exists
  let input: QueryCommandInput | PutCommandInput = {
    TableName,
    KeyConditionExpression: 'email = :emailValue',
    ExpressionAttributeValues: { ':emailValue': email },
  },
    command: QueryCommand | PutCommand = new QueryCommand(input)

  try {
    const response = await ddbDocClient.send(command)
    const account = response.Items?.[0] as ACCOUNT__DYNAMODB | undefined

    if (account && account.password) {
      const consoleMetadata = getConsoleMetadata(
        LOG_TYPE,
        false,
        FILE_PATH,
        'GET()'
      )
      const errorMessage = 'Email already exists!'
      console.error(`${ consoleMetadata } ${ errorMessage }`)

      const jsonBody = { error: errorMessage }
      const responseInit = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }

      return NextResponse.json(jsonBody, responseInit)
    }

    // If email exists but no password, update the record
    if (account && !account.password) {
      const Key = { email, createdAt: account.createdAt }
      const now = Date.now()
      const updateInput: UpdateCommandInput = {
        TableName,
        Key,
        UpdateExpression:
          'set password = :password, lastSignIn = :lastSignIn, lastSignOut = :lastSignOut, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':password': password,
          ':lastSignIn': now,
          ':lastSignOut': 0,
          ':updatedAt': now,
        },
      }

      const command = new UpdateCommand(updateInput)

      try {
        await ddbDocClient.send(command)
        // Set cookie and return
        return await respondWithCookie(email, password)
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

  // 2. Create new user
  const now = Date.now()
  const Item: ACCOUNT__DYNAMODB = {
    email,
    password,
    createdAt: now,
    lastSignIn: now,
    lastSignOut: 0,
    updatedAt: now,
    projects: [],
  }
  input = { TableName, Item }
  command = new PutCommand(input)

  try {
    await ddbDocClient.send(command)
    return await respondWithCookie(email, password)
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


/**
 * @dev Respond with cookie
 * @param email - The email of the user
 * @param password - The password of the user
 * @returns A NextResponse object with the cookie value and the JSON body
 */
async function respondWithCookie(email: string, password: any) {
  const JWT_SECRET = await fetchAwsParameter(AWS_PARAMETER_NAMES.JWT_SECRET)

  if (typeof JWT_SECRET !== 'string') {
    const consoleMetadata = getConsoleMetadata(
      LOG_TYPE,
      false,
      FILE_PATH,
      'GET()'
    )
    const errorMessage = 'Fetch for JWT secret failed!'
    console.error(`${ consoleMetadata } ${ errorMessage }`)

    const jsonBody = { error: errorMessage }
    const responseInit = {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }

    return NextResponse.json(jsonBody, responseInit)
  }

  const SECRET_KEY = await fetchAwsParameter(
    AWS_PARAMETER_NAMES.COOKIE_ENCRYPTION_SECRET_KEY
  )

  if (typeof SECRET_KEY !== 'string') {
    const consoleMetadata = getConsoleMetadata(
      LOG_TYPE,
      false,
      FILE_PATH,
      'GET()'
    )
    const errorMessage = 'Fetch for cookie-encryption-secret failed!'
    console.error(`${ consoleMetadata } ${ errorMessage }`)

    const jsonBody = { error: errorMessage }
    const responseInit = {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }

    return NextResponse.json(jsonBody, responseInit)
  }

  const secretKeyCipher = Buffer.from(SECRET_KEY, 'hex')
  const now = Date.now().toString()
  const toEncrypt: { [key: string]: string }[] = [
    { email: email },
    { timestamp: now },
  ]
  const encryptedItems = getEncryptedItems(toEncrypt, secretKeyCipher)
  const cookieValue = await setJwtCookieAndGetCookieValue(
    cookies,
    encryptedItems,
    password.hash,
    JWT_SECRET
  )

  const jsonBody = {
    message: 'User has successfully signed up',
  }
  const responseInit = {
    status: 200,
    headers: { 
      'Set-Cookie': cookieValue, 
      'Content-Type': 'application/json' 
    },
  }

  return NextResponse.json(jsonBody, responseInit)
}