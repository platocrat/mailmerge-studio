// Service for handling Postmark webhook data
import { Client } from 'postmark'
import Papa from 'papaparse'

export interface PostmarkAttachment {
  Name: string
  Content: string // Base64-encoded content
  ContentType: string
  ContentLength: number
}

export interface PostmarkInboundWebhook {
  FromName: string
  From: string
  To: string
  Subject: string
  TextBody: string
  HtmlBody: string
  MailboxHash: string
  Tag: string
  StrippedTextReply: string
  Headers: Array<{ Name: string; Value: string }>
  Attachments: Array<PostmarkAttachment>
  SpamScore: string
}

export interface ProcessedInboundEmail {
  id: string
  projectId: string
  fromEmail: string
  fromName: string
  subject: string
  textContent: string
  htmlContent: string
  attachments: Array<{
    name: string
    type: string
    size: number
    content?: string
    url?: string
  }>
  receivedAt: Date
  commands: string[]
  spamScore: number
}

class PostmarkService {
  private client: Client

  constructor() {
    this.client = new Client(
      process.env.POSTMARK_SERVER_TOKEN || 'POSTMARK_API_TEST',
    )
  }

  // Process an inbound webhook from Postmark
  processInboundWebhook(data: PostmarkInboundWebhook): ProcessedInboundEmail {
    // Extract project ID from the MailboxHash
    // Format: abc123+projectId@inbound.postmarkapp.com
    const projectId = this.extractProjectId(data.MailboxHash || data.To)

    // Extract commands from subject line
    // Format: Subject line #command1 #command2
    const commands = this.extractCommands(data.Subject)

    // Process attachments
    const processedAttachments = data.Attachments.map((attachment) => ({
      name: attachment.Name,
      type: attachment.ContentType,
      size: attachment.ContentLength,
      content: attachment.Content, // Base64 content
    }))

    return {
      id: this.generateId(),
      projectId,
      fromEmail: data.From,
      fromName: data.FromName,
      subject: data.Subject,
      textContent: data.TextBody,
      htmlContent: data.HtmlBody,
      attachments: processedAttachments,
      receivedAt: new Date(),
      commands,
      spamScore: parseFloat(data.SpamScore) || 0,
    }
  }

  // Parse CSV data from attachment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseCSVData(base64Content: string): any[] {
    const decodedContent = atob(base64Content)
    const results = Papa.parse(decodedContent, {
      header: true,
      skipEmptyLines: true,
    })
    return results.data
  }

  // Parse JSON data from attachment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseJSONData(base64Content: string): any {
    const decodedContent = atob(base64Content)
    return JSON.parse(decodedContent)
  }

  // Extract project ID from mailbox hash or To address
  private extractProjectId(addressString: string): string {
    // Try to extract from plus addressing (abc123+projectId@inbound.postmarkapp.com)
    const plusMatch = addressString.match(/\+([^@]+)@/)
    if (plusMatch && plusMatch[1]) {
      return plusMatch[1]
    }

    // Default project ID if none found
    return 'default'
  }

  // Extract commands from subject line
  private extractCommands(subject: string): string[] {
    const commandRegex = /#([a-zA-Z0-9_]+)/g
    const matches = subject.match(commandRegex)

    return matches ? matches.map((match) => match.substring(1)) : []
  }

  // Generate a unique ID
  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    )
  }

  // Send dashboard email
  async sendDashboardEmail(
    to: string,
    subject: string,
    htmlContent: string,
  ): Promise<void> {
    try {
      await this.client.sendEmail({
        From: 'notifications@mailmerge.studio',
        To: to,
        Subject: subject,
        HtmlBody: htmlContent,
        MessageStream: 'outbound',
      })
    } catch (error) {
      console.error('Error sending dashboard email:', error)
      throw error
    }
  }
}

export const postmarkService = new PostmarkService()
