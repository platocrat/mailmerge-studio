// Externals
import { 
  SSMClient,
  GetParameterCommand, 
  GetParameterCommandInput, 
} from '@aws-sdk/client-ssm'
import { NextResponse } from 'next/server'
// Locals
import { 
  REGION,
  CREDENTIALS,
  AWS_PARAMETER_NAMES,
} from '../constants'
import { getConsoleMetadata } from '@/utils'


/**
 * @dev Only used for AWS SSM API calls when the application is running on 
 * an AWS EC2 instance, since the credentials are stored in the EC2 instance and
 * will be automatically loaded by the AWS SDK in the EC2 instance.
 */
// export const ssmClient = new SSMClient({ region: REGION })

/**
 * @dev Used for AWS SSM API calls when the application is running on a 
 * hosted environment, i.e. Vercel. The credentials will be stored in 
 * environment variables hosted on the Vercel project.
 */
export const ssmClient = new SSMClient({ 
  region: REGION,
  credentials: CREDENTIALS,
})

/**
 * @dev Fetches the requested parameter from AWS Parameter Store.
 * @notice Assumes that the parameter is encrypted.
 */
export async function fetchAwsParameter(
  parameterName: string
): Promise<string | NextResponse<{ error: string }>> {
  const logType = 'SERVER'
  const filePath = `src/utils/aws/systems-manager/index.ts`
  const functionName = `fetchAwsParameter()`

  let parameter = 'null'

  const input: GetParameterCommandInput = {
    Name: parameterName,
    WithDecryption: true,
  }

  const command = new GetParameterCommand(input)

  try {
    const response = await ssmClient.send(command)

    if (response.Parameter?.Value) {
      return parameter = response.Parameter?.Value
    } else {
      const errorMessage = `${ parameterName } parameter does not exist!`
      const jsonBody = { error: errorMessage }
      const responseInit = {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      return NextResponse.json(jsonBody, responseInit)
    }
  } catch (error: any) {
    let errorMessage = `Error! Something went wrong fetching ${ parameterName }: ${error}`

    const jsonBody = { error: errorMessage }
    const responseInit = {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const consoleMetadata = getConsoleMetadata(
      logType, 
      false, 
      filePath, 
      functionName
    )

    errorMessage = `Error fetching '${ parameterName }' from the AWS Parameter Store: `

    console.error( 
      `${ consoleMetadata } ${ errorMessage }`,
      error
    )

    return NextResponse.json(jsonBody, responseInit)
  }
}