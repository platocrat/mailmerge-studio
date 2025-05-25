// src/app/webhook-simulator/page.tsx
'use client'

// Externals
import React, { ChangeEvent, FormEvent, useState } from 'react'
import { Mail, Send, FileText, Plus, Trash2, BarChart2 } from 'lucide-react'
// Locals
import DashboardPreview from '@/components/Previews/Dashboard'
import dataProcessingService from '@/services/dataProcessingService'
import { PostmarkInboundWebhook, postmarkService } from '@/services/postmarkService'

// --------------------------------- Types -------------------------------------
type Attachments = Array<{ name: string, type: string }>

// ------------------------------- Component -----------------------------------
const _ = () => {
  // ------------------------------- States ------------------------------------
  const [
    attachments, 
    setAttachments
  ] = useState<Attachments>(
    [
      { name: 'sales_data.csv', type: 'text/csv' }
    ] 
  )
  const [ 
    formData, 
    setFormData 
  ] = useState<Partial<PostmarkInboundWebhook>>({
    FromName: 'Demo User',
    From: 'user@example.com',
    To: 'demo+test@mmstudio.inbound.postmarkapp.com',
    Subject: 'Test Data #csv',
    TextBody: 'Please process the attached CSV file with sales data.',
    HtmlBody: '<p>Please process the attached CSV file with sales data.</p>',
    MailboxHash: 'test',
    Attachments: [],
    SpamScore: '0',
  })
  // Processing status and result
  const [
    processingStatus, 
    setProcessingStatus
  ] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [processingResult, setProcessingResult] = useState<any>(null)


  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(
      (prev: Partial<PostmarkInboundWebhook>) => (
        { 
          ...prev, 
          [name]: value 
        }
      )
    )
  }

  const handleAddAttachment = () => {
    setAttachments(
      [
        ...attachments, 
        { 
          name: `attachment_${ attachments.length + 1 }.csv`, 
          type: 'text/csv' 
        }
      ]
    )
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments(
      attachments.filter((_, i): boolean => i !== index)
    )
  }

  const handleAttachmentChange = (
    index: number, 
    field: string, 
    value: string
  ) => {
    const updatedAttachments = [ ...attachments ]
    
    updatedAttachments[ index ] = { 
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
      const postmarkAttachments = attachments.map(
        attachment => (
          {
            Name: attachment.name,
            // Base64 mock content
            Content: 'VGhpcyBpcyBhIGZha2UgY3N2IGZpbGUgY29udGVudCBmb3IgZGVtbyBwdXJwb3Nlcw==',
            ContentType: attachment.type,
            ContentLength: 1024, // Mock size
          }
        )
      )

      // Create webhook payload
      const webhookPayload: PostmarkInboundWebhook = {
        ...formData as PostmarkInboundWebhook,
        Attachments: postmarkAttachments,
        Headers: [
          { 
            Name: 'X-Spam-Score', 
            Value: formData.SpamScore || '0' 
          }
        ],
      }

      // Process webhook using our service
      const processedEmail = postmarkService.processInboundWebhook(webhookPayload)
      // Process data from the email
      const processedData = await dataProcessingService.processEmailData(processedEmail)

      // Store result for display
      setProcessingResult(processedData)
      setProcessingStatus('success')
    } catch (error) {
      console.error('Error processing webhook:', error)
      setProcessingStatus('error')
    }
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='bg-white rounded-lg shadow-md overflow-hidden mb-8'>
        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4'>
          <h1 className='text-2xl font-bold text-white'>
            { `Webhook Simulator` }
          </h1>
          <p className='text-blue-100 mt-1'>
            { `Test the email processing functionality by simulating a Postmark inbound webhook` }
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Form */ }
        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='p-6'>
            <h2 className='text-lg font-medium text-gray-900 mb-4'>
              <Mail className='inline-block h-5 w-5 mr-2 text-blue-600' />
              { `Simulate Email Submission` }
            </h2>

            <form onSubmit={ handleSubmit } className='space-y-6'>
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

              <div>
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
                  { `Format: demo+projectId@mmstudio.inbound.postmarkapp.com` }
                </p>
              </div>

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
                      <input
                        type='text'
                        placeholder='File name'
                        value={ attachment.name }
                        className='flex-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                        onChange={ 
                          (e) => handleAttachmentChange(
                            index, 
                            'name', 
                            e.target.value
                          )
                        }
                      />
                      <select
                        value={ attachment.type }
                        className='block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                        onChange={ 
                          (e) => handleAttachmentChange(
                            index, 
                            'type', 
                            e.target.value
                          ) 
                        }
                      >
                        <option value='text/csv'>CSV</option>
                        <option value='application/json'>JSON</option>
                        <option value='image/png'>Image</option>
                      </select>
                      <button
                        type='button'
                        onClick={ () => handleRemoveAttachment(index) }
                        className='p-1 text-gray-400 hover:text-red-500'
                      >
                        <Trash2 className='h-5 w-5' />
                      </button>
                    </div>
                  )) }
                  <button
                    type='button'
                    onClick={ handleAddAttachment }
                    className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  >
                    <Plus className='h-4 w-4 mr-1.5' />
                    { `Add Attachment` }
                  </button>
                </div>
              </div>

              <div>
                <label 
                  htmlFor='SpamScore' 
                  className='block text-sm font-medium text-gray-700'
                >
                  { `Spam Score (0-10)` }
                </label>
                <input
                  type='number'
                  min='0'
                  max='10'
                  step='0.1'
                  id='SpamScore'
                  name='SpamScore'
                  value={ formData.SpamScore || '0' }
                  onChange={ handleInputChange }
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black'
                />
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

            { processingStatus === 'success' && processingResult && (
              <div className='py-4'>
                <div className='bg-green-100 text-green-700 p-4 rounded-lg mb-6'>
                  <h3 className='text-lg font-medium mb-2'>
                    { `Processing Complete!` }
                  </h3>
                  <p>
                    { `Your email was successfully processed. The dashboard is ready.` }
                  </p>
                </div>

                <DashboardPreview data={ processingResult } showControls={ false } />
              </div>
            ) }
          </div>
        </div>
      </div>
    </div>
  )
}

export default _