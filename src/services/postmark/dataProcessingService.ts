// Externals
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  doc,
  Firestore,
} from 'firebase/firestore'
// Locals
import { 
  r2Service, 
  initializeFirebase, 
  openaiService,
  PostmarkAttachment,
  ProcessedInboundJson,
} from '@/services'

// Data processing types
export interface ProcessedData {
  id: string
  projectId: string
  sourceEmailId: string
  processedAt: Date
  // R2 URLs for OpenAI outputs
  summaryFileUrl: string
  visualizationUrls: string[]
  // R2 URLs for original attachments
  attachmentUrls: string[]
  // Metadata about attachments
  attachments: {
    name: string
    type: string
    url: string
  }[]
}

interface AttachmentMetadata {
  name: string
  type: string
  url: string
}

/**
 * @dev Data processing service
 * @notice This service is used to the process JSON email data from an email sent via a Postmark Inbound Webhook and store it in a DynamoDB table
 * @example ```ts
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
  ): Promise<ProcessedData> {
    const { firestore } = initializeFirebase()

    // Initialize processed data
    const processedData: ProcessedData = {
      id: this.generateId(),
      projectId: email.projectId,
      sourceEmailId: email.id,
      processedAt: new Date(),
      summaryFileUrl: '',
      visualizationUrls: [],
      attachmentUrls: [],
      attachments: []
    }

    try {
      // Process attachments and store in R2
      if (email.attachments.length > 0) {
        const processedAttachments = await this.processAttachments(
          email.projectId,
          email.id,
          email.attachments.map(att => ({
            Name: att.name,
            Content: att.content || '',
            ContentType: att.type,
            ContentLength: att.size
          }))
        )
        
        processedData.attachments = processedAttachments
        processedData.attachmentUrls = processedAttachments.map(a => a.url)
      }

      // Use OpenAI to analyze the data
      const analysisResult = await openaiService.analyzeData(
        email.textContent,
        processedData.attachments.map(att => ({
          name: att.name,
          type: att.type,
          content: att.url // Pass the URL instead of content since we're storing files in R2
        }))
      )

      // Store OpenAI outputs in R2
      const summaryFileUrl = await r2Service.storeFile(
        `${email.projectId}/${email.id}/summary.txt`,
        analysisResult.textContent,
        'text/plain'
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

      // Store the processed data in Firestore
      const reference = collection(firestore, 'processedData')
      await addDoc(reference, processedData)

      // Update project status
      await this.updateProjectStatus(firestore, email.projectId)

      return processedData
    } catch (error) {
      console.error('Error processing email data:', error)
      throw error
    }
  }

  /**
   * Process attachments and store in R2
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
   * Convert base64 to file
   * @param base64 - The base64 encoded content
   * @param contentType - The content type of the file
   * @returns The file content
   */
  private base64ToFile(base64: string, contentType: string): Buffer {
    const base64Data = base64.replace(/^data:.*?;base64,/, '')
    return Buffer.from(base64Data, 'base64')
  }

  /**
   * Update project status in Firestore
   * @param db {Firestore} - Firestore instance
   * @param projectId {string} - The project ID
   */
  private async updateProjectStatus(
    db: Firestore,
    projectId: string,
  ): Promise<void> {
    const projectsRef = collection(db, 'projects')
    const q = query(projectsRef, where('id', '==', projectId))
    const projectSnapshot = await getDocs(q)

    if (!projectSnapshot.empty) {
      const projectDoc = projectSnapshot.docs[0]

      await updateDoc(
        doc(db, 'projects', projectDoc.id), 
        {
          status: 'active',
          emailCount: (projectDoc.data().emailCount || 0) + 1,
          lastActivity: new Date(),
        }
      )
    }
  }

  /**
   * Get recent processed data for a project
   * @param projectId {string} - The project ID
   * @param limitCount {number} - The number of records to return
   * @returns The processed data
   */
  async getProjectData(
    projectId: string,
    limitCount = 10,
  ): Promise<ProcessedData[]> {
    const { firestore } = initializeFirebase()

    const q = query(
      collection(firestore, 'processedData'),
      where('projectId', '==', projectId),
      orderBy('processedAt', 'desc'),
      limit(limitCount),
    )

    const snapshot = await getDocs(q)

    return snapshot.docs.map(
      (doc): ProcessedData => (
        { 
          id: doc.id, 
          ...doc.data() 
        }
      ) as ProcessedData,
    )
  }

  /**
   * Generate a unique ID
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
