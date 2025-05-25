// Ensures this is a client component in Next.js App Router
// src/app/projects/[projectId]/page.tsx
'use client'

// Externals
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { 
  Copy, 
  Mail, 
  Settings,
  BarChart2, 
  ChevronLeft, 
  ExternalLink,
} from 'lucide-react'
// Locals
import EmailPreview from '@/components/Previews/Email'
import DashboardPreview from '@/components/Previews/Dashboard'
import { ProcessedData } from '@/services/dataProcessingService'


// Demo data
const demoProject = {
  id: 'demo-project-1',
  name: 'Sales Dashboard',
  emailAddress: 'demo+sales@mmstudio.inbound.postmarkapp.com',
  createdAt: new Date(2025, 0, 15),
  description: 'Weekly sales reports and customer analytics',
}

const demoEmails = [
  {
    id: 'email-1',
    fromEmail: 'reports@company.com',
    fromName: 'Sales Reports',
    subject: 'Weekly Sales Report #csv',
    textContent: 'Attached is the weekly sales report for all regions. The data shows strong performance in the Western region, with a slight decline in the Eastern region compared to last week.',
    receivedAt: new Date(2025, 2, 15, 9, 30),
    attachments: [
      {
        name: 'weekly_sales.csv',
        type: 'text/csv',
        size: 24576,
      }
    ],
    spamScore: 0.1,
  },
  {
    id: 'email-2',
    fromEmail: 'analytics@company.com',
    fromName: 'Analytics Team',
    subject: 'Customer Satisfaction Survey Results #json',
    textContent: 'Here are the results from our latest customer satisfaction survey. Overall satisfaction score is 4.2/5, with product quality and customer service receiving the highest ratings.',
    receivedAt: new Date(2025, 2, 14, 15, 45),
    attachments: [
      {
        name: 'satisfaction_results.json',
        type: 'application/json',
        size: 15360,
      }
    ],
    spamScore: 0.2,
  }
]

