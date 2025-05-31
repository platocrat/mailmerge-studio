// `src/app/demo/page.tsx`
'use client'

// Externals
import React, { ChangeEvent, FormEvent, useState } from 'react'
import { Mail, Send, FileText, Plus, Trash2, BarChart2 } from 'lucide-react'
// Locals
import { PostmarkAttachment, PostmarkInboundWebhookJson } from '@/services'
import DataVisualization from '@/components/DataViz/SampleDataViz'

// --------------------------------- Types -------------------------------------
type Attachments = Array<{ 
  name: string, 
  type: string,
  size: number,
  file?: File 
}>

// --------------------------------Constants -----------------------------------
// Random inbound hash for displaying in the UI
const RANDOM_INBOUND_HASH = '2a085f662f0b4fca9e7d7a344e36583e'
const MAX_TOTAL_SIZE_MB = 35
const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024

// ------------------------------- Component -----------------------------------
const _ = () => {
  // ------------------------------- States ------------------------------------
  const [
    attachments, 
    setAttachments
  ] = useState<Attachments>([])
  const [ 
    formData, 
    setFormData 
  ] = useState<Partial<PostmarkInboundWebhookJson>>({
    FromName: 'Demo User',
    From: 'user@example.com',
    To: `${ process.env.NEXT_PUBLIC_POSTMARK_INBOUND_HASH }@inbound.postmarkapp.com`,
    Subject: 'Test Data #csv',
    TextBody: 'Please process the attached CSV file with sales data.',
    HtmlBody: '<p>Please process the attached CSV file with sales data.</p>',
    MailboxHash: 'test',
    Attachments: []
  })
  // Processing status and result
  const [
    processingStatus, 
    setProcessingStatus
  ] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [totalSize, setTotalSize] = useState<number>(0)
  const [sizeError, setSizeError] = useState<string>('')
  const [isAddingAttachment, setIsAddingAttachment] = useState<boolean>(false)
  const [processedData, setProcessedData] = useState<any>(null)


  // ----------------------------- Handlers ------------------------------------
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(
      (prev: Partial<PostmarkInboundWebhookJson>) => (
        { 
          ...prev, 
          [name]: value 
        }
      )
    )
  }


  const handleAddAttachment = () => {
    setIsAddingAttachment(true)
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.csv,.json,image/*'
    
    fileInput.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files[0]) {
        const file = target.files[0]
        const newSize = totalSize + file.size
        
        if (newSize > MAX_TOTAL_SIZE_BYTES) {
          setSizeError(`Total attachment size cannot exceed ${MAX_TOTAL_SIZE_MB}MB`)
          setIsAddingAttachment(false)
          return
        }
        
        setSizeError('')
        setTotalSize(newSize)
        setAttachments([
          ...attachments,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            file: file
          }
        ])
      }
      setIsAddingAttachment(false)
    }

    fileInput.oncancel = () => {
      setIsAddingAttachment(false)
    }
    
    fileInput.click()
  }


  const handleRemoveAttachment = (index: number) => {
    const removedAttachment = attachments[index]

    setTotalSize(totalSize - removedAttachment.size)
    setAttachments(
      attachments.filter((_, i): boolean => i !== index)
    )
    setSizeError('')
  }


  const handleAttachmentChange = (
    index: number, 
    field: string, 
    value: string
  ) => {
    const updatedAttachments = [ ...attachments ]

    updatedAttachments[index] = { 
      ...updatedAttachments[index], 
      [field]: value 
    }
    setAttachments(updatedAttachments)
  }

  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    setProcessingStatus('processing')

    try {
      // Convert attachments to Postmark format
      const postmarkAttachments = await Promise.all(
        attachments.map(
          async (
            attachment: Attachments[number]
          ): Promise<PostmarkAttachment> => {
            // Read file content as base64
            const content = await new Promise<string>((resolve) => {
              const reader = new FileReader()

              reader.onload = () => {
                const base64 = reader.result as string
                // Remove data URL prefix (e.g. "data:application/csv;base64,")
                resolve(base64.split(',')[1])
              }

              reader.readAsDataURL(attachment.file!)
            })

            return {
              Name: attachment.name,
              Content: content,
              ContentType: attachment.type,
              ContentLength: attachment.size,
            }
          }
        )
      )

      // Send email using our API route
      const sendEmailResponse = await fetch('/api/postmark/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          From: formData.From,
          To: formData.To,
          Subject: formData.Subject,
          TextBody: formData.TextBody,
          HtmlBody: formData.HtmlBody,
          Attachments: postmarkAttachments
        })
      })

      if (!sendEmailResponse.ok) {
        setProcessingStatus('error')
        throw new Error('Failed to send email')
      }

      const sendEmailResult = await sendEmailResponse.json()

      if (sendEmailResult.success) {
        setProcessingStatus('success')
        console.log('sendEmailResult: ', sendEmailResult)
      } else {
        setProcessingStatus('error')
        throw new Error(sendEmailResult.error)
      }

    } catch (error) {
      console.error('Error sending email:', error)
      setProcessingStatus('error')
    }
  }


  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }



  // --------------------------- Render Component ------------------------------
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='bg-white rounded-lg shadow-md overflow-hidden mb-8'>
        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4'>
          <h1 className='text-2xl font-bold text-white'>
            { `Demo` }
          </h1>
          <p className='text-blue-100 mt-1'>
            { `Test the email processing functionality by sending a new email to MailMerge Studio` }
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Form */ }
        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='p-6'>
            <h2 className='text-lg font-medium text-gray-900 mb-4'>
              <Mail className='inline-block h-5 w-5 mr-2 text-blue-600' />
              { `Send New Email to MailMerge Studio` }
            </h2>

            <form 
              onSubmit={ handleSubmit } 
              className='space-y-6'
            >
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label 
                    htmlFor='FromName' 
                    className='block text-sm font-medium text-gray-700'
                  >
                    { `From Name` }
                  </label>
                  <input
                    type='text'
                    name='FromName'
                    id='FromName'
                    value={ formData.FromName || '' }
                    onChange={ handleInputChange }
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black'
                  />
                </div>

                <div>
                  <label 
                    htmlFor='From' 
                    className='block text-sm font-medium text-gray-700'
                  >
                    { `From Email` }
                  </label>
                  <input
                    type='email'
                    name='From'
                    id='From'
                    value={ formData.From || '' }
                    onChange={ handleInputChange }
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black'
                  />
                </div>
              </div>

              {/* <div>
                <label 
                  htmlFor='To' 
                  className='block text-sm font-medium text-gray-700'
                >
                  { `To Email (Project Address)` }
                </label>
                <input
                  type='email'
                  name='To'
                  id='To'
                  value={ formData.To || '' }
                  onChange={ handleInputChange }
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black'
                />
                <p className='mt-1 text-xs text-gray-500'>
                  { `Format: ${ RANDOM_INBOUND_HASH }@inbound.postmarkapp.com` }
                </p>
              </div> */}

              <div>
                <label 
                  htmlFor='Subject' 
                  className='block text-sm font-medium text-gray-700'
                >
                  { `Subject (include #commands)` }
                </label>
                <input
                  type='text'
                  name='Subject'
                  id='Subject'
                  value={ formData.Subject || '' }
                  onChange={ handleInputChange }
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black'
                />
                <p className='mt-1 text-xs text-gray-500'>
                  { `Add commands like #csv #sum #filter for data processing` }
                </p>
              </div>

              <div>
                <label 
                  htmlFor='TextBody' 
                  className='block text-sm font-medium text-gray-700'
                >
                  { `Email Body` }
                </label>
                <textarea
                  name='TextBody'
                  id='TextBody'
                  rows={ 3 }
                  value={ formData.TextBody || '' }
                  onChange={ handleInputChange }
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  { `Attachments` }
                </label>
                <div className='mt-2 space-y-3'>
                  { attachments.map((attachment, index) => (
                    <div 
                      key={ index } 
                      className='flex items-center space-x-2'
                    >
                      <FileText className='h-5 w-5 text-gray-400' />
                      <div className='flex-1'>
                        <div className='text-sm text-gray-900'>
                          { attachment.name }
                        </div>
                        <div className='text-xs text-gray-500'>
                          { formatFileSize(attachment.size) }
                        </div>
                      </div>
                      <button
                        type='button'
                        onClick={ () => handleRemoveAttachment(index) }
                        className='p-1 text-gray-400 hover:text-red-500'
                      >
                        <Trash2 className='h-5 w-5' />
                      </button>
                    </div>
                  )) }
                  { sizeError && (
                    <div className='text-sm text-red-600 mt-2'>
                      { sizeError }
                    </div>
                  )}
                  <div className='text-sm text-gray-500 mt-2'>
                    { `Total size: ${ formatFileSize(totalSize) } / ${ MAX_TOTAL_SIZE_MB }MB` }
                  </div>
                  <button
                    type='button'
                    onClick={ handleAddAttachment }
                    disabled={ isAddingAttachment }
                    className={`
                      inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                      ${isAddingAttachment ? 'opacity-75 cursor-not-allowed' : ''}
                    `}
                  >
                    { isAddingAttachment ? (
                      <>
                        <svg 
                          className='animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700' 
                          xmlns='http://www.w3.org/2000/svg' 
                          fill='none' 
                          viewBox='0 0 24 24'
                        >
                          <circle 
                            className='opacity-25' 
                            cx='12' 
                            cy='12' 
                            r='10' 
                            stroke='currentColor' 
                            strokeWidth='4'
                          />
                          <path 
                            className='opacity-75' 
                            fill='currentColor' 
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          />
                        </svg>
                        { `Adding Attachment...` }
                      </>
                    ) : (
                      <>
                        <Plus className='h-4 w-4 mr-1.5' />
                        { `Add Attachment` }
                      </>
                    ) }
                  </button>
                </div>
              </div>

              <div>
                <button
                  type='submit'
                  disabled={ processingStatus === 'processing' }
                  className={ 
                    `inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      processingStatus === 'processing' 
                        ? 'opacity-75 cursor-not-allowed' 
                        : ''
                    }` 
                  }
                >
                  { processingStatus === 'processing' ? (
                    <>
                      <svg 
                        className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' 
                        xmlns='http://www.w3.org/2000/svg' 
                        fill='none' 
                        viewBox='0 0 24 24'
                      >
                        <circle 
                          className='opacity-25' 
                          cx='12' 
                          cy='12' 
                          r='10' 
                          stroke='currentColor' 
                          strokeWidth='4'
                        />
                        <path 
                          className='opacity-75' 
                          fill='currentColor' 
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        />
                      </svg>
                      { `Processing...` }
                    </>
                  ) : (
                    <>
                      <Send className='h-5 w-5 mr-2' />
                      { `Send Email` }
                    </>
                  ) }
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Result */ }
        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='p-6'>
            <h2 className='text-lg font-medium text-gray-900 mb-4'>
              <BarChart2 className='inline-block h-5 w-5 mr-2 text-blue-600' />
              { `Processing Result` }
            </h2>

            { processingStatus === 'idle' && (
              <div className='text-center py-12'>
                <Mail className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  { `No data processed yet` }
                </h3>
                <p className='text-gray-500'>
                  { `Submit an email using the form to see results` }
                </p>
              </div>
            ) }

            { processingStatus === 'processing' && (
              <div className='text-center py-12'>
                <div className='inline-block animate-spin h-12 w-12 text-blue-600 mb-4'>
                  <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                    <circle 
                      className='opacity-25' 
                      cx='12' 
                      cy='12' 
                      r='10' 
                      stroke='currentColor' 
                      strokeWidth='4'
                    />
                    <path 
                      className='opacity-75' 
                      fill='currentColor' 
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  { `Processing your data` }
                </h3>
                <p className='text-gray-500'>
                  { `Please wait while we analyze your email...` }
                </p>
              </div>
            ) }

            { processingStatus === 'error' && (
              <div className='text-center py-12'>
                <div className='bg-red-100 text-red-700 p-4 rounded-lg mb-4'>
                  <h3 className='text-lg font-medium mb-2'>
                    { `Processing Error` }
                  </h3>
                  <p>
                    { `An error occurred while processing your email. Please try again.` }
                  </p>
                </div>
              </div>
            ) }

            { processingStatus === 'success' && processedData && (
              <div className='py-4'>
                <div className='bg-green-100 text-green-700 p-4 rounded-lg mb-6'>
                  <h3 className='text-lg font-medium mb-2'>
                    { `Processing Complete!` }
                  </h3>
                  <p>
                    { `Your email was successfully processed. The dashboard is ready.` }
                  </p>
                </div>

                <div className='space-y-6'>
                  {/* Summary Section */}
                  <div className='bg-white rounded-lg shadow p-4'>
                    <h4 className='text-md font-medium text-gray-900 mb-3'>
                      { `Summary` }
                    </h4>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                      { Object.entries(
                        processedData.summary
                      ).map(([key, value]) => (
                        <div key={key} className='bg-gray-50 p-3 rounded'>
                          <div className='text-sm text-gray-500'>
                            {key}
                          </div>
                          <div className='text-lg font-semibold'>
                            {String(value)}
                          </div>
                        </div>
                      )) }
                    </div>
                  </div>

                  {/* Chart Section */}
                  { processedData.chartData && (
                    <div className='bg-white rounded-lg shadow p-4'>
                      <h4 className='text-md font-medium text-gray-900 mb-3'>
                        { `Data Visualization` }
                      </h4>
                      <DataVisualization 
                        chartData={processedData.chartData} 
                      />
                    </div>
                  )}

                  {/* Attachments Section */}
                  { processedData.attachmentUrls && 
                    processedData.attachmentUrls.length > 0 && (
                    <div className='bg-white rounded-lg shadow p-4'>
                      <h4 className='text-md font-medium text-gray-900 mb-3'>
                        { `Processed Attachments` }
                      </h4>
                      <div className='space-y-2'>
                        { processedData.attachmentUrls.map((
                          url: string, 
                          index: number
                        ) => (
                          <div 
                            key={index} 
                            className='flex items-center space-x-2'
                          >
                            <FileText className='h-5 w-5 text-gray-400' />
                            <a 
                              href={url} 
                              target='_blank' 
                              rel='noopener noreferrer'
                              className='text-blue-600 hover:text-blue-800'
                            >
                              { url.split('/').pop() }
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) }
          </div>
        </div>
      </div>
    </div>
  )
}

export default _