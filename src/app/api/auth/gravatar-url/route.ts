// Externals
import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
// Locals
import { JSON_HEADER } from '@/utils/api/utils'


export async function GET(
  req: NextRequest
): Promise<NextResponse<{ 
  error: string 
}> | NextResponse<{ gravatarUrl: string }>> {
  const email = req.nextUrl.searchParams.get('email')

  if (!email) {
    const jsonBody = { error: 'Unauthorized: Email query parameter is required!' }
    const responseInit = { status: 401, headers: JSON_HEADER }
    return NextResponse.json(jsonBody, responseInit)
  }

  const lowercasedEmail = email.trim().toLowerCase()
  const hash = crypto.createHash('sha256').update(lowercasedEmail).digest('hex')
  // Use Auth0's default Gravatar image
  const gravatarUrl = `https://s.gravatar.com/avatar/${ 
    hash 
  }?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2F${ 
    email.slice(0, 2) 
  }.png`

  const jsonBody = { gravatarUrl }
  const responseInit = { status: 200, headers: JSON_HEADER }
  return NextResponse.json(jsonBody, responseInit)
}