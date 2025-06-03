// src/app/api/auth/user/route.ts
// Externals
import { cookies } from 'next/headers'
import { decode, verify } from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'
// Locals
import {
  hasJWT,
  JwtType,
  fetchAwsParameter,
  getDecryptedItems,
  AWS_PARAMETER_NAMES,
  getConsoleMetadata,
  COOKIE_NAMES,
} from '@/utils'
import { jsonResponse } from '@/utils/api/utils'
import { CookieType, EncryptedCookieField } from '@/types'


const LOG_TYPE: 'API_CALL' | 'CLIENT' | 'SERVER' = `API_CALL`
const FILE_PATH = `src/app/api/auth/user/route.ts`


export async function GET(req: NextRequest) {
  const FUNCTION_NAME = `GET()`

  const jwtObject: JwtType = await hasJWT(cookies, true)

  const consoleMetadataArgs = {
    logType: LOG_TYPE,
    isLog: false,
    filePath: FILE_PATH,
    functionName: FUNCTION_NAME,
  }

  if (jwtObject?.errorMessage) {
    return jsonResponse(
      { error: jwtObject.errorMessage }, 
      401, 
      consoleMetadataArgs,
      FUNCTION_NAME,
      'Unauthorized: Missing JWT'
    )
  }

  const JWT = jwtObject?.jwt

  if (!JWT) {
    return jsonResponse(
      { error: `Unauthorized: Missing JWT` }, 
      401, 
      consoleMetadataArgs,
      FUNCTION_NAME,
      'Unauthorized: Missing JWT'
    )
  }

  const JWT_SECRET = await fetchAwsParameter(AWS_PARAMETER_NAMES.JWT_SECRET)

  if (typeof JWT_SECRET !== `string`) {
    return JWT_SECRET as NextResponse<{ error: string }>
  }

  try {
    verify(JWT, JWT_SECRET)

    const decoded = decode(JWT) as CookieType
    const encryptedEmail = decoded.email
    const encryptedSignedInAt = decoded.signedInAt

    const SECRET_KEY = await fetchAwsParameter(
      AWS_PARAMETER_NAMES.COOKIE_ENCRYPTION_SECRET_KEY
    )

    if (typeof SECRET_KEY !== `string`) {
      return jsonResponse(
        { error: `Missing encryption key` }, 
        500, 
        consoleMetadataArgs,
        FUNCTION_NAME,
        'Missing encryption key'
      )
    }

    const secretKeyCipher = Buffer.from(SECRET_KEY, `hex`)
    const toDecrypt: { [key: string]: EncryptedCookieField }[] = [
      { email: encryptedEmail },
      { signedInAt: encryptedSignedInAt },
    ]
    const decryptedItems = getDecryptedItems(toDecrypt, secretKeyCipher)
    const user = { ...decryptedItems }

    return jsonResponse(
      { 
        user, 
        message: `User authenticated` 
      },
      200, 
      {
        logType: LOG_TYPE,
        isLog: true,
        filePath: FILE_PATH,
        functionName: FUNCTION_NAME,
      },
      FUNCTION_NAME,
      'User authenticated'
    )
  } catch (error: any) {
    const consoleMetadata = getConsoleMetadata(
      LOG_TYPE, 
      false, 
      FILE_PATH, 
      FUNCTION_NAME
    )
    const errorMessage = `Error verifying JWT`
    console.error(`${ consoleMetadata } ${ errorMessage }: `, error)

    if (error.message === `jwt must be a string`) {
      return jsonResponse(
        { error: `Unauthorized: Invalid JWT` }, 
        401, 
        consoleMetadataArgs,
        FUNCTION_NAME,
        'Unauthorized: Invalid JWT'
      )
    }

    if (error.message === `jwt expired`) {
      const errorMessage = `Unauthorized: Expired JWT`
      const cookieStore = await cookies()
      cookieStore.delete(COOKIE_NAMES.USER_AUTH)
      const consoleMetadata = getConsoleMetadata(
        LOG_TYPE, 
        true, 
        FILE_PATH, 
        FUNCTION_NAME
      )
      console.log(`${ consoleMetadata } ${ errorMessage }. Deleted user auth cookie.`)

      return jsonResponse(
        { error: `Unauthorized: Expired JWT` }, 
        401, 
        consoleMetadataArgs,
        FUNCTION_NAME,
        'Unauthorized: Expired JWT'
      )
    }

    const fullErrorMessage = `${errorMessage}: ${error}`

    return jsonResponse(
      { error: fullErrorMessage }, 
      500, 
      consoleMetadataArgs,
      FUNCTION_NAME,
      fullErrorMessage
    )
  }
}