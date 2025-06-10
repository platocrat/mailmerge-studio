// Externals
import React, { FC, useState } from 'react'
import { Share2, Download, Mail } from 'lucide-react'
// Locals
import { postmarkService } from '@/services'
import type { PROJECT__DYNAMODB } from '@/types'
import EmailDashboardModal from '@/components/Modals/EmailDashboard'
import { getConsoleMetadata } from '@/utils'
import DataVisualization from '@/components/DataViz/SampleDataViz'

interface DashboardPreviewProps {
  project: PROJECT__DYNAMODB
  dashboard?: any // Accept dashboard as an optional prop
  showControls?: boolean
}


const FILE_PATH = 'src/components/Previews/Dashboard/index.tsx'
const LOG_TYPE = 'CLIENT'


// ------------------------------- Component -----------------------------------
const DashboardPreview: FC<DashboardPreviewProps> = ({
  project,
  dashboard, // Accept dashboard prop
  showControls = true,
}) => {
  // ----------------------------- States --------------------------------------
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false)


  const formatDate = (_date: Date | string): string => {
    const date_: Date = typeof _date === 'string' 
      ? new Date(_date) 
      : _date
    const formattedDate: string = new Intl.DateTimeFormat(
      'en-US', 
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }
    ).format(date_)

    return formattedDate
  }

  // Use dashboard prop if provided, otherwise fallback to first email (legacy)
  const summary = dashboard?.summary || null
  const chartData = dashboard?.chartData || null
  const processedAt = dashboard?.processedAt || null


  // ------------------------------ Handlers -----------------------------------
  const handleShare = () => {
    // In a real implementation, this would generate a shareable link
    alert('Dashboard shared! (Demo functionality)')
  }


  const handleDownload = () => {
    // In a real implementation, this would download the dashboard as PDF
    alert('Downloading dashboard... (Demo functionality)')
  }


  const handleSendEmail = async (
    to: string, 
    subject: string, 
    additionalMessage: string
  ) => {
    const htmlBody = `
      <h2>Dashboard: ${ project.id }</h2>
      <p>Generated on ${ formatDate(new Date(processedAt || 0)) }</p>
      ${
        additionalMessage  
          ? `<p>${additionalMessage}</p>` 
          : ''
        }
      <h3>Summary</h3>
      <div>${ summary ? JSON.stringify(summary) : '' }</div>
      ${ chartData && chartData.labels && chartData.datasets ? `
          <h3>Data Visualizations</h3>
          <pre>${JSON.stringify(chartData, null, 2)}</pre>
        ` 
        : ''
      }
    `
    
    await postmarkService.sendDashboardEmail(
      to,
      subject,
      htmlBody
    )
  }


  // --------------------------- Rendering -------------------------------------
  return (
    <>
      <div className='bg-white rounded-lg shadow-md overflow-hidden'>
        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4'>
          <h2 className='text-xl font-bold text-white'>
            { `Dashboard: ${dashboard?.id || project.id}` }
          </h2>
          <p className='text-blue-100 text-sm mt-1'>
            { `Generated on ${ formatDate(new Date(processedAt || 0)) }` }
          </p>
        </div>
        <div className='p-6'>
          {dashboard ? (
            <DataVisualization
              chartData={dashboard.chartData}
              summary={dashboard.summary}
              title={dashboard.dataType ? `${dashboard.dataType.toUpperCase()} Data Visualization` : 'Data Visualization'}
              accessibilityDescription={`Chart showing ${dashboard.dataType || ''} data from email ${dashboard.sourceEmailId}`}
            />
          ) : (
            // Legacy fallback rendering
            <>
              <div className='mb-6'>
                <h3 className='text-lg font-medium text-gray-900 mb-3'>
                  { `Summary` }
                </h3>
                <div className='prose max-w-none'>
                  <span>{ `No summary available.` }</span>
                </div>
              </div>
            </>
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
                onClick={ () => setIsEmailModalOpen(true) }
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
        onClose={ () => setIsEmailModalOpen(false) }
        onSend={handleSendEmail}
        defaultSubject={ `Dashboard: ${project.id}` }
        defaultMessage=""
      />
    </>
  )
}

export default DashboardPreview
