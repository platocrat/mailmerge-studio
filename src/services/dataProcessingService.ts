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
      summary: {},
      attachmentUrls: [],
    }

    // Process based on content and attachments
    if (email.attachments.length > 0) {
      // Process the first valid attachment
      for (const attachment of email.attachments) {
        if (!attachment.content) continue

        const content = Buffer.from(attachment.content, 'base64').toString()

        // Define the result type of the attachment
        let result: { 
          dataType: ProcessedData['dataType'], 
          summary: Record<string, any>, 
          chartData?: ChartData 
        }

        // Process based on attachment type and store the result
        if (attachment.type.includes('csv')) {
          const { summary, chartData } = await this.processCSVData(content)
          result = { dataType: 'csv', summary, chartData }
        } else if (attachment.type.includes('json')) {
          const { summary, chartData } = await this.processJSONData(content)
          result = { dataType: 'json', summary, chartData }
        } else if (attachment.type.includes('image')) {
          const { 
            summary, 
            chartData 
          } = await this.processImageData(attachment.content)

          result = { dataType: 'image', summary, chartData }
        } else {
          continue
        }

        // Update processed data with results from the attachment
        processedData.dataType = result.dataType
        processedData.summary = result.summary

        if (result.chartData) {
          processedData.chartData = result.chartData
        }

        // Stop after processing the first valid attachment
        break
      }
    } else {
      // Process email text content
      const { 
        summary, 
        chartData 
      } = await this.processTextData(email.textContent)

      processedData.summary = summary

      if (chartData) processedData.chartData = chartData
    }

    // Store the processed data in Firestore
    reference = collection(db, 'processedData')
    data = { ...processedData, processedAt: new Date() }
    
    // Store the processed data in Firestore
    await addDoc(reference, data)

    return processedData
  }


  /**
   * Process CSV data
   * @param content - The CSV content to process
   * @returns The summary and chart data
   */
  private async processCSVData(
    content: string
  ): Promise<{ 
    summary: Record<string, any>, 
    chartData?: ChartData
  }> {
    return new Promise((resolve) => {
      Papa.parse(content, {
        header: true,
        complete: (results) => {
          const data = results.data as Record<string, any>[]
          const headers = results.meta.fields || []
          
          // Generate summary statistics
          const summary: Record<string, any> = {
            rowCount: data.length,
            columnCount: headers.length,
            columns: headers,
          }

          // Calculate numeric column statistics
          headers.forEach(header => {
            const values = data.map(row => parseFloat(row[header]))
            if (!values.some(isNaN)) {
              summary[`${header}_stats`] = {
                min: Math.min(...values),
                max: Math.max(...values),
                avg: values.reduce((a, b) => a + b, 0) / values.length,
              }
            }
          })

          // Generate chart data for the first numeric column
          const numericColumn = headers.find(header => 
            !data.some(row => isNaN(parseFloat(row[header])))
          )

          if (numericColumn) {
            const chartData: ChartData = {
              type: 'bar',
              labels: data.map(row => row[headers[0]]), // Use first column as labels
              datasets: [{
                label: numericColumn,
                data: data.map(row => parseFloat(row[numericColumn])),
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
              }],
            }
            resolve({ summary, chartData })
          } else {
            resolve({ summary })
          }
        },
      })
    })
  }


  /**
   * Process JSON data
   * @param content - The JSON content to process
   * @returns The summary and chart data
   */
  private async processJSONData(
    content: string
  ): Promise<{ 
    summary: Record<string, any>, 
    chartData?: ChartData 
  }> {
    const data = JSON.parse(content)

    const summary: Record<string, any> = {
      type: Array.isArray(data) ? 'array' : 'object',
      size: Array.isArray(data) ? data.length : Object.keys(data).length,
    }

    // If it's an array of objects, analyze the first object's structure
    if (
      Array.isArray(data) && 
      data.length > 0 && 
      typeof data[0] === 'object'
    ) {
      summary.structure = Object.keys(data[0])
    }

    // Generate chart data if it's an array of objects with numeric values
    let chartData: ChartData | undefined

    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      const firstObject = data[0]

      const numericKeys = Object.keys(firstObject).filter(key => 
        typeof firstObject[key] === 'number'
      )

      if (numericKeys.length > 0) {
        const key = numericKeys[0]
        chartData = {
          type: 'line',
          labels: data.map((_, i) => i + 1),
          datasets: [{
            label: key,
            data: data.map(item => item[key]),
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          }],
        }
      }
    }

    return { summary, chartData }
  }


  /**
   * Process image data
   * @param base64Content - The base64 encoded content of the image
   * @returns The summary and chart data
   */
  private async processImageData(
    base64Content: string
  ): Promise<{ 
    summary: Record<string, any>, 
    chartData?: ChartData 
  }> {
    // For demo purposes, we'll generate a simple color histogram
    // In a real implementation, you would use an image processing library
    const summary: Record<string, any> = {
      type: 'image',
      size: base64Content.length,
    }

    const chartData: ChartData = {
      type: 'doughnut',
      labels: ['Red', 'Green', 'Blue'],
      datasets: [{
        label: 'Color Distribution',
        data: [
          Math.floor(Math.random() * 100),
          Math.floor(Math.random() * 100),
          Math.floor(Math.random() * 100),
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(54, 162, 235, 0.5)',
        ],
      }],
    }

    return { summary, chartData }
  }


  /**
   * Process text data
   * @param text - The text to process
   * @returns The summary and chart data
   */
  private async processTextData(
    text: string
  ): Promise<{ 
    summary: Record<string, any>, 
    chartData?: ChartData 
  }> {
    // Simple text analysis without natural language processing
    const words = text.split(/\s+/)
    
    const avgWordLength = words.reduce(
      (sum, word): number => sum + word.length, 0
    ) / words.length
    
    const summary: Record<string, any> = {
      wordCount: words.length,
      characterCount: text.length,
      complexity: avgWordLength,
    }

    const chartData: ChartData = {
      type: 'bar',
      labels: ['Complexity', 'Length'],
      datasets: [{
        label: 'Text Analysis',
        data: [
          avgWordLength / 10, // Normalize complexity
          words.length / 1000, // Normalize length
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }],
    }

    return { summary, chartData }
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
