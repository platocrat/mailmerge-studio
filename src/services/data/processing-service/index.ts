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
  PostmarkAttachment, 
  ProcessedInboundJson,
} from '@/types'
import { r2Service } from '@/services/data/cloudflare-r2'
// Add dedicated import for OpenAI service
import { openaiService } from '@/services/open-ai'
// Data processing types
import type { PROCESSED_DATA__DYNAMODB } from '@/types'
import { dynamoService } from '@/services/data'

interface AttachmentMetadata {
  name: string
  type: string
  url: string
}

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
  async processEmailData(
    email: ProcessedInboundJson
  ): Promise<PROCESSED_DATA__DYNAMODB> {
    // Initialize processed data
    const processedData: PROCESSED_DATA__DYNAMODB = {
      id: email.projectId,
      sourceEmailId: email.id,
      processedAtTimestamp: Date.now(),
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

        const processedAttachments = await this.processAttachments(
          email.projectId,
          email.id,
          attachments,
        )
        
        processedData.attachments = processedAttachments
        processedData.attachmentUrls = processedAttachments.map(a => a.url)
      }

      // Use OpenAI to analyze the data
      const attachments = processedData.attachments.map(att => ({
        name: att.name,
        type: att.type,
        content: att.url // Pass the URL instead of content since we're storing files in R2
      }))

      const analysisResult = await openaiService.analyzeData(
        email.textContent,
        attachments,
      )

      // Store OpenAI outputs in R2
      const key = `${email.projectId}/${email.id}/summary.txt`
      const base64Data = analysisResult.textContent
      const contentType = 'text/plain'

      const summaryFileUrl = await r2Service.storeFile(
        key,
        base64Data,
        contentType,
      )

      const visualizationUrls = await Promise.all(
        analysisResult.imageFiles.map(async (image, index) => {
          return await r2Service.storeFile(
            `${email.projectId}/${email.id}/visualization_${index}.png`,
            image,
            'image/png'
          )
        })
      )

      // Update processed data with R2 URLs
      processedData.summaryFileUrl = summaryFileUrl
      processedData.visualizationUrls = visualizationUrls

      // Prepare DynamoDB item (id is projectId)
      const dynamoItem: PROCESSED_DATA__DYNAMODB = {
        id: email.projectId,
        sourceEmailId: email.id,
        processedAtTimestamp: processedData.processedAtTimestamp,
        summaryFileUrl,
        visualizationUrls,
        attachmentUrls: processedData.attachmentUrls,
        attachments: processedData.attachments,
      }

      // Persist via DynamoService helper
      await dynamoService.saveProcessedData(dynamoItem)

      // Update project status
      await this.updateProjectStatus(email.projectId)

      return processedData
    } catch (error) {
      console.error('Error processing email data:', error)
      throw error
    }
  }

  /**
   * @dev Process attachments and store in R2
   * @param projectId - The project ID
   * @param emailId - The email ID
   * @param attachments - The attachments to process
   * @returns The processed attachments with R2 URLs
   */
  private async processAttachments(
    projectId: string,
    emailId: string,
    attachments: PostmarkAttachment[],
  ): Promise<AttachmentMetadata[]> {
    const processedAttachments: AttachmentMetadata[] = []

    for (const attachment of attachments) {
      try {
        // Convert base64 to original file
        const fileContent = this.base64ToFile(attachment.Content, attachment.ContentType)
        
        // Generate a key for the attachment
        const key = `${projectId}/${emailId}/${attachment.Name}`

        // Store the attachment in R2
        const url = await r2Service.storeFile(
          key,
          fileContent.toString('base64'), // Convert Buffer to base64 string
          attachment.ContentType,
        )

        processedAttachments.push({
          name: attachment.Name,
          type: attachment.ContentType,
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
   * @param base64 - The base64 encoded content
   * @param contentType - The content type of the file
   * @returns The file content
   */
  private base64ToFile(base64: string, contentType: string): Buffer {
    const base64Data = base64.replace(/^data:.*?;base64,/, '')
    return Buffer.from(base64Data, 'base64')
  }

  /**
   * @dev Update project status in DynamoDB
   * @param projectId - The project ID
   */
  private async updateProjectStatus(projectId: string): Promise<void> {
    const TableName = DYNAMODB_TABLE_NAMES.projects
    const Key = { id: projectId }
    const UpdateExpression = 'set status = :status, emailCount = emailCount + :inc, lastActivity = :lastActivity'
    const ExpressionAttributeValues = {
      ':status': 'active',
      ':inc': 1,
      ':lastActivity': Date.now()
    }

    const input: UpdateCommandInput = {
      TableName,
      Key,
      UpdateExpression,
      ExpressionAttributeValues,
    }
    const command = new UpdateCommand(input)

    await ddbDocClient.send(command)
  }

  /**
   * @dev Get recent processed data for a project
   * @param projectId - The project ID
   * @param limitCount - The number of records to return
   * @returns The processed data
   */
  async getProjectData(
    projectId: string,
    limitCount = 10,
  ): Promise<PROCESSED_DATA__DYNAMODB[]> {
    const TableName = DYNAMODB_TABLE_NAMES.processedData
    const KeyConditionExpression = 'id = :projectId'
    const ExpressionAttributeValues = {
      ':projectId': projectId
    }
    const ScanIndexForward = false // Sort in descending order
    const Limit = limitCount

    const input: QueryCommandInput = {
      TableName,
      KeyConditionExpression,
      ExpressionAttributeValues,
      ScanIndexForward,
      Limit,
    }
    const command = new QueryCommand(input)
    const response = await ddbDocClient.send(command)

    return (response.Items || []) as PROCESSED_DATA__DYNAMODB[]
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
}


export const dataProcessingService = new DataProcessingService()
export default dataProcessingService 