const demoDashboards: ProcessedData[] = [
  {
    id: 'dashboard-1',
    projectId: 'demo-project-1',
    sourceEmailId: 'email-1',
    dataType: 'csv',
    processedAt: new Date(2025, 2, 15, 9, 35),
    summary: {
      'Total Sales': '$324,528',
      'Products Sold': 1284,
      'Top Region': 'West (42%)',
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
    attachmentUrls: [],
  },
  {
    id: 'dashboard-2',
    projectId: 'demo-project-1',
    sourceEmailId: 'email-2',
    dataType: 'json',
    processedAt: new Date(2025, 2, 14, 15, 50),
    summary: {
      'Satisfaction Score': '4.2/5',
      'Responses': 752,
      'NPS Score': 68,
    },
    chartData: {
      type: 'bar',
      labels: ['Product Quality', 'Customer Service', 'Price', 'Ease of Use', 'Support'],
      datasets: [
        {
          label: 'Rating (0-5)',
          data: [4.5, 4.3, 3.8, 4.1, 4.0],
          backgroundColor: 'rgba(139, 92, 246, 0.5)',
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 1,
        },
      ],
    },
    attachmentUrls: [],
  },
]

const _ = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const [
    activeTab,
    setActiveTab
  ] = useState<'emails' | 'dashboards' | 'settings'>('dashboards')

  // In a real app, we would fetch this data from Firestore
  const project = demoProject
  const emails = demoEmails
  const dashboards = demoDashboards

  const copyEmailAddress = () => {
    navigator.clipboard.writeText(project.emailAddress)
    alert('Email address copied to clipboard!')
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      {/* Breadcrumb */ }
      <div className='mb-6'>
        <Link href='/' className='text-blue-600 hover:text-blue-800 flex items-center'>
          <ChevronLeft className='h-4 w-4 mr-1' />
          { `Back to Projects` }
        </Link>
      </div>

      {/* Project header */ }
      <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              { project.name }
            </h1>
            <p className='text-gray-600 mt-1'>
              { project.description }
            </p>
          </div>
          <div className='mt-4 md:mt-0'>
            <div className='inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-50'>
              <Mail className='h-4 w-4 text-gray-500 mr-2' />
              <span className='font-mono'>
                { project.emailAddress }
              </span>
              <button
                onClick={ copyEmailAddress }
                className='ml-2 text-blue-600 hover:text-blue-800'
                aria-label='Copy email address'
              >
                <Copy className='h-4 w-4' />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */ }
      <div className='border-b border-gray-200 mb-6'>
        <nav className='-mb-px flex space-x-8'>
          <button
            onClick={ () => setActiveTab('dashboards') }
            className={ 
              `${
                activeTab === 'dashboards'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center` 
            }
          >
            <BarChart2 className='h-5 w-5 mr-2' />
            { `Dashboards` }
          </button>
          <button
            onClick={ () => setActiveTab('emails') }
            className={ 
              `${
                activeTab === 'emails'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center` 
            }
          >
            <Mail className='h-5 w-5 mr-2' />
            { `Emails` }
          </button>
          <button
            onClick={ () => setActiveTab('settings') }
            className={ 
              `${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center` 
            }
          >
            <Settings className='h-5 w-5 mr-2' />
            { `Settings` }
          </button>
        </nav>
      </div>

      {/* Tab content */ }
      <div>
        { activeTab === 'dashboards' && (
          <div className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-xl font-semibold text-gray-900'>
                { `Dashboards` }
              </h2>
            </div>

            { dashboards.length > 0 ? (
              <div className='space-y-8'>
                { dashboards.map((dashboard) => (
                  <div key={ dashboard.id }>
                    <DashboardPreview data={ dashboard } />
                  </div>
                )) }
              </div>
            ) : (
              <div className='bg-white p-8 rounded-lg shadow-md text-center'>
                <BarChart2 className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  { `No dashboards yet` }
                </h3>
                <p className='text-gray-600 mb-6'>
                  { `Forward emails to your project address to generate dashboards` }
                </p>
              </div>
            ) }
          </div>
        ) }

        { activeTab === 'emails' && (
          <div className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-xl font-semibold text-gray-900'>
                { `Received Emails` }
              </h2>
            </div>

            { emails.length > 0 ? (
              <div className='space-y-6'>
                { emails.map((email) => (
                  <EmailPreview key={ email.id } email={ email } />
                )) }
              </div>
            ) : (
              <div className='bg-white p-8 rounded-lg shadow-md text-center'>
                <Mail className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  { `No emails yet` }
                </h3>
                <p className='text-gray-600 mb-6'>
                  { `Forward emails to your project address to start processing data` }
                </p>
              </div>
            ) }
          </div>
        ) }

        { activeTab === 'settings' && (
          <div className='bg-white rounded-lg shadow-md overflow-hidden'>
            <div className='px-4 py-5 sm:p-6'>
              <h3 className='text-lg leading-6 font-medium text-gray-900'>
                { `Project Settings` }
              </h3>
              <div className='mt-5 border-t border-gray-200 pt-5'>
                <dl className='divide-y divide-gray-200'>
                  <div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4'>
                    <dt className='text-sm font-medium text-gray-500'>
                      { `Project Name` }
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                      { project.name }
                    </dd>
                  </div>
                  <div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4'>
                    <dt className='text-sm font-medium text-gray-500'>
                      { `Project ID` }
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono'>
                      { project.id }
                    </dd>
                  </div>
                  <div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4'>
                    <dt className='text-sm font-medium text-gray-500'>
                      { `Email Address` }
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono flex items-center'>
                      { project.emailAddress }
                      <button
                        onClick={ copyEmailAddress }
                        className='ml-2 text-blue-600 hover:text-blue-800'
                        aria-label='Copy email address'
                      >
                        <Copy className='h-4 w-4' />
                      </button>
                    </dd>
                  </div>
                  <div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4'>
                    <dt className='text-sm font-medium text-gray-500'>
                      { `Created At` }
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                      { project.createdAt.toLocaleDateString() }
                    </dd>
                  </div>
                </dl>
              </div>

              <div className='mt-6 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4'>
                <button
                  type='button'
                  className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  { `Update Project` }
                </button>
                <button
                  type='button'
                  className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                >
                  { `Delete Project` }
                </button>
              </div>
            </div>
          </div>
        ) }
      </div>
    </div>
  )
}

export default _