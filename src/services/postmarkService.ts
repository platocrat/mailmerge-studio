// Service for handling Postmark webhook data
// Externals
import Papa from 'papaparse'
import { Client, Message, Attachment } from 'postmark'


export interface PostmarkAttachment {
  Name: string
  Content: string // Base64-encoded content
  ContentType: string
  ContentLength: number
  ContentID?: string | null
}

export interface PostmarkInboundWebhookData {
  From: string
  FromName: string
  To: string
  Subject: string
  TextBody: string
  HtmlBody: string
  MailboxHash: string
  Attachments: PostmarkAttachment[]
  SpamScore: string
  MessageID: string
  Date: string
  Headers: { Name: string; Value: string }[]
}

export interface ProcessedInboundEmail {
  id: string
  projectId: string
  fromEmail: string
  fromName: string
  subject: string
  textContent: string
  htmlBody: string
  attachments: Array<{
    name: string
    type: string
    size: number
    content?: string
    url?: string
  }>
  receivedAt: string
  commands: string[]
  spamScore: number
}


// ------------------------- PostmarkService class -----------------------------
/**
 * Service for handling Postmark webhook data and sending emails
 * This service processes inbound emails, extracts relevant information,
 * parses attachments, and sends emails using the Postmark API.
 * It also provides methods to parse CSV and JSON data from attachments.
 * @class PostmarkService
 * @property {Client} client - Postmark API client instance
 * @method processInboundWebhookData - Processes inbound webhook JSON data from Postmark
 * @method parseCSVData - Parses CSV data from a base64-encoded string
 * @method parseJSONData - Parses JSON data from a base64-encoded string
 * @method sendDashboardEmail - Sends an email using the Postmark API
 * @method extractProjectId - Extracts project ID from the mailbox hash or To address
 * @method extractCommands - Extracts commands from the subject line
 * @method generateId - Generates a unique ID for the email
 * @example
 * const postmarkService = new PostmarkService();
 * const processedEmail = postmarkService.processInboundWebhook(webhookData);
 * const csvData = postmarkService.parseCSVData(processedEmail.attachments[0].content);
 * const jsonData = postmarkService.parseJSONData(processedEmail.attachments[0].content);
 * // Send dashboard email
 * postmarkService.sendDashboardEmail(
 *   'notifications@mailmerge.studio',
 *   'New email received',
 *   `
 *   <p>From: ${processedEmail.fromName} &lt;${processedEmail.fromEmail}&gt;</p>
 *   <p>Subject: ${processedEmail.subject}</p>
 *   <p>Commands: ${processedEmail.commands.join(', ')}</p>
 *   <p>CSV Data: ${JSON.stringify(csvData)}</p>
 *   <p>JSON Data: ${jsonData}</p>
 *   `
 * )
 */
class PostmarkService {
  private client: Client

  constructor() {
    this.client = new Client(
      process.env.POSTMARK_SERVER_TOKEN || 'POSTMARK_API_TEST',
    )
  }

  // Process an inbound webhook from Postmark
  processInboundWebhookData(json: PostmarkInboundWebhookData): ProcessedInboundEmail {
    // Format: POSTMARK_INBOUND_HASH@inbound.postmarkapp.com
    const projectId = this.extractProjectId(json.MailboxHash || json.To)

    // Extract commands from subject line
    // Format: Subject line #command1 #command2
    const commands = this.extractCommands(json.Subject)

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
    const spamScore = parseFloat(json.SpamScore) || 0

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
      commands,
      spamScore,
    }
  }

  // Parse CSV data from attachment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseCSVData(base64Content: string): any[] {
    const decodedContent = Buffer.from(base64Content, 'base64').toString(
      'utf-8',
    )

    console.log('decodedContent', decodedContent)

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
    // Default project ID since we're using a single inbound server
    return 'default'
  }

  // Extract commands from subject line
  private extractCommands(subject: string): string[] {
    const commandRegex = /#([a-zA-Z0-9_]+)/g
    const matches = subject.match(commandRegex)

    return matches 
      ? matches.map((match): string => match.substring(1)) 
      : []
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
        MessageStream: 'inbound',
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
        MessageStream: params.MessageStream || 'inbound'
      }

      return await this.client.sendEmail(message)
    } catch (error) {
      console.error('Error sending email: ', error)
      throw new Error(error as string)
    }
  }
}


export const postmarkService = new PostmarkService()
