// Externals
import OpenAI from 'openai'
// Locals
import { MODEL } from '@/utils'

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY']
})

/**
 * @dev Data analysis result
 */
interface DataAnalysisResult {
  textContent: string
  imageFiles: string[]
}

/**
 * @dev OpenAI service
 * @note This service is used to analyze data with OpenAI.
 */
class OpenAIService {
  private readonly ANALYSIS_PROMPT = `
    Please process all attached files and, using the Python data analysis feature, generate at least 4 visualizations for any structured or semi-structured data they contain. The attachments may include CSV, JSON, or image files with embedded data. For each file:

    * Analyze the data and generate a summary of the data.

    * Detect and parse any structured data. If the file is an image, extract data using OCR and interpret it similarly.

    * Identify all relevant data columns and analyze the relationships between them. Visualize metrics across dimensions where appropriate (e.g., Sales over Time, Products Sold by Region, Customer Retention vs. Acquisition, etc.).

    * Generate at least 4 meaningful charts such as bar charts, line graphs, scatter plots, pie charts, time-series plots for date-based fields, and categorical comparisons for labeled data, based on the nature of the data. Make sure that you use at least 4 identifiers per chart to include as much data from multiple sources or columns as possible.

    * Where applicable:
      * Plot quantitative metrics over time or by categorical groupings.
      * Compare multiple metrics (e.g., Sales vs. Products Sold, New vs. Repeat Customers, etc.).
      * Highlight trends, outliers, and distributions that offer insight into the dataset's behavior.

    * Each chart should have a clear title, labeled axes, and a legend if needed.

    * Summarize the most important findings below each chart, noting patterns, significant changes, or insights discovered through the analysis.

    Do not assume any specific schema—analyze each file independently and infer the most relevant comparisons and visual representations based on the data it contains.
  `

  /**
   * @dev Analyze the data and generate visualizations with insights
   * @param textContent - The text content to analyze
   * @param attachments - The attachments to analyze
   * @returns The analysis result
   */
  async analyzeData(
    textContent: string,
    attachments: { name: string; type: string; content: string }[]
  ): Promise<DataAnalysisResult> {
    try {
      // 1. Upload files to OpenAI
      const uploadedFiles: string[] = await Promise.all(
        // Generate a list of uploaded file IDs for the attachments
        attachments.map(
          async (attachment: { name: string; type: string; content: string }) => {
            const fileBuffer = Buffer.from(attachment.content, "base64")
            const fileBlob = new Blob([fileBuffer], {
              type: attachment.type
            })
            const file = new File([fileBlob], attachment.name)
            const purpose: OpenAI.Files.FilePurpose = 'assistants'
            // Upload the file to OpenAI
            const uploadedFile = await client.files.create({ file, purpose })
            // Return the uploaded file ID
            return uploadedFile.id
          }
        )
      )

      const name = 'Data Analysis Assistant'
      const instructions = `You are a data analysis expert. Analyze the provided data and generate visualizations with insights.`

      // 2. Create an assistant
      const assistant = await client.beta.assistants.create({
        name,
        model: MODEL,
        instructions,
        tools: [
          { type: "code_interpreter" }
        ],
      } as OpenAI.Beta.Assistants.AssistantCreateParams)

      // 3. Create a thread
      const thread = await client.beta.threads.create()

      // 4. Add the analysis prompt and file attachments to the thread
      await client.beta.threads.messages.create(
        thread.id, 
        {
          role: "user",
          // content: [
          //   { type: 'input_text', text: this.ANALYSIS_PROMPT }
          // ]
          content: this.ANALYSIS_PROMPT,
          // Attach the files at the Thread level, making them only accessible 
          // within the specific thread.
          attachments: uploadedFiles.map((fileId: string) => ({
            tools: [
              { type: "code_interpreter" }
            ],
            file_id: fileId
          }))
        }
      )

      // 5. Run the assistant
      const run = await client.beta.threads.runs.createAndPoll(
        thread.id, 
        { 
          assistant_id: assistant.id,
        },
        { pollIntervalMs: 2_000 }
      )

      // 6. Poll for completion
      let runStatus = run.status

      while (
        runStatus !== 'completed' && 
        runStatus !== 'failed' && 
        runStatus !== 'cancelled'
      ) {
        const runResult = await client.beta.threads.runs.retrieve(
          run.id,
          { thread_id: thread.id }, 
        )

        runStatus = runResult.status
        console.log(`Run status: ${runStatus}`)
      }

      if (runStatus !== 'completed') {
        throw new Error(`Run failed with status: ${runStatus}`)
      }

      // 7. Get the messages from the thread
      const messages = await client.beta.threads.messages.list(thread.id)
      const assistantMessages = messages.data.filter(
        (msg: OpenAI.Beta.Threads.Message): boolean => msg.role === 'assistant'
      )

      // 8. Process the messages
      const result: DataAnalysisResult = {
        textContent: '',
        imageFiles: []
      }

      // Process the messages
      for (const message of assistantMessages) {
        for (const content of message.content) {
          // Process the text content
          if (content.type === 'text') {
            result.textContent += content.text.value + '\n'
          // Process the image file
          } else if (content.type === 'image_file') {
            // Download the image file
            const imageContent = await client.files.retrieve(
              content.image_file.file_id
            )
            // Convert the image content to a buffer
            const imageContentBuffer = Buffer.from(imageContent.toString())
            // Add the image content to the result
            result.imageFiles.push(imageContentBuffer.toString('base64'))
          }
        }
      }

      // 9. Clean up
      await client.beta.assistants.delete(assistant.id)
      await client.beta.threads.delete(thread.id)

      // Clean up the uploaded files
      for (const fileId of uploadedFiles) {
        await client.files.delete(fileId)
      }

      return result
    } catch (error) {
      console.error('Error analyzing data with OpenAI:', error)
      throw error
    }
  }
}

/**
 * @dev Export the OpenAIService class as a singleton
 */
export const openaiService = new OpenAIService()
export default openaiService