// Service for handling Postmark webhook data
// Externals
import { Client, Message, Attachment } from 'postmark'


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


// ------------------------- PostmarkService class -----------------------------
/**
 * Service for handling Postmark webhook data and sending emails
 * This service processes inbound emails, extracts relevant information,
 * parses attachments, and sends emails using the Postmark API.
 * @class PostmarkService
 * @property {Client} client - Postmark API client instance
 * @method processInboundWebhookData - Processes inbound webhook JSON data from Postmark
 * @method sendDashboardEmail - Sends an email using the Postmark API
 * @method extractProjectId - Extracts project ID from the mailbox hash or To address 
 */
class PostmarkService {
  private client: Client

  constructor() {
    this.client = new Client(
      process.env.POSTMARK_SERVER_TOKEN || 'POSTMARK_API_TEST',
    )
  }

  // Process an inbound webhook from Postmark
  processInboundWebhookData(
    json: PostmarkInboundWebhookJson
  ): ProcessedInboundJson {
    // Format: POSTMARK_INBOUND_HASH@inbound.postmarkapp.com
    const projectId = this.extractProjectId(json.MessageID)

    // Process attachments
    const processedAttachments = json.Attachments.map((attachment) => ({
      name: attachment.Name,
      type: attachment.ContentType,
      size: attachment.ContentLength,
      content: attachment.Content, // Base64 content,
      contentId: attachment.ContentID
    }))

    const id = json.MessageID
    // Date is a UTC string. Example: 2025-05-28T20:05:55.478Z
    const receivedAt = new Date(json.Date).toISOString()
    const fromEmail = json.From
    const fromName = json.FromName
    const subject = json.Subject
    const textContent = json.TextBody
    const htmlBody = json.HtmlBody
    const attachments = processedAttachments

    return {
      id,
      projectId,
      fromEmail,
      fromName,
      subject,
      textContent,
      htmlBody,
      attachments,
      receivedAt,
    }
  }

  // Extract project ID from message ID
  private extractProjectId(messageId: string): string {
    // Default project ID since we're using a single inbound server
    return 'default' + messageId
  }

  // Send dashboard email
  async sendDashboardEmail(
    to: string,
    subject: string,
    htmlBody: string,
  ): Promise<void> {
    const fromEmail = process.env.POSTMARK_FROM_EMAIL || 'support@mailmerge.studio'

    try {
      const email: Message = {
        From: fromEmail,
        To: to,
        Subject: subject,
        HtmlBody: htmlBody,
        MessageStream: 'outbound',
      }

      await this.client.sendEmail(email)
    } catch (error) {
      const errorMessage = 'Error sending dashboard email: '
      console.error(errorMessage, error)
      throw new Error(error as string)
    }
  }

  // Send email with attachments
  async sendEmail(
    params: {
      From: string
      To: string
      Subject: string
      TextBody?: string
      HtmlBody?: string
      Attachments?: PostmarkAttachment[]
      MessageStream?: string
    }
  ): Promise<{ 
    ErrorCode: number
    Message: string
    MessageID: string
    SubmittedAt: string
  }> {
    try {
      const attachments = params.Attachments?.map((
        attachment: PostmarkAttachment
      ): Attachment => ({
        Name: attachment.Name,
        Content: attachment.Content,
        ContentType: attachment.ContentType,
        ContentLength: attachment.ContentLength,
        ContentID: attachment.ContentID || null
      }))

      const message: Message = {
        From: params.From,
        To: params.To,
        Subject: params.Subject,
        TextBody: params.TextBody,
        HtmlBody: params.HtmlBody,
        Attachments: attachments,
        MessageStream: 'outbound'
      }

      return await this.client.sendEmail(message)
    } catch (error) {
      console.error('Error sending email: ', error)
      throw new Error(error as string)
    }
  }
}


export const postmarkService = new PostmarkService()
