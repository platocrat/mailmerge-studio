'use client'

// Externals
import {
  FC,
  useContext,
  useLayoutEffect,
  useState,
} from 'react'
import { Mail } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
// Locals
import Form from './form'
import Title from './title'
import Description from './description'
import SignInSignUpCard from '@/components/Cards/SignInSignUp'
import { SessionContextType } from '@/contexts/types'
import { SessionContext } from '@/contexts/SessionContext'
import { deleteAllCookies, fetchJson } from '@/utils'


type SignInOrSignUpProps = {
  
}


const SignInOrSignUp: FC<SignInOrSignUpProps> = ({}) => {
  // Contexts
  const {
    email,
    // username,
    setEmail,
    // setUsername,
    isAuthenticated,
    setIsAuthenticated,
  } = useContext<SessionContextType>(SessionContext)
  // --------------------------------- Hooks -----------------------------------
  const router = useRouter()
  const pathname = usePathname()
  // -------------------------------- States -----------------------------------
  // Booleans
  const [
    isPasswordIncorrect,
    setIsPasswordIncorrect
  ] = useState<boolean>(false)
  const [ 
    emailNotFound, 
    setEmailNotFound
  ] = useState<boolean>(false)
  const [
    isUsernameIncorrect,
    setIsUsernameIncorrect
  ] = useState<boolean>(false)
  const [
    isWaitingForResponse,
    setIsWaitingForResponse
  ] = useState<boolean>(false)
  const [isSignUp, setIsSignUp] = useState<boolean>(false)
  const [isFirstStep, setIsFirstStep] = useState<boolean>(true)
  const [isUsernameTaken, setIsUsernameTaken] = useState<boolean>(false)
  const [isEmailIncorrect, setIsEmailIncorrect] = useState<boolean>(false)
  const [isPasswordHashing, setIsPasswordHashing] = useState<boolean>(false)
  // Custom
  const [
    password,
    setPassword
  ] = useState<{ hash: string, salt: string }>({ hash: '', salt: '' })


  // -------------------------------- Constants --------------------------------
  const buttonText = isFirstStep
    ? `Next`
    : `${ isSignUp ? 'Sign up' : 'Log in' }`

  // ---------------------------- Async functions ------------------------------
  async function handleLogIn(e: any) {
    e.preventDefault()

    setIsEmailIncorrect(false)
    // setIsUsernameIncorrect(false)
    setIsPasswordIncorrect(false)
    setIsWaitingForResponse(true)

    // Delete all cookies so that we replace the cookie store with a fresh 
    // cookie
    deleteAllCookies()

    try {
      const json = await fetchJson('/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({
          email,
          // username,
          password,
        }),
      })

      const { message, isGlobalAdmin, isParticipant } = json as any

      switch (message) {
          // case 'Verified email, username, and password':
          case 'Verified email and password':
            setIsEmailIncorrect(false)
            // setIsUsernameIncorrect(false)
            setIsPasswordIncorrect(false)

            // Authenticate user
            setIsAuthenticated(true)

            router.push('/')
            break

          case 'Incorrect password':
            setIsWaitingForResponse(false)
            setIsEmailIncorrect(false)
            // setIsUsernameIncorrect(false)
            setIsPasswordIncorrect(true)
            break

          // case 'Incorrect username':
          //   setIsWaitingForResponse(false)
          //   setIsEmailIncorrect(false)
          //   setIsUsernameIncorrect(true)
          //   setIsPasswordIncorrect(false)
          //   break

          // case 'Incorrect username and password':
          case 'Incorrect email and password':
            setIsWaitingForResponse(false)
            setIsEmailIncorrect(false)
            // setIsUsernameIncorrect(true)
            setIsPasswordIncorrect(true)
            break

          case 'Email not found':
            setIsWaitingForResponse(false)
            setIsEmailIncorrect(true)
            // setIsUsernameIncorrect(false)
            setIsPasswordIncorrect(false)
            break
        }
      } catch (error: any) {
        setIsWaitingForResponse(false)
        setIsEmailIncorrect(false)
        // setIsUsernameIncorrect(false)
        setIsPasswordIncorrect(false)

      /**
       * @todo Handle error UI here
      */
      throw new Error(error)
    }
  }


  async function handleSignUp(e: any) {
    e.preventDefault()

    // setIsUsernameTaken(false)
    setIsWaitingForResponse(true)

    // Delete all cookies so that we replace the cookie store with a fresh 
    // cookie
    deleteAllCookies()

    try {
      const json = await fetchJson('/api/auth/sign-up', {
        method: 'POST',
        body: JSON.stringify({
          email,
          // username,
          password,
        }),
      })

      const { message } = json as any

      switch (message) {
        // case 'Username exists':
        //   setIsUsernameTaken(true)
        //   setIsWaitingForResponse(false)
        //   break

        case 'User has successfully signed up':
          // Authenticate user
          setIsAuthenticated(true)

          router.push('/')
          break
      }
    } catch (error: any) {
      setIsWaitingForResponse(false)
      /**
       * @todo Handle error UI here
      */
      throw new Error(error)
    }
  }


  async function handleEmailWithPasswordExists(e: any) {
    e.preventDefault()

    setIsWaitingForResponse(true)

    try {
      const API_URL = `/api/auth/email?email=${email}`
      const json = await fetchJson(API_URL, {
        method: 'GET',
        cache: 'force-cache',
      })

      if ((json as any).error) {
        const error = (json as any).error

        switch (error) {
          case 'ExpiredTokenException: AWS access keys have expired.':
            setIsWaitingForResponse(false)
            break

          case 'CredentialsProviderError: Could not load credentials from any providers.':
            setEmailNotFound(true)
            setIsWaitingForResponse(false)
            break
          default:
            setIsWaitingForResponse(false)
            throw new Error(error)
        }
      } else {
        const message = (json as any).message

        switch (message) {
          case 'Email with password exists':
            setIsWaitingForResponse(false)
            setIsFirstStep(false)
            setIsSignUp(false)
            break

          case 'Email with password does not exist':
            setIsWaitingForResponse(false)
            setIsFirstStep(false)
            setIsSignUp(true)
            break
        }
      }
    } catch (error: any) {
      setIsWaitingForResponse(false)
      /**
       * @todo Handle error UI here
       */
      throw new Error(error)
    }
  }

  // --------------------- Props to pass to `FormContent` ----------------------
  const state = {
    password: password,
    isSignUp: isSignUp,
    isFirstStep: isFirstStep,
    emailNotFound: emailNotFound,
    // isUsernameTaken: isUsernameTaken,
    isEmailIncorrect: isEmailIncorrect,
    isPasswordHashing: isPasswordHashing,
    isPasswordIncorrect: isPasswordIncorrect,
    // isUsernameIncorrect: isUsernameIncorrect,
    isWaitingForResponse: isWaitingForResponse,
  }
  const set = {
    password: setPassword,
    emailNotFound: setEmailNotFound,
    // isUsernameTaken: setIsUsernameTaken,
    isEmailIncorrect: setIsEmailIncorrect,
    isPasswordHashing: setIsPasswordHashing,
    isPasswordIncorrect: setIsPasswordIncorrect,
    // isUsernameIncorrect: setIsUsernameIncorrect,
    isWaitingForResponse: setIsWaitingForResponse,
  }
  const handler = { handleLogIn, handleSignUp, handleEmailWithPasswordExists }



  useLayoutEffect(() => {
    if (!isAuthenticated) {
      setEmail('')
      setPassword({ hash: '', salt: '' })
    }
  }, [ isAuthenticated ])





  return (
    <>
      <div 
        className="flex justify-center items-center min-h-[70vh] w-full"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
          width: '100%',
        }}
      >
        <SignInSignUpCard
          title={
            <div className="flex flex-col items-center mb-2">
              <Mail className="h-16 w-16 text-blue-600 mb-1" />
              <Title isSignUp={ isSignUp } isFirstStep={ isFirstStep } />
            </div>
          }
          description={
            <Description isSignUp={ isSignUp } isFirstStep={ isFirstStep } />
          }
          options={{
            hasForm: true,
            isSignUp: isSignUp,
            isFirstStep: isFirstStep,
            formContent: (
              <>
                <Form
                  set={ set }
                  state={ state }
                  handler={ handler }
                  buttonText={ buttonText }
                />
              </>
            )
          }}
        />
      </div>
    </>
  )
}

export default SignInOrSignUp