// src/app/not-found.tsx
// Externals
import React from 'react'
import { Home, AlertCircle } from 'lucide-react'
// Locals
import ProgressBarLink from '@/components/Progress/ProgressBarLink'


export default function NotFound() {
  return (
    <div className='min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full text-center'>
        <AlertCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
        <h1 className='text-3xl font-extrabold text-gray-900 sm:text-4xl'>
          { `Page not found` }
        </h1>
        <p className='mt-3 text-lg text-gray-600'>
          { `Sorry, we couldn't find the page you're looking for.` }
        </p>
        <div className='mt-8'>
          <ProgressBarLink
            href='/'
            className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            <Home className='mr-2 h-5 w-5' />
            { `Back to Home` }
          </ProgressBarLink>
        </div>
      </div>
    </div>
  )
}