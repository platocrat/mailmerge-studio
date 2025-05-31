'use client'

// Externals
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { ChevronLeft, Download, Share2, Mail } from 'lucide-react'
// Locals
import { postmarkService } from '@/services'
import DataVisualization from '@/components/DataViz/SampleDataViz'
import EmailDashboardModal from '@/components/Modals/EmailDashboard'


// Sample dashboard data
const sampleDashboard = {
  id: 'dashboard-1',
  projectId: 'demo-project-1',
  projectName: 'Sales Dashboard',
  title: 'Weekly Sales Report',
  sourceEmailId: 'email-1',
  dataType: 'csv',
  processedAt: new Date(2025, 2, 15, 9, 35),
  summary: {
    'Total Sales': '$324,528',
    'Products Sold': 1284,
    'Top Region': 'West (42%)',
    'Growth': '+12.3%',
  },
  chartData: {
    type: 'bar',
    labels: ['North', 'South', 'East', 'West'],
    datasets: [
      {
        label: 'Sales ($)',
        data: [65000, 84000, 56000, 119528],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  },
  secondaryChartData: {
    type: 'line',
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'This Month',
        data: [65000, 89000, 102000, 124528],
        fill: false,
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.1,
      },
      {
        label: 'Last Month',
        data: [62000, 76000, 85000, 98000],
        fill: false,
        borderColor: 'rgb(139, 92, 246)',
        tension: 0.1,
      },
    ],
  },
  attachmentUrls: [],
}

const _ = () => {
  const { dashboardId } = useParams<{ dashboardId: string }>()
  const [ dashboard, setDashboard ] = useState(sampleDashboard)
  const [ loading, setLoading ] = useState(false)
  const [ isEmailModalOpen, setIsEmailModalOpen ] = useState(false)

  useEffect(() => {
    // In a real app, fetch dashboard data from Firestore
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setDashboard(sampleDashboard)
      setLoading(false)
    }, 500)
  }, [dashboardId])

  const handleDownload = () => {
    alert('Downloading dashboard... (Demo functionality)')
  }

  const handleShare = () => {
    alert('Dashboard share link copied! (Demo functionality)')
  }

  const handleSendEmail = async (to: string, subject: string, additionalMessage: string) => {
    const htmlBody = `
      <h2>${dashboard.title}</h2>
      <p>Generated on ${dashboard.processedAt.toLocaleString()}</p>
      ${additionalMessage ? `<p>${additionalMessage}</p>` : ''}
      <h3>Summary</h3>
      <ul>
        ${Object.entries(dashboard.summary).map(([key, value]) => 
          `<li><strong>${key}:</strong> ${value}</li>`
        ).join('')}
      </ul>
      ${dashboard.chartData ? `
        <h3>Chart Data</h3>
        <pre>${JSON.stringify(dashboard.chartData, null, 2)}</pre>
      ` : ''}
      ${dashboard.secondaryChartData ? `
        <h3>Secondary Chart Data</h3>
        <pre>${JSON.stringify(dashboard.secondaryChartData, null, 2)}</pre>
      ` : ''}
    `
    
    await postmarkService.sendDashboardEmail(
      to,
      subject,
      htmlBody
    )
  }

  if (loading) {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='animate-pulse space-y-6'>
          <div className='h-4 bg-gray-200 rounded w-1/4'></div>
          <div className='h-8 bg-gray-200 rounded w-3/4'></div>
          <div className='h-64 bg-gray-200 rounded'></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Breadcrumb */ }
        <div className='mb-6'>
          <Link
            href={ `/projects/${dashboard.projectId}` }
            className='text-blue-600 hover:text-blue-800 flex items-center'
          >
            <ChevronLeft className='h-4 w-4 mr-1' />
            { `Back to ${ dashboard.projectName }` }
          </Link>
        </div>

        {/* Dashboard header */ }
        <div className='bg-white rounded-lg shadow-md overflow-hidden mb-6'>
          <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
              <div>
                <h1 className='text-2xl font-bold text-white'>
                  { dashboard.title }
                </h1>
                <p className='text-blue-100 mt-1'>
                  { `Generated on ${ dashboard.processedAt.toLocaleString() }` }
                </p>
              </div>
              <div className='mt-4 md:mt-0 flex space-x-3'>
                <button
                  onClick={ handleDownload }
                  className='inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white'
                >
                  <Download className='h-4 w-4 mr-1.5' />
                  { `Download` }
                </button>
                <button
                  onClick={ handleShare }
                  className='inline-flex items-center px-3 py-2 border border-white rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white'
                >
                  <Share2 className='h-4 w-4 mr-1.5' />
                  { `Share` }
                </button>
                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className='inline-flex items-center px-3 py-2 border border-white rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white'
                >
                  <Mail className='h-4 w-4 mr-1.5' />
                  { `Email` }
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard content */ }
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
          {/* Summary cards */ }
          { Object.entries(dashboard.summary).map((
            [key, value], 
            index
          ) => (
            <div key={ index } className='bg-white rounded-lg shadow-md p-6'>
              <h3 className='text-sm font-medium text-gray-500 uppercase'>
                { key }
              </h3>
              <p className='mt-2 text-3xl font-semibold text-gray-900'>
                { value }
              </p>
            </div>
          )) }
        </div>

        {/* Main chart */ }
        <div className='bg-white rounded-lg shadow-md overflow-hidden mb-6'>
          <div className='p-6'>
            <h2 className='text-lg font-medium text-gray-900 mb-4'>
              { `Regional Sales Performance` }
            </h2>
            <div className='h-80'>
              <DataVisualization
                chartData={ dashboard.chartData }
                accessibilityDescription='Bar chart showing sales performance by region'
              />
            </div>
          </div>
        </div>

        {/* Secondary chart */ }
        <div className='bg-white rounded-lg shadow-md overflow-hidden mb-6'>
          <div className='p-6'>
            <h2 className='text-lg font-medium text-gray-900 mb-4'>
              { `Sales Trend` }
            </h2>
            <div className='h-80'>
              <DataVisualization
                chartData={ dashboard.secondaryChartData }
                accessibilityDescription='Line chart showing sales trend over time'
              />
            </div>
          </div>
        </div>

        {/* Data table for accessibility */ }
        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='p-6'>
            <h2 className='text-lg font-medium text-gray-900 mb-4'>
              { `Data Table (Accessibility View)` }
            </h2>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th 
                      scope='col' 
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      { `Region` }
                    </th>
                    <th 
                      scope='col' 
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      { `Sales Amount` }
                    </th>
                    <th 
                      scope='col' 
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      { `% of Total` }
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  { dashboard.chartData.labels.map((
                    label, 
                    index
                  ) => (
                    <tr key={ index }>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        { label }
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {
                          `$${ 
                            dashboard.chartData.datasets[0].data[index].toLocaleString() 
                          }`
                        }
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {
                          `${ 
                            Math.round(
                              (dashboard.chartData.datasets[0].data[index] /
                                dashboard.chartData.datasets[0].data.reduce(
                                  (a, b) => a + b, 0
                                )
                              ) * 100
                            ) 
                          }%`
                        }
                      </td>
                    </tr>
                  )) }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <EmailDashboardModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSend={handleSendEmail}
        defaultSubject={dashboard.title}
        defaultMessage=""
      />
    </>
  )
}

export default _