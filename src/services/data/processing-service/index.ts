// Externals
import {
  QueryCommand,
  UpdateCommand,
  QueryCommandInput,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb'
// Locals
import { 
  ddbDocClient,
  DYNAMODB_TABLE_NAMES,
} from '@/utils'
import type { 
  ATTACHMENT__POSTMARK,
  PROCESSED_INBOUND_EMAIL__DYNAMODB,
  ProcessedInboundEmail, 
  AttachmentMetadata,
  STORED_OPENAI_URLS__R2,
  DATA_ANALYSIS_RESULT__OPENAI,
} from '@/types'
import { r2Service } from '@/services/data/cloudflare-r2'
// Add dedicated import for OpenAI service
import { openaiService } from '@/services/open-ai'
// Data processing types
import { dynamoService } from '@/services/data'

/**
 * @dev Data processing service for handling email data
 * @notice This service processes incoming email data from Postmark Inbound 
 *  webhooks, including:
 * - Storing attachments in Cloudflare R2
 * - Analyzing content using OpenAI
 * - Generating visualizations
 * - Storing processed data in DynamoDB
 * @example
 * ```ts
 * const processedData = await dataProcessingService.processEmailData(email)
 * ```
 */
class DataProcessingService {
  /**
   * Process data from an email
   * @param email - The processed inbound email represented as a JSON object
   * @returns The processed data
   */
  async processEmail(
    email: ProcessedInboundEmail
  ): Promise<PROCESSED_INBOUND_EMAIL__DYNAMODB> {
    // Initialize processed data
    const processedData: PROCESSED_INBOUND_EMAIL__DYNAMODB = {
      id: email.projectId,
      sourceEmailId: email.id,
      processedAt: Date.now(),
      fromEmail: email.fromEmail,
      fromName: email.fromName,
      subject: email.subject,
      textContent: email.textBody,
      receivedAt: email.receivedAt,
      summaryFileUrl: '',
      visualizationUrls: [],
      attachmentUrls: [],
      attachments: []
    }

    try {
      // Process attachments and store in R2
      if (email.attachments.length > 0) {
        const attachments = email.attachments.map(att => ({
          Name: att.name,
          Content: att.content || '',
          ContentType: att.type,
          ContentLength: att.size
        }))

        const processedAttachments = await DataProcessingService.R2.processAttachments(
          email.projectId,
          email.id,
          attachments,
        )
        processedData.attachments = processedAttachments
        processedData.attachmentUrls = processedAttachments.map(a => a.url)
      }

      // Use OpenAI to analyze the data
      const analysisResult = await DataProcessingService.OpenAI.analyzeEmail(
        email.textBody,
        processedData.attachments
      )

      // Store OpenAI outputs in R2
      const { 
        summaryFileUrl, 
        visualizationUrls
      } = await DataProcessingService.R2.storeOpenAiOutputs(
        email.projectId,
        email.id,
        analysisResult
      )

      // Update processed data with R2 URLs
      processedData.summaryFileUrl = summaryFileUrl
      processedData.visualizationUrls = visualizationUrls

      // Prepare new processed inbound email entry to be saved in DynamoDB 
      // (id is projectId)
      await DataProcessingService.DynamoDB.saveProcessedData({
        id: email.projectId,
        sourceEmailId: email.id,
        processedAt: processedData.processedAt,
        fromEmail: email.fromEmail,
        fromName: email.fromName,
        subject: email.subject,
        textContent: email.textBody,
        receivedAt: email.receivedAt,
        summaryFileUrl,
        visualizationUrls,
        attachmentUrls: processedData.attachmentUrls,
        attachments: processedData.attachments,
      })

      // Update project status
      await dynamoService.updateProjectStatus(email.projectId, 'Active', 1)

      return processedData
    } catch (error) {
      console.error('Error processing email data:', error)
      throw error
    }
  }

  /**
   * @dev Generate a unique ID
   * @returns The unique ID
   */
  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    )
  }

  // --- Static Subclasses ---
  static R2 = class {
    /**
     * @dev Process attachments
     * @param projectId - The project ID
     * @param emailId - The email ID
     * @param attachments - The attachments
     * @returns The processed attachments
     */
    static async processAttachments(
      projectId: string,
      emailId: string,
      attachments: ATTACHMENT__POSTMARK[],
    ): Promise<AttachmentMetadata[]> {
      const processedAttachments: AttachmentMetadata[] = []
      for (const attachment of attachments) {
        try {
          // Convert base64 to original file
          const fileContent = DataProcessingService.R2.base64ToFile(
            attachment.Content, 
            attachment.ContentType
          )
          // Generate a key for the attachment
          const key = `${projectId}/${emailId}/${attachment.Name}`
          // Store the attachment in R2
          const url = await r2Service.storeFile(
            key,
            fileContent.toString('base64'),
            attachment.ContentType,
          )
          processedAttachments.push({
            name: attachment.Name,
            type: attachment.ContentType,
            size: attachment.ContentLength,
            url
          })
        } catch (error) {
          console.error('Error storing attachment:', error)
        }
      }
      return processedAttachments
    }

    /**
     * @dev Convert base64 to file
     * @param base64 - The base64 string
     * @param contentType - The content type
     * @returns The file
     */
    static base64ToFile(base64: string, contentType: string): Buffer {
      const base64Data = base64.replace(/^data:.*?;base64,/, '')
      return Buffer.from(base64Data, 'base64')
    }

    /**
     * @dev Store OpenAI outputs
     * @param projectId - The project ID
     * @param emailId - The email ID
     * @param analysisResult - The analysis result
     * @returns The summary file URL and visualization URLs
     */
    static async storeOpenAiOutputs(
      projectId: string,
      emailId: string,
      analysisResult: { textContent: string; imageFiles: string[] }
    ): Promise<STORED_OPENAI_URLS__R2> {
      const key = `${projectId}/${emailId}/summary.txt`
      const base64Data = analysisResult.textContent
      const contentType = 'text/plain'
      const summaryFileUrl = await r2Service.storeFile(
        key,
        base64Data,
        contentType,
      )

      // Store visualizations in R2 for each image in the analysis result's 
      // `imageFiles` array
      const visualizationUrls = await Promise.all(
        analysisResult.imageFiles.map(
          async (
            image: string, 
            index: number
          ): Promise<string> => {
            return await r2Service.storeFile(
              `${projectId}/${emailId}/visualization_${index}.png`,
              image,
              'image/png'
            )
          }
        )
      )

      const storedOpenAiUrls = { summaryFileUrl, visualizationUrls }
      return storedOpenAiUrls
    }
  }

  static OpenAI = class {
    /**
     * @dev Analyze email data
     * @param textBody - The text body of the email
     * @param attachments - The attachments of the email
     * @returns The analysis result
     */
    static async analyzeEmail(
      textBody: string,
      attachments: AttachmentMetadata[]
    ): Promise<DATA_ANALYSIS_RESULT__OPENAI> {
      const mappedAttachments = attachments.map((
        attachment: AttachmentMetadata
      ) => ({
        name: attachment.name,
        type: attachment.type,
        content: attachment.url // Pass the URL instead of content since we're storing files in R2
      }))

      const analysisResult = await openaiService.analyzeData(
        textBody, 
        mappedAttachments
      )

      return analysisResult
    }
  }

  static DynamoDB = class {
    /**
     * @dev Save processed data
     * @param item - The processed data
     */
    static async saveProcessedData(
      item: PROCESSED_INBOUND_EMAIL__DYNAMODB
    ): Promise<void> {
      await dynamoService.saveProcessedData(item)
    }
  }
}


export const dataProcessingService = new DataProcessingService()
export default dataProcessingService 