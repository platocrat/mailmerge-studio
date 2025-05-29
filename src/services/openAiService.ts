import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface DataAnalysisResult {
  summary: Record<string, any>
  chartData: Array<{
    type: string
    title: string
    description: string
    data: {
      labels: string[]
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
  }>
}

class OpenAIService {
  private readonly ANALYSIS_PROMPT = `
    Please process all attached files and, using the Python for data analysis feature, generate at least 4 visualizations for any structured or semi-structured data they contain. The attachments may include CSV, JSON, or image files with embedded data. For each file:

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

  async analyzeData(
    attachments: { name: string; type: string; content: string }[],
    textContent: string
  ): Promise<DataAnalysisResult> {
    try {
      // Prepare the system content
      const systemContent = `You are a data analysis expert. Analyze the provided data and generate visualizations with insights.`

      // Prepare the user content
      const userTextContent = `\n\nData to analyze:\n`
      const userAttachmentsString = JSON.stringify(attachments, null, 2)
      const userContent = `${ this.ANALYSIS_PROMPT }${ userTextContent }${ userAttachmentsString }`

      // Prepare the user attachments
      const userAttachments = attachments.map((
        attachment: { name: string; type: string; content: string }) => ({
          name: attachment.name,
          type: attachment.type,
          content: attachment.content
        })
      )

      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano-2025-04-14",
        messages: [
          {
            role: "system",
            content: systemContent
          },
          {
            role: "user",
            content: userContent
          }
        ],
        response_format: { type: "json_object" }
      })

      // Parse the response
      const result = JSON.parse(
        response.choices[0].message.content || '{}'
      )

      return {
        summary: result.summary || {},
        chartData: result.chartData || []
      }
    } catch (error) {
      console.error('Error analyzing data with OpenAI:', error)
      throw error
    }
  }
}

export const openAiService = new OpenAIService()
export default openAiService