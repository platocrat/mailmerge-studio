'use client'

// Externals
import { useRouter } from 'next/navigation'
import { Mail, ArrowLeft } from 'lucide-react'
import { collection, addDoc } from 'firebase/firestore'
import React, { ChangeEvent, FormEvent, useState } from 'react'
// Locals
import { getFirestoreInstance } from '@/services/firebase'


const _ = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    setLoading(true)

    try {
      const db = getFirestoreInstance()

      // Generate a unique project ID
      const projectId = Math.random().toString(36).substring(2, 15)
      // Generate unique email address for the project
      const emailAddress = `demo+${projectId}@mmstudio.inbound.postmarkapp.com`

      const projectData = {
        ...formData,
        id: projectId,
        emailAddress,
        createdAt: new Date(),
        status: 'inactive',
        emailCount: 0,
      }

      const reference = collection(db, 'projects')
      const docRef = await addDoc(reference, projectData)

      router.push(`/projects/${projectId}`)
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project. Please try again.')
    } finally {
      setLoading(false)
    }
  }



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
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
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
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
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