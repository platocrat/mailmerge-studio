// src/app/api/project/route.ts
// Externals
import { NextRequest, NextResponse } from 'next/server'
// Locals
import { dynamoService } from '@/services/data'
import { DYNAMODB_TABLE_NAMES, getConsoleMetadata } from '@/utils'
import { PROJECT__DYNAMODB } from '@/types'


const FILE_PATH = `src/app/api/project/route.ts`
const CONSOLE_LEVEL = 'SERVER'


/**
 * @dev Get a project via a GET request to DynamoDB
 * @param req - The request object
 * @returns The response object
 */
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('projectId')

    if (!id) {
      const consoleMetadata = getConsoleMetadata(
        CONSOLE_LEVEL,
        false,
        FILE_PATH,
        'GET()'
      )
      const errorMessage = `Project ID is required!`
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

    const project: PROJECT__DYNAMODB | undefined = await dynamoService.getItem(
      DYNAMODB_TABLE_NAMES.projects,
      { id }
    )

    if (!project) {
      const jsonBody = { error: 'Project not found' }
      const responseInit = { 
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      return NextResponse.json(jsonBody, responseInit)
    }

    const jsonBody = { project }
    const responseInit = { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    return NextResponse.json(jsonBody, responseInit)
  } catch (error) {
    const consoleMetadata = getConsoleMetadata(
      CONSOLE_LEVEL,
      false, // true = is a console.log(), false = is a console.error()
      FILE_PATH,
      'GET()'
    )
    const errorMessage = `Error fetching project: `
    console.error(`${ consoleMetadata } ${ errorMessage }`, error)
    
    const jsonBody = { error: 'Internal Server Error' }
    const responseInit = { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    return NextResponse.json(jsonBody, responseInit)
  }
}


/**
 * @dev Create a new project via a PUT request to DynamoDB
 * @param req - The request object
 * @returns The response object
 */
export async function PUT(req: Request) {
  try {
    const { name, description } = await req.json()

    if (!name) {
      const consoleMetadata = getConsoleMetadata(
        CONSOLE_LEVEL, 
        false, 
        FILE_PATH,
        'PUT()'
      )

      console.error(`${ consoleMetadata } Project name is required!`)

      const jsonBody = { error: 'Project name is required' }
      const responseInit = { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      return NextResponse.json(jsonBody, responseInit)
    }

    // Generate unique project id
    const projectId = Math.random().toString(36).substring(2, 15)

    // Use inbound hash from environment (must be set in .env or SSM)
    const inboundHash = process.env.POSTMARK_INBOUND_HASH || ''

    const postmarkInboundEmailAddress = `${inboundHash}@inbound.postmarkapp.com`

    const project: PROJECT__DYNAMODB = {
      id: projectId,
      name,
      description,
      postmarkInboundEmailAddress,
      createdAt: Date.now(),
      status: 'Inactive',
      emailCount: 0,
    }

    // Add item to `projects` table in DynamoDB
    await dynamoService.putItem(DYNAMODB_TABLE_NAMES.projects, project)

    const jsonBody = { project }
    const responseInit = { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    return NextResponse.json(jsonBody, responseInit)
  } catch (error) {
    const consoleMetadata = getConsoleMetadata(
      CONSOLE_LEVEL, 
      false, 
      FILE_PATH, 
      'POST()'
    )

    console.error(`${ consoleMetadata } Error creating project:`, error)

    const jsonBody = { error: 'Internal Server Error' }
    const responseInit = { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    return NextResponse.json(jsonBody, responseInit)
  }
}