// Service for handling Postmark webhook data
// Externals
import { Attachment, Client, Message } from 'postmark'
// Locals
import type {
  ATTACHMENT__POSTMARK,
  INBOUND_EMAIL__POSTMARK,
  ProcessedInboundEmail
} from '@/types'
import { getConsoleMetadata } from '@/utils/misc'

// Constants
const CONSOLE_LEVEL = 'SERVER'
const FILE_PATH = 'src/services/postmark/postmarkService.ts'


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

  /**
   * @dev Processes a Postmark inbound email
   * @param json - Postmark inbound email represented as a JSON object
   * @returns Processed inbound email represented as a JSON object
   */
  processInboundEmail(
    json: INBOUND_EMAIL__POSTMARK
  ): ProcessedInboundEmail {
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
    const receivedAt = new Date(json.Date).getTime()
    const fromEmail = json.From
    const originalRecipient = json.OriginalRecipient
    const fromName = json.FromName
    const replyTo = json.ReplyTo
    const to = json.To
    const subject = json.Subject
    const textBody = json.TextBody
    const htmlBody = json.HtmlBody
    const attachments = processedAttachments

    return {
      id,
      projectId,
      fromEmail,
      originalRecipient,
      fromName,
      replyTo,
      to,
      subject,
      textBody,
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
      const consoleMetadata = getConsoleMetadata(
        CONSOLE_LEVEL,
        false,
        FILE_PATH,
        'PostmarkService.sendDashboardEmail()'
      )
      const errorMessage = 'Error sending dashboard email: '
      console.error(`${ consoleMetadata } ${ errorMessage }`, error)
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
      Attachments?: ATTACHMENT__POSTMARK[]
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
        attachment: ATTACHMENT__POSTMARK
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
      const consoleMetadata = getConsoleMetadata(
        CONSOLE_LEVEL,
        false,
        FILE_PATH,
        'PostmarkService.sendEmail()'
      )
      const errorMessage = 'Error sending email: '
      console.error(`${ consoleMetadata } ${ errorMessage }`, error)
      throw new Error(error as string)
    }
  }
}


export const postmarkService = new PostmarkService()
