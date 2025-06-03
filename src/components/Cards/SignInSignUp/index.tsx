'use client'

// Externals
import { FC, ReactNode, useState } from 'react'
// Locals
import ProgressBarLink from '@/components/Progress/ProgressBarLink'



type SignInSignUpCardProps = {
  description: string | ReactNode
  buttonText?: string
  title?: string | ReactNode
  href?: string
  options?: {
    hasForm?: boolean
    isSignUp?: boolean
    isFirstStep?: boolean
    formContent?: ReactNode
  }
}



const SignInSignUpCard: FC<SignInSignUpCardProps> = ({
  description,
  buttonText,
  title,
  href,
  options,
}) => {
  const [isLoading, setIsLoading] = useState(false)

  function handleOnClick(e: any) {
    setIsLoading(true)
  }


  return (
    <div className='flex justify-center items-center w-full'>
      <div className='bg-white rounded-lg shadow-md p-4 m-8 w-full max-w-md flex flex-col items-center'>
        { title && (
          <div className='mb-4 w-full'>
            { typeof title === 'string' ? (
              <h2 className='text-2xl font-bold text-center'>
                { title }
              </h2>
            ) : (
              title
            )}
          </div>
        )}
        <div className='w-full text-center'>
          <div className='flex flex-col items-center'>
            { description }
          </div>
        </div>
        <div className='flex flex-col items-center w-full mt-4'>
          <div className='w-full flex flex-col items-center'>
            { options?.formContent
                ? options?.formContent
                : buttonText && href && (
                  <div className='flex justify-center w-full my-3 relative'>
                    <ProgressBarLink href={href}>
                      <button
                        disabled={ isLoading }
                        onClick={ handleOnClick }
                        className='w-28 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50'
                      >
                        { buttonText }
                      </button>
                    </ProgressBarLink>
                  </div>
                )
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignInSignUpCard