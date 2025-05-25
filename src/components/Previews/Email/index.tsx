// Externals
import React from 'react'
import { Mail, Paperclip, Calendar, AlertTriangle } from 'lucide-react'


interface EmailPreviewProps {
  email: {
    id: string
    fromEmail: string
    fromName: string
    subject: string
    textContent: string
    receivedAt: Date
    attachments: Array<{
      name: string
      type: string
      size: number
      url?: string
    }>
    spamScore: number
  }
}

const EmailPreview: React.FC<EmailPreviewProps> = ({ email }) => {
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

  const truncateText = (text: string, maxLength = 150) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className='bg-white rounded-lg shadow-md overflow-hidden'>
      <div className='p-6'>
        <div className='flex items-start justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>
              { `${ email.subject }` }
            </h3>
            <div className='mt-1 flex items-center'>
              <Mail className='h-4 w-4 text-gray-400' />
              <span className='ml-2 text-sm text-gray-600'>
                { `From: ${ email.fromName }` } &lt;{ `${ email.fromEmail }` }&gt;
              </span>
            </div>
            <div className='mt-1 flex items-center'>
              <Calendar className='h-4 w-4 text-gray-400' />
              <span className='ml-2 text-sm text-gray-500'>
                { `${ formatDate(email.receivedAt) }` }
              </span>
            </div>
          </div>

          {email.spamScore > 5 && (
            <div className='flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
              <AlertTriangle className='h-3 w-3 mr-1' />
              { `Spam Score: ${ email.spamScore }` }
            </div>
          )}
        </div>

        <div className='mt-4 text-sm text-gray-700'>
          <p>
            { `${ truncateText(email.textContent) }` }
          </p>
        </div>

        {email.attachments.length > 0 && (
          <div className='mt-4 pt-4 border-t border-gray-100'>
            <h4 className='text-sm font-medium text-gray-700 flex items-center'>
              <Paperclip className='h-4 w-4 mr-1' />
              { `Attachments (${ email.attachments.length })` }
            </h4>
            <div className='mt-2 grid grid-cols-1 gap-2'>
              { email.attachments.map((attachment, index) => (
                <div key={index} className='flex items-center text-sm'>
                  <div className='p-1.5 bg-gray-100 rounded mr-2'>
                    <Paperclip className='h-3 w-3 text-gray-500' />
                  </div>
                  <span className='text-gray-900 font-medium'>
                    { `${ attachment.name }` }
                  </span>
                  <span className='ml-2 text-gray-500'>
                    { `(${ formatFileSize(attachment.size) })` }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmailPreview
