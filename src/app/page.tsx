'use client'

// Externals
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Mail, Plus, BarChart2, Users } from 'lucide-react'
// Locals
import ProjectCard from '../components/Cards/Project'

interface Project {
  id: string
  name: string
  emailAddress: string
  createdAt: Date
  emailCount: number
  lastActivity?: Date
}

const demoProjects: Project[] = [
  {
    id: 'demo-project-1',
    name: 'Sales Dashboard',
    emailAddress: 'demo+sales@mmstudio.inbound.postmarkapp.com',
    createdAt: new Date(2025, 0, 15),
    emailCount: 24,
    lastActivity: new Date(2025, 1, 28)
  },
  {
    id: 'demo-project-2',
    name: 'Customer Feedback',
    emailAddress: 'demo+feedback@mmstudio.inbound.postmarkapp.com',
    createdAt: new Date(2025, 1, 3),
    emailCount: 87,
    lastActivity: new Date(2025, 2, 1)
  },
  {
    id: 'demo-project-3',
    name: 'Field Research',
    emailAddress: 'demo+research@mmstudio.inbound.postmarkapp.com',
    createdAt: new Date(2025, 2, 10),
    emailCount: 12,
    lastActivity: new Date(2025, 2, 15)
  }
]

export default function _() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      setProjects(demoProjects)
      await new Promise(res => setTimeout(res, 1000))
      setLoading(false)
    }

    fetchProjects()
  }, [])

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      {/* Hero Section */ }
      <div className='bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-xl overflow-hidden mb-8'>
        <div className='px-6 py-12 sm:px-12 sm:py-16 lg:py-20 lg:px-16 flex flex-col md:flex-row items-center'>
          <div className='md:w-1/2 md:pr-8'>
            <h1 className='text-3xl sm:text-4xl font-bold text-white leading-tight'>
              { `MailMerge Studio` }
            </h1>
            <p className='mt-3 text-lg text-blue-100'>
              { `Transform your emails into beautiful, interactive dashboards — no coding required.` }
            </p>
            <div className='mt-8 flex flex-wrap gap-4'>
              <Link
                href='/projects/new'
                className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-blue-600 bg-white hover:bg-blue-50'
              >
                <Plus className='mr-2 h-5 w-5' />
                { `New Project` }
              </Link>
              <Link
                href='/send-new-email'
                className='inline-flex items-center px-4 py-2 border border-white rounded-md shadow-sm text-base font-medium text-white hover:bg-blue-700'
              >
                { `Try Demo` }
              </Link>
            </div>
          </div>
          <div className='md:w-1/2 mt-8 md:mt-0 flex justify-center'>
            <div className='w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden'>
              <div className='p-4 bg-blue-50 border-b border-blue-100 flex items-center'>
                <Mail className='h-5 w-5 text-blue-600' />
                <span className='ml-2 text-sm font-medium text-blue-800'>
                  { `Inbox to Insights` }
                </span>
              </div>
              <div className='p-4 animate-pulse'>
                <div className='space-y-4 py-1'>
                  <div className='h-4 bg-blue-100 rounded w-3/4'></div>
                  <div className='space-y-2'>
                    <div className='h-4 bg-blue-100 rounded'></div>
                    <div className='h-4 bg-blue-100 rounded w-5/6'></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */ }
      <div className='mb-12'>
        <h2 className='text-2xl font-bold text-gray-900 mb-6'>
          { `How It Works` }
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {(() => {
            const bgColors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500'];
            return [
              {
                icon: <Mail className='h-6 w-6' />,
                title: '1. Forward Your Data',
                text: 'Forward emails with data attachments (CSV, JSON) to your unique project email address.'
              },
              {
                icon: <BarChart2 className='h-6 w-6' />,
                title: '2. Automated Analysis',
                text: 'Our system automatically processes your data and generates insightful visualizations.'
              },
              {
                icon: <Users className='h-6 w-6' />,
                title: '3. Share Insights',
                text: 'Receive beautiful, accessible dashboards via email or share them with your team.'
              }
            ].map(
              ({ icon, title, text }, idx) => (
                <div key={idx} className='bg-white p-6 rounded-lg shadow-md'>
                  <div className={`flex items-center justify-center h-12 w-12 rounded-md ${ bgColors[idx] } text-white mb-4`}>
                    {icon}
                  </div>
                  <h3 className='text-lg font-medium text-gray-900'>
                    {title}
                  </h3>
                  <p className='mt-2 text-gray-600'>
                    {text}
                  </p>
                </div>
              )
            );
          })()}
        </div>
      </div>

      {/* Projects Section */ }
      <div>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-900'>
            { `Your Projects` }
          </h2>
          <Link
            href='/projects/new'
            className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700'
          >
            <Plus className='mr-1.5 h-4 w-4' />
            { `New Project` }
          </Link>
        </div>

        { loading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            { [1, 2, 3].map(
              i => (
                <div key={ i } className='bg-white rounded-lg shadow-md p-6 animate-pulse'>
                  <div className='h-4 bg-gray-200 rounded w-3/4 mb-4'></div>
                  <div className='h-3 bg-gray-200 rounded w-1/2 mb-2'></div>
                  <div className='h-3 bg-gray-200 rounded w-2/3 mb-2'></div>
                  <div className='h-10 bg-gray-200 rounded mt-4'></div>
                </div>
              )
            ) }
          </div>
        ) : (
          projects.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              { projects.map(project => (
                <ProjectCard key={ project.id } project={ project } />
              )) }
            </div>
          ) : (
            <div className='bg-white p-8 rounded-lg shadow-md text-center'>
              <Mail className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                { `No projects yet` }
              </h3>
              <p className='text-gray-600 mb-6'>
                { `Create your first project to start transforming emails into dashboards` }
              </p>
              <Link
                href='/projects/new'
                className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700'
              >
                <Plus className='mr-2 h-5 w-5' />
                { `Create First Project` }
              </Link>
            </div>
          )
        ) }
      </div>
    </div>
  )
}