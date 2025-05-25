// Cloudflare R2 service implementation

export interface R2Config {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
}

class R2Service {
  private config: R2Config
  private apiUrl: string

  constructor(config: R2Config) {
    this.config = config
    this.apiUrl = `https://${config.accountId}.r2.cloudflarestorage.com`
  }

  // Generate pre-signed URL for direct uploads (for frontend use)
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 3600,
  ): Promise<string> {
    // In a real implementation, this would call a backend service that generates
    // a pre-signed URL using Cloudflare's S3-compatible API
    // For demo purposes, we'll simulate this by returning a placeholder URL

    return `/api/r2/upload/${encodeURIComponent(key)}?contentType=${encodeURIComponent(contentType)}`
  }

  // Store a file from a base64 string (typically called from backend)
  async storeFile(
    key: string,
    base64Data: string,
    contentType: string,
  ): Promise<string> {
    // In a real implementation, this would directly upload to R2
    // For demo purposes, we'll simulate this by returning the file URL

    console.log(`Simulating upload to R2: ${key} (${contentType})`)
    return `${this.apiUrl}/${this.config.bucket}/${key}`
  }

  // Get a public URL for a stored file
  getPublicUrl(key: string): string {
    return `${this.apiUrl}/${this.config.bucket}/${key}`
  }
}

// Create a singleton instance with default config
// In a real app, these would come from environment variables
const defaultConfig: R2Config = {
  accountId: process.env.R2_ACCOUNT_ID || 'demo-account',
  accessKeyId: process.env.R2_ACCESS_KEY_ID || 'demo-access-key',
  secretAccessKey:
    process.env.R2_SECRET_ACCESS_KEY || 'demo-secret-key',
  bucket: process.env.R2_BUCKET || 'mailmerge-studio-attachments',
}

export const r2Service = new R2Service(defaultConfig)

export default r2Service
