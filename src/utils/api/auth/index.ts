// src/utils/api/auth/index.ts
// Externals
import { sign } from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import {
  UpdateCommand,
  QueryCommand,
  QueryCommandInput,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb'
// Locals
import {
  ddbDocClient,
  fetchAwsParameter,
  AWS_PARAMETER_NAMES,
  DYNAMODB_TABLE_NAMES,
  ServerCrypto,
  MAX_AGE,
  getConsoleMetadata,
  COOKIE_NAMES,
} from '@/utils'
import { 
  ACCOUNT__DYNAMODB, 
  EncryptedCookieField, 
  HashedPassword 
} from '@/types'


const LOG_TYPE = 'SERVER'
const FILE_PATH = 'src/utils/api/auth/index.ts'


// ---------------------------------- Types ------------------------------------
type EncryptedItem = { 
  iv: string
  encryptedData: string 
}

export type EncryptedItems = { 
  [key: string]: {
    iv: string
    encryptedData: string
  }
}

type JwtOrErrorMessage = string | null

export type JwtType = { 
  jwt: JwtOrErrorMessage
  errorMessage: JwtOrErrorMessage
} | null



// ------------------------------- Functions -----------------------------------
export async function hasJWT(
  cookies,
  getJWT?: boolean
): Promise<JwtType> {
  const FUNCTION_NAME = 'hasJWT()'
  /**
   * @dev 1. Check if a cookie exists for the user
   */
  const cookieStore = await cookies()
  
  // // Delete the cookie for testing purposes
  // await cookieStore.delete(COOKIE_NAMES.USER_AUTH)
  // const consoleMetadata = getConsoleMetadata(
  //   LOG_TYPE,
  //   true,
  //   FILE_PATH,
  //   FUNCTION_NAME,
  // )
  // console.log(`${consoleMetadata} Cookie deleted: `, COOKIE_NAMES.USER_AUTH)

  const token = cookieStore.get(COOKIE_NAMES.USER_AUTH)

  if (!token) {
    const errorMessage = 
      'Unauthorized: No valid JSON web token was found in the request'
    return { jwt: null, errorMessage }
  } else {
    if (getJWT) {
      const JWT = token.value
      return { jwt: JWT, errorMessage: null }
    } else {
      return null
    }
  }
}



export function getEncryptedItems(
  toEncrypt: { [key: string]: string }[],
  secretKeyCipher: Buffer
): EncryptedItems {
  let encryptedItems: EncryptedItems = {}

  toEncrypt.forEach((item: { [key: string]: string }, i: number): void => {
    const key = Object.keys(item)[0]
    const value = Object.values(item)[0]

    const encryptedItem = new ServerCrypto().encrypt(
      value,
      secretKeyCipher
    )

    encryptedItems[key] = encryptedItem
  })

  return encryptedItems
}



export function getDecryptedItems(
  toDecrypt: { [key: string]: EncryptedCookieField }[],
  secretKeyCipher: Buffer
): { [key: string]: string } {
  let decryptedItems: { [key: string]: string } = {}

  toDecrypt.forEach((
    item: { [key: string]: EncryptedCookieField }, 
    i: number
  ): void => {
    const key = Object.keys(item)[0]
    const value = Object.values(item)[0]

    const decryptedItem = new ServerCrypto().decrypt(
      value.encryptedData,
      secretKeyCipher,
      value.iv,
    )

    decryptedItems[key] = decryptedItem
  })

  return decryptedItems
}



/**
 * @param cookies Imported from `next/header`
 */
export async function setJwtCookieAndGetCookieValue(
  cookies,
  encryptedItems: EncryptedItems,
  passwordHash: string,
  JWT_SECRET: string,
) {
  /**
   * @dev 1. Sign the JWT 
   * @notice Make sure the password that is stored in the cookie is hashed!
   */
  const token = sign(
    {
      ...encryptedItems,
      password: passwordHash,
    },
    JWT_SECRET as string,
    { expiresIn: MAX_AGE.SESSION }
  )

  // 2. Delete previous cookie
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAMES.USER_AUTH)

  // 3. Store the cookie
  cookieStore.set(COOKIE_NAMES.USER_AUTH, token, {
    /**
     * @dev A cookie with the `HttpOnly` attribute can't be modified by 
     * JavaScript, for example using `Document.cookie`; it can only be
     * modified when it reaches the server. Cookies that persist user 
     * sessions for example should have the `HttpOnly` attribute set — 
     * it would be really insecure to make them available to JavaScript. 
     * This precaution helps mitigate cross-site scripting (`XSS`) 
     * attacks.
     * 
     * See Mozilla docs for more info: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#block_access_to_your_cookies
     */
    httpOnly: true,
    /**
     * @todo Change to `true` to ensure cookie is only sent to 
     * the server with an encrypted request over the HTTPS 
     * protocol (except on localhost), which means MITM attackers
     * can't access it easily. Insecure sites (with `http`: in 
     * the URL) can't set cookies with the `Secure` attribute. 
     * However, don't assume that `Secure` prevents all access to
     * sensitive information in cookies. For example, someone with
     * access to the client's hard disk (or JavaScript if the 
     * `HttpOnly` attribute isn't set) can read and modify the
     * information.
     * 
     * See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#block_access_to_your_cookies
     */
    secure: true,
    sameSite: 'strict',
    path: '/',
  })

  // 4. Get the cookie value from the cookie name
  const cookieValue: string = cookieStore.get(
    COOKIE_NAMES.USER_AUTH
  )?.value ?? 'null'

  return cookieValue
}



