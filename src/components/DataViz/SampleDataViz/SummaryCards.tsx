import React, { FC } from 'react'
import { ArrowUpRight } from 'lucide-react'

interface SummaryCardsProps {
  summary?: Record<string, any>
}

const SummaryCards: FC<SummaryCardsProps> = ({ summary }) => {
  if (!summary) return null

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
      {Object.entries(summary).map(([key, value], index) => (
        <div
          key={index}
          className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'
        >
          <h3 className='text-sm font-medium text-gray-500 uppercase'>
            {`${key}`}
          </h3>
          <div className='mt-1 flex items-baseline'>
            <p className='text-2xl font-semibold text-gray-900'>
              {Array.isArray(value) ? value.join(', ') : value}
            </p>
            {typeof value === 'number' && (
              <span className='ml-2 flex items-center text-sm font-medium text-green-600'>
                <ArrowUpRight className='h-4 w-4' />
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default SummaryCards 