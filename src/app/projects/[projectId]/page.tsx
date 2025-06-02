// Ensures this is a client component in Next.js App Router
// src/app/projects/[projectId]/page.tsx
'use client'

// Externals
import {
  BarChart2,
  ChevronLeft,
  Copy,
  Mail,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { FC, useEffect, useState } from 'react'
// Locals
import EmailPreview from '@/components/Previews/Email'
import DashboardPreview from '@/components/Previews/Dashboard'
import type { PROJECT__DYNAMODB } from '@/types'
import { getConsoleMetadata } from '@/utils'


// ------------------------------ Constants ------------------------------------
const FILE_PATH = 'src/app/projects/[projectId]/page.tsx'
const CONSOLE_LEVEL = 'CLIENT'

// -------------------------------- Types --------------------------------------
// ------------------------------ Demo data ------------------------------------
const demoProjects: Record<string, PROJECT__DYNAMODB> = {
  'demo-project-1': {
    id: 'demo-project-1',
    accountEmail: 'demo@mmstudio.com',
    name: 'Sales Dashboard',
    postmarkInboundEmail: 'demo+sales@mmstudio.inbound.postmarkapp.com',
    createdAt: new Date(2025, 0, 15).getTime(),
    description: 'Weekly sales reports and customer analytics',
    status: 'Active',
  },
  'demo-project-2': {
    id: 'demo-project-2',
    accountEmail: 'demo@mmstudio.com',
    name: 'Customer Feedback',
    postmarkInboundEmail: 'demo+feedback@mmstudio.inbound.postmarkapp.com',
    createdAt: new Date(2025, 1, 3).getTime(),
    description: 'Customer satisfaction surveys and feedback analysis',
    status: 'Active',
  },
  'demo-project-3': {
    id: 'demo-project-3',
    accountEmail: 'demo@mmstudio.com',
    name: 'Field Research',
    postmarkInboundEmail: 'demo+research@mmstudio.inbound.postmarkapp.com',
    createdAt: new Date(2025, 2, 10).getTime(),
    description: 'Field research data and market insights',
    status: 'Active',
  }
}

const demoEmails = {
  'demo-project-1': [
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
          url: 'https://example.com/weekly_sales.csv',
        }
      ],
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
          url: 'https://example.com/satisfaction_results.json',
        }
      ],
    }
  ],
  'demo-project-2': [
    {
      id: 'email-1',
      fromEmail: 'feedback@company.com',
      fromName: 'Customer Support',
      subject: 'Q1 Customer Feedback Summary #csv',
      textContent: 'Here is the summary of customer feedback collected during Q1. We received positive feedback about our new features, but there are some concerns about response times.',
      receivedAt: new Date(2025, 2, 15, 10, 30),
      attachments: [
        {
          name: 'q1_feedback.csv',
          type: 'text/csv',
          size: 32768,
          url: 'https://example.com/q1_feedback.csv',
        }
      ],
    },
    {
      id: 'email-2',
      fromEmail: 'surveys@company.com',
      fromName: 'Survey Team',
      subject: 'Product Satisfaction Survey #json',
      textContent: 'Results from our latest product satisfaction survey. Users particularly appreciated the improved UI and new features.',
      receivedAt: new Date(2025, 2, 14, 14, 20),
      attachments: [
        {
          name: 'product_satisfaction.json',
          type: 'application/json',
          size: 20480,
          url: 'https://example.com/product_satisfaction.json',
        }
      ],
    }
  ],
  'demo-project-3': [
    {
      id: 'email-1',
      fromEmail: 'research@company.com',
      fromName: 'Research Team',
      subject: 'Market Research Data #csv',
      textContent: 'Attached is the market research data collected from our field agents. The data shows interesting trends in consumer behavior across different regions.',
      receivedAt: new Date(2025, 2, 15, 11, 15),
      attachments: [
        {
          name: 'market_research.csv',
          type: 'text/csv',
          size: 40960,
          url: 'https://example.com/market_research.csv',
        }
      ],
    },
    {
      id: 'email-2',
      fromEmail: 'analytics@company.com',
      fromName: 'Analytics Team',
      subject: 'Competitor Analysis #json',
      textContent: 'Here is the competitor analysis based on our field research. We\'ve identified several key areas where we can improve our market position.',
      receivedAt: new Date(2025, 2, 14, 16, 30),
      attachments: [
        {
          name: 'competitor_analysis.json',
          type: 'application/json',
          size: 28672,
          url: 'https://example.com/competitor_analysis.json',
        }
      ],
    }
  ]
}

const demoDashboards = {
  'demo-project-1': [
    {
      id: 'dashboard-1',
      projectId: 'demo-project-1',
      sourceEmailId: 'email-1',
      dataType: 'csv',
      processedAt: new Date(2025, 2, 15, 9, 35).getTime(),
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
      processedAt: new Date(2025, 2, 14, 15, 50).getTime(),
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
    }
  ],
  'demo-project-2': [
    {
      id: 'dashboard-1',
      projectId: 'demo-project-2',
      sourceEmailId: 'email-1',
      dataType: 'csv',
      processedAt: new Date(2025, 2, 15, 10, 35).getTime(),
      summary: {
        'Total Responses': '1,245',
        'Positive Feedback': '78%',
        'Response Time': '2.3 days',
      },
      chartData: {
        type: 'bar',
        labels: ['Product', 'Support', 'Features', 'UI/UX', 'Performance'],
        datasets: [
          {
            label: 'Satisfaction Score',
            data: [4.2, 3.8, 4.5, 4.3, 4.0],
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1,
          },
        ],
      },
      attachmentUrls: [],
    },
    {
      id: 'dashboard-2',
      projectId: 'demo-project-2',
      sourceEmailId: 'email-2',
      dataType: 'json',
      processedAt: new Date(2025, 2, 14, 14, 25).getTime(),
      summary: {
        'Survey Responses': 892,
        'Average Rating': '4.3/5',
        'Feature Requests': 156,
      },
      chartData: {
        type: 'pie',
        labels: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
        datasets: [
          {
            data: [45, 35, 12, 5, 3],
            backgroundColor: [
              'rgba(16, 185, 129, 0.5)',
              'rgba(59, 130, 246, 0.5)',
              'rgba(245, 158, 11, 0.5)',
              'rgba(239, 68, 68, 0.5)',
              'rgba(220, 38, 38, 0.5)',
            ],
            borderColor: [
              'rgba(16, 185, 129, 1)',
              'rgba(59, 130, 246, 1)',
              'rgba(245, 158, 11, 1)',
              'rgba(239, 68, 68, 1)',
              'rgba(220, 38, 38, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      attachmentUrls: [],
    }
  ],
  'demo-project-3': [
    {
      id: 'dashboard-1',
      projectId: 'demo-project-3',
      sourceEmailId: 'email-1',
      dataType: 'csv',
      processedAt: new Date(2025, 2, 15, 11, 20).getTime(),
      summary: {
        'Total Surveys': '2,450',
        'Regions Covered': 12,
        'Market Share': '23.5%',
      },
      chartData: {
        type: 'bar',
        labels: ['North', 'South', 'East', 'West', 'Central'],
        datasets: [
          {
            label: 'Market Share (%)',
            data: [25, 18, 22, 28, 20],
            backgroundColor: 'rgba(245, 158, 11, 0.5)',
            borderColor: 'rgba(245, 158, 11, 1)',
            borderWidth: 1,
          },
        ],
      },
      attachmentUrls: [],
    },
    {
      id: 'dashboard-2',
      projectId: 'demo-project-3',
      sourceEmailId: 'email-2',
      dataType: 'json',
      processedAt: new Date(2025, 2, 14, 16, 35).getTime(),
      summary: {
        'Competitors Analyzed': 8,
        'Market Growth': '12.5%',
        'Key Insights': 15,
      },
      chartData: {
        type: 'radar',
        labels: ['Price', 'Quality', 'Features', 'Support', 'Innovation', 'Brand'],
        datasets: [
          {
            label: 'Our Company',
            data: [4.2, 4.5, 4.3, 4.0, 4.4, 4.1],
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            borderColor: 'rgba(245, 158, 11, 1)',
            borderWidth: 1,
          },
          {
            label: 'Competitor Average',
            data: [3.8, 4.0, 3.9, 3.7, 3.8, 3.9],
            backgroundColor: 'rgba(156, 163, 175, 0.2)',
            borderColor: 'rgba(156, 163, 175, 1)',
            borderWidth: 1,
          },
        ],
      },
      attachmentUrls: [],
    }
  ]
}



// --------------------------- Client Component --------------------------------
const _ = () => {
  // ---------------------------- URL params -----------------------------------
  const { projectId } = useParams<{ projectId: string }>()
  // ------------------------------ Hooks --------------------------------------
  const router = useRouter()
  // ------------------------------ State --------------------------------------
  const [
    editedProject, 
    setEditedProject
  ] = useState<{ name: string, description: string }>(
    { name: '', description: '' }
  )
  const [
    activeTab, 
    setActiveTab
  ] = useState<'emails' | 'dashboards' | 'settings'>('dashboards')
  const [project, setProject] = useState<PROJECT__DYNAMODB | null>(null)
  const [dashboards, setDashboards] = useState<any[]>([])
  const [emails, setEmails] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)


  // -------------------------- Regular functions ------------------------------
  const copyEmailAddress = () => {
    navigator.clipboard.writeText(project?.postmarkInboundEmail ?? '')
    alert('Email address copied to clipboard!')
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId) return

    try {
      const API_URL = `/api/project`
      const response = await fetch(API_URL, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: projectId,
          name: editedProject.name,
          description: editedProject.description,
        }),
      })

      const consoleMetadata = getConsoleMetadata(
        CONSOLE_LEVEL,
        true,
        FILE_PATH,
        'handleEditSubmit()'
      )
      console.log(`${ consoleMetadata } response: `, response)

      if (response.status === 200) {
        const json = await response.json()
        const project = json.project

        setProject(project)
        setEmails(project.emails ?? [])
        alert('Project updated successfully!')
        setIsEditing(false)
      } else {
        const json = await response.json()
        const errorMessage = json.error || 'Failed to update project.'
        alert(errorMessage)
      }
    } catch (error) {
      const consoleMetadata = getConsoleMetadata(
        CONSOLE_LEVEL,
        false,
        FILE_PATH,
        'handleEditSubmit()'
      )
      const errorMessage = `Failed to update project. Please try again.`
      console.error(`${ consoleMetadata } ${ errorMessage }`, error)
      alert(errorMessage)
    }
  }

  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    setEditedProject(prev => ({
      ...prev,
      [name]: value
    }))
  }
  

  // ---------------------------- Async functions ------------------------------
  /**
   * @dev Delete project
   */
  const handleDelete = async () => {
    const confirmationMessage = `Are you sure you want to delete this project? This action cannot be undone.`

    if (!window.confirm(confirmationMessage)) return

    setIsDeleting(true)

    try {
      // In a real app, this would delete the project from Firestore
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      router.push('/')
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }


  /**
   * @dev GET Project from DynamoDB
   */
  async function getProject() {
    setLoading(true)

    if (demoProjects[projectId]) {
      setProject(demoProjects[projectId])
      setEditedProject({
        name: demoProjects[projectId].name,
        description: demoProjects[projectId].description ?? ''
      })
      setLoading(false)
      return
    }

    try {
      const API_URL = `/api/project?projectId=${ projectId }`
      const response = await fetch(API_URL, {
        method: 'GET',
        cache: 'force-cache',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // const consoleMetadata = getConsoleMetadata(
      //   CONSOLE_LEVEL,
      //   true,
      //   FILE_PATH,
      //   'getProject()'
      // )
      // console.log(`${ consoleMetadata } response: `, response)

      if (response.status === 200) {
        const json = await response.json()
        const project = json.project

        setProject(project)
        setEmails(project.emails ?? [])
        setEditedProject(
          { 
            name: project.name, 
            description: project.description ?? '' 
          }
        )
      } else {
        setProject(null)
      }
    } catch (error) {
      const consoleMetadata = getConsoleMetadata(
        CONSOLE_LEVEL,
        false,
        FILE_PATH,
        'getProject()'
      )
      const errorMessage = `Error fetching project: `
      console.error(`${ consoleMetadata } ${ errorMessage }`, error)
    } finally {
      setLoading(false)
    }
  }


  /**
   * @dev Fetch dashboards
   */
  async function getDashboards() {
    if (demoDashboards[projectId]) {
      setDashboards(demoDashboards[projectId])
      return
    }

    try {
      const API_URL = `/api/dashboards?projectId=${ projectId }`
      const response = await fetch(API_URL, {
        method: 'GET',
        cache: 'force-cache',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 200) {
        const data = await response.json()
        setDashboards(data)
      } else {
        setDashboards([])
      }
    } catch (error) {
      const consoleMetadata = getConsoleMetadata(
        CONSOLE_LEVEL,
        false,
        FILE_PATH,
        'getDashboards()'
      )
      const errorMessage = `Error fetching dashboards: `
      console.error(`${ consoleMetadata } ${ errorMessage }`, error)
    }
  }


  /**
   * @dev Fetch emails
   */
  async function getEmails() {
    if (demoEmails[projectId]) {
      setEmails(demoEmails[projectId])
      return
    }
  }


  // ----------------------------- useEffects ----------------------------------
  // Fetch project on mount
  useEffect(() => {
    if (projectId) {
      const requests = [
        getProject(),
        getDashboards(),
        getEmails(),
      ]

      Promise.all(requests).then(() => {
        setLoading(false)
      })
    }
  }, [ projectId ])


  // ------------------------------ Rendering ----------------------------------
  if (loading) {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='bg-white p-8 rounded-lg shadow-md text-center'>
          <h1 className='text-2xl font-semibold text-gray-900 mb-4'>
            { `Loading...` }
          </h1>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <button
          onClick={ () => router.push('/') }
          className='flex items-center text-blue-600 hover:text-blue-800 mb-6'
        >
          <ChevronLeft className='h-4 w-4 mr-1' />
          { `Back to Projects` }
        </button>
        <div className='bg-white p-8 rounded-lg shadow-md text-center'>
          <h1 className='text-2xl font-semibold text-gray-900 mb-4'>
            { `Project not found` }
          </h1>
          <p className='text-gray-600'>
            {
              `The project you are looking for doesn't exist or was just created. Please refresh once it finishes syncing.`
            }
          </p>
        </div>
      </div>
    )
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
                { project.postmarkInboundEmail }
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
                    <DashboardPreview project={ project } />
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
              <div className='flex justify-between items-center mb-5'>
                <h3 className='text-lg leading-6 font-medium text-gray-900'>
                  { `Project Settings` }
                </h3>
                { !isEditing && (
                  <div className='flex space-x-3'>
                    <button
                      type='button'
                      onClick={ () => setIsEditing(true) }
                      className='inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    >
                      { `Edit` }
                    </button>
                    <button
                      type='button'
                      onClick={ handleDelete }
                      disabled={ isDeleting }
                      className='inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      { isDeleting ? 'Deleting...' : 'Delete' }
                    </button>
                  </div>
                )}
              </div>
              <div className='mt-5 border-t border-gray-200 pt-5'>
                <dl className='divide-y divide-gray-200'>
                  <div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4'>
                    <dt className='text-sm font-medium text-gray-500'>
                      { `Project Name` }
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                      { isEditing ? (
                        <input
                          type='text'
                          name='name'
                          value={ editedProject.name }
                          onChange={ handleInputChange }
                          className='block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                          required
                        />
                      ) : (
                        project.name
                      )}
                    </dd>
                  </div>
                  <div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4'>
                    <dt className='text-sm font-medium text-gray-500'>
                      { `Description` }
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                      { isEditing ? (
                        <textarea
                          name='description'
                          rows={ 3 }
                          value={ editedProject.description }
                          onChange={ handleInputChange }
                          className='block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                          required
                        />
                      ) : (
                        project.description
                      )}
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
                      { project.postmarkInboundEmail }
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
                      { new Date(project.createdAt).toLocaleDateString() }
                    </dd>
                  </div>
                </dl>

                { isEditing && (
                  <div className='mt-6 flex justify-end space-x-3'>
                    <button
                      type='button'
                      onClick={ () => setIsEditing(false) }
                      className='inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    >
                      { `Cancel` }
                    </button>
                    <button
                      type='button'
                      onClick={ handleEditSubmit }
                      className='inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    >
                      { `Save Changes` }
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) }
      </div>
    </div>
  )
}

export default _