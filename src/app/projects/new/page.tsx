// src/app/projects/new/page.tsx
'use client'

// Externals
import { useRouter } from 'next/navigation'
import { Mail, ArrowLeft } from 'lucide-react'
import React, { ChangeEvent, FormEvent, useContext, useState } from 'react'
// Locals
import { PROJECT__DYNAMODB } from '@/types'
import { getConsoleMetadata, RANDOM_POSTMARK_INBOUND_HASH, fetchJson } from '@/utils'
import { SessionContextType } from '@/contexts/types'
import { SessionContext } from '@/contexts/SessionContext'


// ------------------------------ Constants ------------------------------------
const LOG_TYPE = 'CLIENT'
const FILE_PATH = 'src/app/projects/new/page.tsx'


// ------------------------------- Component -----------------------------------
const _ = () => {
  // ----------------------------- Contexts ------------------------------------
  const { email } = useContext<SessionContextType>(SessionContext)
  // ------------------------------- Hooks -------------------------------------
  const router = useRouter()
  // ------------------------------- States ------------------------------------
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    postmarkInboundEmail: '',
  })

  // ------------------------------- Handlers ----------------------------------
  /**
   * @dev Handle input change
   * @param e - The input event
   */
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'postmarkInboundEmail') {
      // Validate Postmark Inbound Email format
      const regex = /^[^@\s]+@inbound\.postmarkapp\.com$/
      if (!regex.test(value)) {
        setEmailError(
          `Email must be in the format ${ RANDOM_POSTMARK_INBOUND_HASH }@inbound.postmarkapp.com`
        )
      } else {
        setEmailError('')
      }
    }
  }

  /**
   * @dev Handle Postmark Inbound Hash input change
   * @param e - The input event
   */
  const handlePostmarkHashChange = (e: ChangeEvent<HTMLInputElement>) => {
    const hash = e.target.value

    setFormData(prev => ({ 
      ...prev, 
      postmarkInboundEmail: `${hash}@inbound.postmarkapp.com`
    }))

    // Validate Postmark Inbound Email format
    const regex = /^[a-zA-Z0-9]+$/

    if (!regex.test(hash)) {
      setEmailError(
        `Hash must only contain letters and numbers`
      )
    } else {
      setEmailError('')
    }
  }

  /**
   * @dev Handle form submission
   * @param e - The form event
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    // Validate email before submitting
    const regex = /^[^@\s]+@inbound\.postmarkapp\.com$/
    if (!regex.test(formData.postmarkInboundEmail)) {
      setEmailError(
        `Email must be in the format ${ RANDOM_POSTMARK_INBOUND_HASH }@inbound.postmarkapp.com`
      )

      return
    }
    setLoading(true)
    const projectId = await putProject()
    if (projectId) {
      router.push(`/projects/${ projectId }`)
    }
  }


  /**
   * @dev Put a project via a PUT request to DynamoDB
   */
  async function putProject() {
    try {
      // Send to server API route
      const API_URL = `/api/project`
      const json = await fetchJson<{ project: PROJECT__DYNAMODB }>(API_URL, {
        method: 'PUT',
        body: JSON.stringify({
          ...formData,
          accountEmail: email,
        }),
      })

      const projectId = json.project.id
      return projectId
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ------------------------------- Rendering ---------------------------------
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <button
        onClick={ () => router.push('/') }
        className='flex items-center text-blue-600 hover:text-blue-800 mb-6'
      >
        <ArrowLeft className='h-4 w-4 mr-1' />
        { `Back to Projects` }
      </button>

      <div className='bg-white rounded-lg shadow-md overflow-hidden'>
        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4'>
          <h1 className='text-2xl font-bold text-white'>
            { `Create New Project` }
          </h1>
          <p className='text-blue-100 mt-1'>
            { `Set up a new data visualization project` }
          </p>
        </div>

        <form className='p-6' onSubmit={handleSubmit}>
          <div className='space-y-6'>
            <div>
              <label 
                htmlFor='name' 
                className='block text-sm font-medium text-gray-700'
              >
                { `Project Name` }
              </label>
              <input
                type='text'
                name='name'
                id='name'
                required
                value={ formData.name }
                onChange={ handleInputChange }
                placeholder='e.g., Sales Analytics'
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900'
              />
            </div>

            <div>
              <label 
                htmlFor='description' 
                className='block text-sm font-medium text-gray-700'
              >
                { `Description` }
              </label>
              <textarea
                name='description'
                id='description'
                rows={ 3 }
                value={ formData.description }
                onChange={ handleInputChange }
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900'
                placeholder='Describe the purpose of this project...'
              />
            </div>

            {/* Postmark Inbound Hash */}
            <div>
              <label 
                htmlFor='postmarkInboundHash' 
                className='block text-sm font-medium text-gray-700'
              >
                { `Postmark Inbound Hash` }
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type='text'
                  name='postmarkInboundHash'
                  id='postmarkInboundHash'
                  required
                  value={ formData.postmarkInboundEmail.split('@')[0] }
                  placeholder={ RANDOM_POSTMARK_INBOUND_HASH }
                  onChange={ handlePostmarkHashChange }
                  className={
                    `flex-1 min-w-0 block w-full rounded-l-md border-gray-300 ${
                      emailError ? 'shadow-[0_0.5px_5px_2px_rgba(239,68,68,0.75)]' : '' 
                    } focus:border-blue-200 focus:ring-blue-200 sm:text-sm text-gray-900`
                  }
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  { `@inbound.postmarkapp.com` }
                </span>
              </div>
              { emailError && (
                <p className='mt-1 text-sm text-red-600'>{emailError}</p>
              )}
              {/* Info box for Postmark Inbound Email Address */}
              <div className="mt-2 mb-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
                <strong>
                  { `How to find your Postmark Server's Inbound Hash and update its Inbound Webhook:` }
                </strong>
                <ol className="list-decimal ml-5 mt-1">
                  <li>
                    <strong>{ `Log in` }</strong>
                    { ` to your ` }
                    <a href="https://postmarkapp.com/" target="_blank" rel="noopener noreferrer" className="underline text-blue-700">
                      { `Postmark account` }
                    </a>
                    { `.` }
                  </li>
                  <li>
                    { `Go to ` }
                    <strong>{ `Servers` }</strong>
                    { ` → ` }
                    { `select your server → ` }
                    <strong>{ `Inbound` }</strong>
                    { ` tab.` }
                  </li>
                  <li>
                    { `Copy the ` }
                    <strong>{ `Inbound Hash` }</strong>
                    { ` of the Inbound Email Address (it looks like ` }
                    <code>
                      { `${ RANDOM_POSTMARK_INBOUND_HASH }` }
                    </code>
                    { `).` }
                  </li>
                  <li>
                    { `Set the Inbound ` }
                    <strong>{ `Webhook` }</strong>
                    { ` to: ` }
                    <code className="bg-gray-100 px-1 py-0.5 rounded">
                      { `https://mailmerge-studio.vercel.app/api/postmark/webhook/inbound` }
                    </code>
                  </li>
                </ol>
                <div className="mt-2">
                  { `For more details, see the ` }
                  <a href="https://postmarkapp.com/developer/user-guide/inbound/configure-an-inbound-server" target="_blank" rel="noopener noreferrer" className="underline text-blue-700">
                    { `Postmark Inbound Server Configuration Guide` }
                  </a>
                  { `.` }
                </div>
              </div>
            </div>

            {/* <div className='bg-gray-50 p-4 rounded-md'>
              <div className='flex items-center'>
                <Mail className='h-5 w-5 text-gray-400' />
                <span className='ml-2 text-sm text-gray-500'>
                  { `A unique email address will be generated for your project automatically` }
                </span>
              </div>
            </div> */}

            <div className='flex justify-end'>
              <button
                type='button'
                onClick={ () => router.push('/') }
                className='mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                { `Cancel` }
              </button>
              <button
                type='submit'
                disabled={ loading }
                className='px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                { loading ? 'Creating...' : 'Create Project' }
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default _