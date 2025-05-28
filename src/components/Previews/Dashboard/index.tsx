// Externals
import React, { FC, useState } from 'react'
import { Share2, Download, Mail } from 'lucide-react'
// Locals
import DataVisualization from '@/components/DataViz/SampleDataViz'
import { ProcessedData } from '@/services/dataProcessingService'
import { postmarkService } from '@/services/postmarkService'
import EmailDashboardModal from '@/components/Modals/EmailDashboard'


interface DashboardPreviewProps {
  data: ProcessedData
  showControls?: boolean
}

const DashboardPreview: FC<DashboardPreviewProps> = ({
  data,
  showControls = true,
}) => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(d)
  }

  const handleShare = () => {
    // In a real implementation, this would generate a shareable link
    alert('Dashboard shared! (Demo functionality)')
  }

  const handleDownload = () => {
    // In a real implementation, this would download the dashboard as PDF
    alert('Downloading dashboard... (Demo functionality)')
  }

  const handleSendEmail = async (to: string, subject: string, additionalMessage: string) => {
    const htmlBody = `
      <h2>Dashboard: ${data.projectId}</h2>
      <p>Generated on ${formatDate(data.processedAt)}</p>
      ${additionalMessage ? `<p>${additionalMessage}</p>` : ''}
      <h3>Summary</h3>
      <ul>
        ${Object.entries(data.summary).map(([key, value]) => 
          `<li><strong>${key}:</strong> ${value}</li>`
        ).join('')}
      </ul>
      ${data.chartData ? `
        <h3>Chart Data</h3>
        <pre>${JSON.stringify(data.chartData, null, 2)}</pre>
      ` : ''}
    `
    
    await postmarkService.sendDashboardEmail(
      to,
      subject,
      htmlBody
    )
  }

  return (
    <>
      <div className='bg-white rounded-lg shadow-md overflow-hidden'>
        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4'>
          <h2 className='text-xl font-bold text-white'>
            Dashboard: {data.projectId}
          </h2>
          <p className='text-blue-100 text-sm mt-1'>
            Generated on {formatDate(data.processedAt)}
          </p>
        </div>

        <div className='p-6'>
          {/* Data visualization */}
          <DataVisualization
            chartData={data.chartData}
            summary={data.summary}
            title={ `${data.dataType.toUpperCase()} Data Visualization` }
            accessibilityDescription={ 
              `Chart showing ${data.dataType} data from email ${data.sourceEmailId}` 
            }
          />

          {/* Attachments preview */}
          { data.attachmentUrls && data.attachmentUrls.length > 0 && (
            <div className='mt-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-3'>
                { `Attachments` }
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                { data.attachmentUrls.map((url, index) => (
                  <div
                    key={index}
                    className='border border-gray-200 rounded-md p-3 flex items-center'
                  >
                    <div className='bg-gray-100 p-2 rounded-md'>
                      <Download className='h-5 w-5 text-gray-500' />
                    </div>
                    <div className='ml-3'>
                      <p className='text-sm font-medium text-gray-900'>
                        { `Attachment ${index + 1}` }
                      </p>
                      <a
                        href={url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-xs text-blue-600 hover:text-blue-800'
                      >
                        { `View File` }
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dashboard controls */}
          { showControls && (
            <div className='mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3'>
              <button
                onClick={handleShare}
                className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                <Share2 className='h-4 w-4 mr-1.5' />
                { `Share` }
              </button>
              <button
                onClick={handleDownload}
                className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                <Download className='h-4 w-4 mr-1.5' />
                { `Download PDF` }
              </button>
              <button
                onClick={() => setIsEmailModalOpen(true)}
                className='inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                <Mail className='h-4 w-4 mr-1.5' />
                { `Send via Email` }
              </button>
            </div>
          )}
        </div>
      </div>

      <EmailDashboardModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSend={handleSendEmail}
        defaultSubject={`Dashboard: ${data.projectId}`}
        defaultMessage=""
      />
    </>
  )
}

export default DashboardPreview
