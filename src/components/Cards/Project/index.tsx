// Externals
import React, { FC } from 'react'
import { Mail, BarChart2, ExternalLink, Calendar } from 'lucide-react'
// Locals
import type { PROJECT__DYNAMODB } from '@/types'
import ProgressBarLink from '@/components/Progress/ProgressBarLink'


interface ProjectCardProps {
  project: PROJECT__DYNAMODB
}

const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  return (
    <div className='bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg'>
      <div className='p-6'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center'>
            <div className='p-2 bg-blue-50 rounded-md'>
              <BarChart2 className='h-6 w-6 text-blue-600' />
            </div>
            <h3 className='ml-3 text-lg font-semibold text-gray-900'>
              { `${ project.name }` }
            </h3>
          </div>
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
            { `Active` }
          </span>
        </div>

        <div className='mt-4 grid grid-cols-2 gap-4'>
          <div className='flex items-center'>
            <Mail className='h-4 w-4 text-gray-400' />
            <span className='ml-2 text-sm text-gray-500'>
              { `${ project.emailCount } emails` }
            </span>
          </div>
          <div className='flex items-center'>
            <Calendar className='h-4 w-4 text-gray-400' />
            <span className='ml-2 text-sm text-gray-500'>
              { `Created ${ formatDate(new Date(project.createdAt)) }` }
            </span>
          </div>
        </div>

        <div className='mt-4 pt-4 border-t border-gray-100'>
          <div className='flex items-center text-sm text-gray-600'>
            <Mail className='h-4 w-4 text-gray-400 mr-2' />
            <span className='font-mono'>
              { `${ project.postmarkInboundEmail }` }
            </span>
          </div>
        </div>

        <div className='mt-4 flex justify-end'>
          <ProgressBarLink
            href={ `/projects/${ project.id }` }
            className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            { `View Details` }
            <ExternalLink className='ml-1.5 h-4 w-4' />
          </ProgressBarLink>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard
