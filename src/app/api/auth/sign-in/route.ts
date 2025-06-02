// src/app/api/auth/sign-in/route.ts
// Externals
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
// Locals
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { 
  ddbDocClient, 
  DYNAMODB_TABLE_NAMES, 
  getConsoleMetadata, 
  ServerCrypto 
} from '@/utils'


const CONSOLE_LEVEL = 'SERVER'
const FILE_PATH = 'src/app/api/auth/sign-in/route.ts'


export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  
  if (!email || !password) {
    const consoleMetadata = getConsoleMetadata(
      CONSOLE_LEVEL,
      false,
      FILE_PATH,
      'POST()'
    )
    const errorMessage = `Missing email or password`
    console.error(`${ consoleMetadata } ${ errorMessage }`)

    const jsonBody = { error: errorMessage }
    const responseInit = { 
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    return NextResponse.json(jsonBody, responseInit)
  }

  const input = {
    TableName: DYNAMODB_TABLE_NAMES.accounts,
    KeyConditionExpression: 'email = :emailValue',
    ExpressionAttributeValues: { ':emailValue': email },
  }
  const command = new QueryCommand(input)

  try {
    const response = await ddbDocClient.send(command)
    const user = response.Items?.[0]

    if (!user || !user.password) {
      const consoleMetadata = getConsoleMetadata(
        CONSOLE_LEVEL,
        false,
        FILE_PATH,
        'POST()'
      )
      const errorMessage = `Invalid credentials`
      console.error(`${ consoleMetadata } ${ errorMessage }`)

      const jsonBody = { error: errorMessage }
      const responseInit = { 
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      }
      return NextResponse.json(jsonBody, responseInit)
    }

    const verified = new ServerCrypto().verifyPassword(
      password, 
      user.password.hash, 
      user.password.salt
    )

    if (!verified) {
      const consoleMetadata = getConsoleMetadata(
        CONSOLE_LEVEL,
        false,
        FILE_PATH,
        'POST()'
      )
      const errorMessage = `Invalid credentials`
      console.error(`${ consoleMetadata } ${ errorMessage }`)

      const jsonBody = { error: errorMessage }
      const responseInit = { 
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      }
      return NextResponse.json(jsonBody, responseInit)
    } else {
      const jsonBody = { message: 'Signed in' }
      const responseInit = { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
  
      return NextResponse.json(jsonBody, responseInit)
      // TODO: Generate JWT or encrypted session, set cookie
      // Example: cookies().set('session', token, { httpOnly: true, ... })
    }
  } catch (error) {
    const consoleMetadata = getConsoleMetadata(
      CONSOLE_LEVEL,
      false,
      FILE_PATH,
      'POST()'
    )
    const errorMessage = `Error signing in: `
    console.error(`${ consoleMetadata } ${ errorMessage }`, error)

    const jsonBody = { error: errorMessage }
    const responseInit = { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    return NextResponse.json(jsonBody, responseInit)
  }
} 