// src/app/api/project/route.ts
// Externals
import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
// Locals
import { PROJECT__DYNAMODB } from '@/types'
import { dynamoService } from '@/services/data'
import { DYNAMODB_TABLE_NAMES, getConsoleMetadata } from '@/utils'


const FILE_PATH = `src/app/api/project/route.ts`
const LOG_TYPE = 'SERVER'


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
        LOG_TYPE,
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

    // Query the project by ID
    const projects: PROJECT__DYNAMODB[] = await dynamoService.queryItems<PROJECT__DYNAMODB>(
      DYNAMODB_TABLE_NAMES.projects,
      'id-index',
      `id = :id`,
      { ':id': id },
    )
    // We only expect one project because we queried by project ID
    const project = projects[0]

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
      LOG_TYPE,
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
    const { 
      name, 
      description,
      accountEmail,
      postmarkInboundEmail,
    } = await req.json()

    if (!name) {
      const consoleMetadata = getConsoleMetadata(
        LOG_TYPE, 
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
    const projectId = randomBytes(8).toString('hex')

    const project: PROJECT__DYNAMODB = {
      id: projectId,
      accountEmail,
      name,
      description,
      postmarkInboundEmail,
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
      LOG_TYPE, 
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


/**
 * @dev Update a project via a PATCH request to DynamoDB
 * @param req - The request object
 * @returns The response object
 */
export async function PATCH(req: Request) {
  try {
    const { id, name, description } = await req.json()

    if (!id || !name) {
      const consoleMetadata = getConsoleMetadata(
        LOG_TYPE,
        false,
        FILE_PATH,
        'PATCH()'
      )
      const errorMessage = `Project ID and name are required!`
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

    // Update the project in DynamoDB
    const updateExpr = 'SET #name = :name, description = :description'
    const exprAttrVals = {
      ':name': name,
      ':description': description ?? '',
    }
    // DynamoService.updateItem only supports 4 arguments (no 
    // ExpressionAttributeNames) So use 'name' directly in the update expression
    const updateExprFixed = 'SET name = :name, description = :description'

    await dynamoService.updateItem(
      DYNAMODB_TABLE_NAMES.projects,
      { id },
      updateExprFixed,
      exprAttrVals
    )

    // Fetch the updated project
    const updatedProject = await dynamoService.getItem(
      DYNAMODB_TABLE_NAMES.projects,
      { id }
    )

    const jsonBody = { project: updatedProject }
    const responseInit = { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    return NextResponse.json(jsonBody, responseInit)
  } catch (error) {
    const consoleMetadata = getConsoleMetadata(
      LOG_TYPE,
      false,
      FILE_PATH,
      'PATCH()'
    )
    const errorMessage = `Error updating project: `
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