/**
 * @param cookies Imported from `next/header`
 */
export async function verifiedEmailAndPassword(
  switchCondition: string,
  cookies,
  email: string,
  storedPassword: HashedPassword,
): Promise<NextResponse<{ error: string }> | NextResponse<{ message: string }>> {
  // Helper to return a 200 message
  const ok = (message: string) => {
    const jsonBody = { message }
    const responseInit = {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    return NextResponse.json(jsonBody, responseInit)
  }
  // Helper to return a 500 error
  const error500 = (error: string) => {
    const consoleMetadata = getConsoleMetadata(
      LOG_TYPE,
      false,
      FILE_PATH,
      'verifyEmailAndPassword()'
    )
    const errorMessage = `Error verifying email and password: `
    console.error(`${ consoleMetadata } ${ errorMessage }`, error)

    const jsonBody = { error }
    const responseInit = {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }

    return NextResponse.json(jsonBody, responseInit)
  }

  // Handle all non-success cases first
  if (switchCondition === 'true-false') return ok('Incorrect password')
  if (switchCondition === 'false-true') return ok('Incorrect email')
  if (switchCondition !== 'true-true') return ok('Incorrect email and password')

  // Only continue if both are verified
  // 1. Fetch secrets
  const JWT_SECRET = await fetchAwsParameter(AWS_PARAMETER_NAMES.JWT_SECRET)
  if (typeof JWT_SECRET !== 'string') return error500('JWT secret fetch failed')
  const SECRET_KEY = await fetchAwsParameter(AWS_PARAMETER_NAMES.COOKIE_ENCRYPTION_SECRET_KEY)
  if (typeof SECRET_KEY !== 'string') return error500('Cookie encryption secret fetch failed')

  // 2. Encrypt session fields
  const secretKeyCipher = Buffer.from(SECRET_KEY, 'hex')
  const signedInAt = Date.now().toString()
  const toEncrypt: { [key: string]: string }[] = [
    { email },
    { signedInAt },
  ]
  const encryptedItems = getEncryptedItems(toEncrypt, secretKeyCipher)
  const cookieValue = await setJwtCookieAndGetCookieValue(
    cookies, 
    encryptedItems, 
    storedPassword.hash, 
    JWT_SECRET
  )

  // 3. Update `lastSignIn` in DynamoDB
  const TableName = DYNAMODB_TABLE_NAMES.accounts
  const Key = { email }
  const input: UpdateCommandInput = {
    TableName,
    Key,
    UpdateExpression: 'set lastSignIn = :lastSignIn',
    ExpressionAttributeValues: { ':lastSignIn': Date.now() },
  }
  const command = new UpdateCommand(input)

  try {
    const response = await ddbDocClient.send(command)
    return ok('Verified email and password')
  } catch (error) {
    const errorMessage = `Failed to Update 'lastSignIn' for '${ 
      email 
    }' on the '${ TableName }' table: ${error}`

    return error500(errorMessage)
  }
}