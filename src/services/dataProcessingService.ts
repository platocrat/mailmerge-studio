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
} from 'firebase/firestore'
import Papa from 'papaparse'
// Locals
import { r2Service } from './r2Service'
import { getFirestoreInstance } from './firebase'
import { openaiService } from './open-ai/openaiService'
import { ProcessedInboundEmail, PostmarkAttachment } from './postmarkService'


// Data processing types
export interface ProcessedData {
  id: string
  projectId: string
  sourceEmailId: string
  dataType: 'csv' | 'json' | 'text' | 'image'
  processedAt: Date
  textContent: string
  imageFiles: string[]
  attachmentUrls: string[]
}

/**
 * @dev Chart data
 */
interface ChartData {
  type: string
  labels: string[] | number[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string
    borderWidth?: number
    fill?: boolean
    tension?: number
  }>
}


/**
 * @dev Data processing service
 * @notice This service is used to process data from an email
 * @example ```ts
 * const processedData = await dataProcessingService.processEmailData(email)
 * ```
 */
class DataProcessingService {
  /**
   * Process data from an email
   * @param email - The email to process
   * @returns The processed data
   */
  async processEmailData(
    email: ProcessedInboundEmail
  ): Promise<ProcessedData> {
    const db = getFirestoreInstance()

    // Store the email in Firestore
    let reference = collection(db, 'emails'),
      data: any = { ...email, receivedAt: new Date() }
    
    await addDoc(reference, data)

    // Update project status to active and increment email count
    const projectsRef = collection(db, 'projects')
    const q = query(projectsRef, where('id', '==', email.projectId))
    const projectSnapshot = await getDocs(q)

    if (!projectSnapshot.empty) {
      const projectDoc = projectSnapshot.docs[0]

      await updateDoc(doc(db, 'projects', projectDoc.id), {
        status: 'active',
        emailCount: (projectDoc.data().emailCount || 0) + 1,
        lastActivity: new Date(),
      })
    }

    // Initialize processed data
    const processedData: ProcessedData = {
      id: this.generateId(),
      projectId: email.projectId,
      sourceEmailId: email.id,
      dataType: 'text',
      processedAt: new Date(),
      textContent: '',
      imageFiles: [],
      attachmentUrls: [],
    }

    try {
      // Process attachments and store in R2
      if (email.attachments.length > 0) {
        const postmarkAttachments: PostmarkAttachment[] = email.attachments.map(
          (attachment) => ({
            Name: attachment.name,
            Content: attachment.content || '',
            ContentType: attachment.type,
            ContentLength: attachment.size
          }
        ))

        processedData.attachmentUrls = await this.processAttachments(
          email.projectId,
          email.id,
          postmarkAttachments
        )
      }

      // Use OpenAI to analyze the data
      const analysisResult = await openaiService.analyzeData(
        email.textContent,
        email.attachments.map((
          attachment
        ): { name: string; type: string; content: string } => ({
          name: attachment.name,
          type: attachment.type,
          content: attachment.content || ''
        })),
      )

      // Update processed data with OpenAI analysis results
      processedData.textContent = analysisResult.textContent
      processedData.imageFiles = analysisResult.imageFiles

      // Store the processed data in Firestore
      reference = collection(db, 'processedData')
      data = { ...processedData, processedAt: new Date() }
      
      await addDoc(reference, data)

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
   * @returns The attachment URLs
   */
  async processAttachments(
    projectId: string,
    emailId: string,
    attachments: PostmarkAttachment[],
  ): Promise<string[]> {
    const attachmentUrls: string[] = []

    for (const attachment of attachments) {
      try {
        // Generate a key for the attachment
        const key = `${projectId}/${emailId}/${attachment.Name}`

        // Store the attachment in R2
        const url = await r2Service.storeFile(
          key,
          attachment.Content,
          attachment.ContentType,
        )

        attachmentUrls.push(url)
      } catch (error) {
        console.error('Error storing attachment:', error)
      }
    }

    return attachmentUrls
  }


  /**
   * Get recent processed data for a project
   * @param projectId - The project ID
   * @param limitCount - The number of records to return
   * @returns The processed data
   */
  async getProjectData(
    projectId: string,
    limitCount = 10,
  ): Promise<ProcessedData[]> {
    const db = getFirestoreInstance()

    const q = query(
      collection(db, 'processedData'),
      where('projectId', '==', projectId),
      orderBy('processedAt', 'desc'),
      limit(limitCount),
    )

    const snapshot = await getDocs(q)

    return snapshot.docs.map(
      (doc) => (
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
