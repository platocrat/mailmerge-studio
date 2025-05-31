export interface PROCESSED_DATA__DYNAMODB {
  id: string               // Project ID (used as DynamoDB Partition Key)
  sourceEmailId: string    // Original email ID
  processedAtTimestamp: number // Timestamp
  summaryFileUrl: string   // R2 URL for summary text
  visualizationUrls: string[]
  attachmentUrls: string[]
  attachments: {
    name: string
    type: string
    url: string
  }[]
}


export interface PostmarkAttachment {
  Name: string
  Content: string // Base64-encoded content
  ContentType: string
  ContentLength: number
  ContentID?: string | null
}

export interface PostmarkInboundWebhookJson {
  FromName: string
  MessageStream: string
  From: string
  FromFull: {
    Email: string
    Name: string
    MailboxHash: string
  }
  To: string
  ToFull: {
    Email: string
    Name: string
    MailboxHash: string
  }[]
  Cc: string
  CcFull: {
    Email: string
    Name: string
    MailboxHash: string
  }[] | string
  Bcc: string
  BccFull: {
    Email: string
    Name: string
    MailboxHash: string
  }[] | string
  OriginalRecipient: string
  Subject: string
  MessageID: string
  ReplyTo: string
  MailboxHash: string
  Date: string
  TextBody: string
  HtmlBody: string
  StrippedTextReply: string
  Tag: string
  Headers: { Name: string; Value: string }[]
  Attachments: {
    Name: string
    Content: string
    ContentType: string
    ContentLength: number
    ContentID: string
  }[] | []
}

export interface ProcessedInboundJson {
  id: string
  projectId: string
  fromEmail: string
  fromName: string
  subject: string
  textContent: string
  htmlBody: string
  attachments: {
    name: string
    type: string
    size: number
    content: string
    contentId: string
  }[]
  receivedAt: string
}

export interface PROJECT__DYNAMODB {
  id: string                    // DynamoDB Partition Key
  name: string                  // Human-readable project name
  description?: string          // Optional description
  emailAddress: string          // Unique inbound email address for the project
  createdAtTimestamp: number             // Unix epoch (ms) when created – serves as Sort Key if needed
  status: 'active' | 'inactive' // Current state
  emailCount: number            // Total inbound emails processed
  lastActivity?: number         // Timestamp of last processed email
} 