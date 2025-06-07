// src/lib/aws/dynamodb/index.ts
// Externals
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
// Locals
import { 
  REGION,
  CREDENTIALS,
} from '../constants'


/**
 * @dev Only used for AWS DynamoDB API calls when the application is running on 
 * an AWS EC2 instance, since the credentials are stored in the EC2 instance and
 * will be automatically loaded by the AWS SDK in the EC2 instance.
 */
// const ddbClient = new DynamoDBClient({ region: REGION })

/**
 * @dev Used for AWS DynamoDB API calls when the application is running on a 
 * hosted environment, i.e. Vercel. The credentials will be stored in 
 * environment variables hosted on the Vercel project.
 */
const ddbClient = new DynamoDBClient({ 
  region: REGION,
  credentials: CREDENTIALS
})

export const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)