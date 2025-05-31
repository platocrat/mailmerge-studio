// To be used when creating an instance of AWS SDK
export const REGION = process.env.AWS_REGION || 'us-east-1'

/**
 * @dev Only used for local development.
 */
const _credentials = {
  aws_access_key_id: process.env.AWS_ACCESS_KEY_ID || '',
  aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY || '',
  aws_session_token: process.env.AWS_SESSION_TOKEN || ''
}

/**
 * @dev Only used for local development.
 */
export const CREDENTIALS = {
  accessKeyId: _credentials.aws_access_key_id,
  secretAccessKey: _credentials.aws_secret_access_key,
  sessionToken: _credentials.aws_session_token,
}

/**
 * @dev Used for AWS DynamoDB API calls
 */
export const DYNAMODB_TABLE_NAMES = {
  'some-table-name': 'some-table-name'
}

/**
 * @dev Used for AWS SSM API calls
 */
export const AWS_PARAMETER_NAMES = {
  'some-parameter-name': 'some-parameter-name'
}