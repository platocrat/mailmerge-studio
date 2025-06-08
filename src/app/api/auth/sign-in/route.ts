// src/app/api/auth/sign-in/route.ts
// Externals
import { cookies } from 'next/headers'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { NextRequest, NextResponse } from 'next/server'
// Locals
import { ACCOUNT__DYNAMODB } from '@/types'
import { getConsoleMetadata, verifiedEmailAndPassword } from '@/utils'
import { ddbDocClient, DYNAMODB_TABLE_NAMES, ServerCrypto } from '@/lib'


const LOG_TYPE = 'SERVER'
const FILE_PATH = 'src/app/api/auth/sign-in/route.ts'


export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  
  if (!email || !password) {
    const consoleMetadata = getConsoleMetadata(
      LOG_TYPE,
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
    const account: ACCOUNT__DYNAMODB = response.Items?.[0] as ACCOUNT__DYNAMODB

    if (!account || !account.password) {
      const consoleMetadata = getConsoleMetadata(
        LOG_TYPE,
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

    const storedEmail = account.email
    const storedPassword = account.password

    const verifiedEmail = storedEmail === email
    const verifiedPassword = new ServerCrypto().verifyPassword(
      password, 
      account.password.hash,
      account.password.salt
    )

    const switchCondition = `${verifiedEmail}-${verifiedPassword}`

    return await verifiedEmailAndPassword(
      switchCondition,
      cookies,
      email,
      storedPassword,
    )
  } catch (error) {
    const consoleMetadata = getConsoleMetadata(
      LOG_TYPE,
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