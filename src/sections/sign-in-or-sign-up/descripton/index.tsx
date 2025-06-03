import { FC } from 'react'
import { Mail, BarChart2, Users } from 'lucide-react'


type DescriptionProps = {
  isSignUp: boolean
  isFirstStep: boolean
}


const Description: FC<DescriptionProps> = ({
  isSignUp,
  isFirstStep,
}) => {
  const features = [
    {
      icon: <Mail className='h-5 w-5 text-blue-600' />,
      text: 'Transform your emails into dashboards',
    },
    {
      icon: <BarChart2 className='h-5 w-5 text-indigo-600' />,
      text: 'Automated data analysis & visualization',
    },
    {
      icon: <Users className='h-5 w-5 text-purple-600' />,
      text: 'Share insights with your team',
    },
  ]

  return (
    <>
      <div>
        { isFirstStep ? (
          <div className='px-4'>
            { features.map(({ icon, text }, i) => (
              <div key={ i } className='flex items-center gap-2'>
                { icon }
                <span className='text-sm text-gray-700'>{ text }</span>
              </div>
            )) }
          </div>
        ) : (
          <p>
            { isSignUp ? 'Welcome to MailMerge Studio!' : 'Welcome back!' }
          </p>
        ) }
      </div>
    </>
  )
}

export default Description