import { Mail } from 'lucide-react'

const Footer = () => (
  <footer className='bg-white border-t border-gray-200'>
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
      <div className='flex flex-col md:flex-row justify-between items-center'>
        <div className='flex items-center'>
          <Mail className='h-6 w-6 text-blue-600' />
          <span className='ml-2 text-lg font-semibold text-gray-700'>
            { `MailMerge Studio` }
          </span>
        </div>
        <div className='mt-4 md:mt-0 text-center md:text-right'>
          <p className='text-sm text-gray-500'>
            &copy; { `2025 MailMerge Studio. All rights reserved.` }
          </p>
          <div className='mt-2 flex justify-center md:justify-end space-x-4'>
            <a href='#' className='text-gray-500 hover:text-blue-600 text-sm'>
              { `Privacy Policy` }
            </a>
            <a href='#' className='text-gray-500 hover:text-blue-600 text-sm'>
              { `Terms of Service` }
            </a>
            <a href='#' className='text-gray-500 hover:text-blue-600 text-sm'>
              { `Accessibility` }
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
)

export default Footer 