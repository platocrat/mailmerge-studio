'use client'

// Externals
import { useRouter } from 'next/navigation'
import { Mail, ArrowLeft } from 'lucide-react'
import React, { ChangeEvent, FormEvent, useState } from 'react'
import { PROJECT__DYNAMODB } from '@/types'


// ------------------------------- Component -----------------------------------
const _ = () => {
  // ------------------------------- Hooks -------------------------------------
  const router = useRouter()
  // ------------------------------- States ------------------------------------
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
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
  }

  /**
   * @dev Handle form submission
   * @param e - The form event
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await putProject()
  }


  /**
   * @dev Put a project via a PUT request to DynamoDB
   */
  async function putProject() {
    const API_URL = `/api/project`

    try {
      // Send to server API route
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.status !== 200) {
        throw new Error('Failed to create project')
      }

      const json = await response.json()

      const project: PROJECT__DYNAMODB = json.project as PROJECT__DYNAMODB
      const projectId = project.id

      router.push(`/projects/${ projectId }`)
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

        <form onSubmit={ handleSubmit } className='p-6'>
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

            <div className='bg-gray-50 p-4 rounded-md'>
              <div className='flex items-center'>
                <Mail className='h-5 w-5 text-gray-400' />
                <span className='ml-2 text-sm text-gray-500'>
                  { `A unique email address will be generated for your project automatically` }
                </span>
              </div>
            </div>

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