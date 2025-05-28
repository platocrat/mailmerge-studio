// Externals
import React, { useState } from 'react'
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
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAttachment, setSelectedAttachment] = useState<null | { name: string; url?: string }>(null)

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

  const handleAttachmentClick = (attachment: { name: string; url?: string }) => {
    setSelectedAttachment(attachment)
    setModalOpen(true)
  }

  const handleDownload = () => {
    if (selectedAttachment?.url) {
      // Create a temporary link and trigger download
      const link = document.createElement('a')
      link.href = selectedAttachment.url
      link.download = selectedAttachment.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    setModalOpen(false)
    setSelectedAttachment(null)
  }

  const handleCancel = () => {
    setModalOpen(false)
    setSelectedAttachment(null)
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
                  <button
                    type='button'
                    className='text-gray-900 font-medium underline hover:text-blue-600 focus:outline-none'
                    onClick={() => handleAttachmentClick(attachment)}
                  >
                    { `${ attachment.name }` }
                  </button>
                  <span className='ml-2 text-gray-500'>
                    { `(${ formatFileSize(attachment.size) })` }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {modalOpen && selectedAttachment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                { `Download Attachment` }
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                {`Would you like to download \"${selectedAttachment.name}\"?`}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  { `Cancel` }
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailPreview
