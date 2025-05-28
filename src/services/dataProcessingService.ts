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
// Locals
import { r2Service } from './r2Service'
import { getFirestoreInstance } from './firebase'
import { ProcessedInboundEmail, PostmarkAttachment } from './postmarkService'

// Data processing types
export interface ProcessedData {
  id: string
  projectId: string
  sourceEmailId: string
  dataType: 'csv' | 'json' | 'text' | 'image'
  processedAt: Date
  summary: Record<string, any>
  chartData?: Record<string, any>
  attachmentUrls: string[]
}

class DataProcessingService {
  // Process data from an email
  async processEmailData(email: ProcessedInboundEmail): Promise<ProcessedData> {
    const db = getFirestoreInstance()

    // Store the email in Firestore
    const emailDoc = await addDoc(collection(db, 'emails'), {
      ...email,
      receivedAt: new Date(),
    })

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
      summary: {},
      attachmentUrls: [],
    }

    // Process based on content and attachments
    if (email.attachments.length > 0) {
      const attachment = email.attachments[0]

      if (attachment.type.includes('csv')) {
        processedData.dataType = 'csv'
        processedData.chartData = this.processCSVData(attachment)
      } else if (attachment.type.includes('json')) {
        processedData.dataType = 'json'
        processedData.chartData = this.processJSONData(attachment)
      } else if (attachment.type.includes('image')) {
        processedData.dataType = 'image'
        processedData.chartData = this.processImageData(attachment)
      }
    } else {
      // Process email text content
      processedData.summary = {
        wordCount: email.textContent.split(/\s+/).length,
        characters: email.textContent.length,
      }
      processedData.chartData = this.processTextData(email.textContent)
    }

    // Store the processed data in Firestore
    await addDoc(collection(db, 'processedData'), {
      ...processedData,
      processedAt: new Date(),
    })

    return processedData
  }

  private processCSVData(attachment: any) {
    // Simulate CSV processing
    return {
      type: 'bar',
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Sales',
          data: [12000, 19000, 15000, 25000],
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
      ],
    }
  }

  private processJSONData(attachment: any) {
    // Simulate JSON processing
    return {
      type: 'line',
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [
        {
          label: 'User Growth',
          data: [100, 150, 200, 250, 300],
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    }
  }

  private processImageData(attachment: any) {
    // Simulate image analysis
    return {
      type: 'doughnut',
      labels: ['Red', 'Blue', 'Green'],
      datasets: [
        {
          data: [300, 200, 100],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(75, 192, 192, 0.5)',
          ],
        },
      ],
    }
  }

  private processTextData(text: string) {
    // Simulate text analysis
    return {
      type: 'bar',
      labels: ['Sentiment', 'Complexity', 'Length'],
      datasets: [
        {
          label: 'Text Analysis',
          data: [0.8, 0.6, 0.4],
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    }
  }

  // Process attachments and store in R2
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

  // Get recent processed data for a project
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
      (doc) => ({ id: doc.id, ...doc.data() }) as ProcessedData,
    )
  }

  // Generate a unique ID
  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    )
  }
}

export const dataProcessingService = new DataProcessingService()
export default dataProcessingService
