import { FC } from 'react'
import { useSearchParams } from 'next/navigation'


type TitleProps = {
  isSignUp: boolean
  isFirstStep: boolean
}


const Title: FC<TitleProps> = ({
  isSignUp,
  isFirstStep,
}) => {
  const searchParams = useSearchParams()
  const authType = searchParams.get('type')

  const subtitle = isFirstStep
    ? `${authType === 'login'
      ? `Sign in to your dashboard`
      : authType === 'signup'
        ? `Sign up for free`
        : ''
    }`
    : isSignUp
      ? `Sign up for free`
      : `Sign in to your dashboard`

  return (
    <>
      <div className='text-center'>
        <h1 className='text-2xl font-bold text-gray-900'>
          { `MailMerge Studio` }
        </h1>
        <h3 className='text-base text-gray-600 mt-1'>{ subtitle }</h3>
      </div>
    </>
  )
}

export default Title