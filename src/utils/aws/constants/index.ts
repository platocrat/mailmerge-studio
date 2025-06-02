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
  projects: 'projects',
}

/**
 * @dev Used for AWS SSM API calls
 */
export const AWS_PARAMETER_NAMES = {
  // ----------------------------- OpenAI ------------------------------------
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  // --------------------------- Cloudflare R2 -------------------------------
  R2_ACCOUNT_ID: 'R2_ACCOUNT_ID',
  R2_ACCESS_KEY_ID: 'R2_ACCESS_KEY_ID',
  R2_SECRET_ACCESS_KEY: 'R2_SECRET_ACCESS_KEY',
  R2_BUCKET: 'R2_BUCKET',
  // ----------------------------- Postmark ----------------------------------
  POSTMARK_SERVER_TOKEN: 'POSTMARK_SERVER_TOKEN',
  POSTMARK_FROM_EMAIL: 'POSTMARK_FROM_EMAIL',
  POSTMARK_INBOUND_HASH: 'POSTMARK_INBOUND_HASH',
}