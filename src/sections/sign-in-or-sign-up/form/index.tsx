// Externals
import HCaptcha from '@hcaptcha/react-hcaptcha'
import {
  Dispatch,
  FC,
  Fragment,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react'
// Locals
import Spinner from '@/components/Suspense/Spinner'
import { SessionContext } from '@/contexts/SessionContext'
import { SessionContextType } from '@/contexts/types'
import useWindowWidth from '@/hooks/useWindowWidth'
import { debounce, isValidEmail } from '@/utils'
import IncorrectInput from './incorrect-input'
import PasswordValidation from './password-validation'



export type FormProps = {
  buttonText: string
  state: {
    isSignUp: boolean
    isFirstStep: boolean
    emailNotFound: boolean
    // isUsernameTaken: boolean
    isEmailIncorrect: boolean
    isPasswordHashing: boolean
    // isUsernameIncorrect: boolean
    isPasswordIncorrect: boolean
    isWaitingForResponse: boolean
    password: { hash: string, salt: string }
  }
  set: {
    emailNotFound: Dispatch<SetStateAction<boolean>>
    // isUsernameTaken: Dispatch<SetStateAction<boolean>> 
    isEmailIncorrect: Dispatch<SetStateAction<boolean>>
    isPasswordHashing: Dispatch<SetStateAction<boolean>>
    isPasswordIncorrect: Dispatch<SetStateAction<boolean>>
    // isUsernameIncorrect: Dispatch<SetStateAction<boolean>>
    isWaitingForResponse: Dispatch<SetStateAction<boolean>>
    password: Dispatch<SetStateAction<{ hash: string,  salt: string }>>
  }
  handler: {
    handleLogIn: (e: any) => void
    handleSignUp: (e: any) => void
    handleEmailWithPasswordExists: (e: any) => void
  }
}



const debounceTimeout = 300




const Form: FC<FormProps> = ({
  set,
  state,
  handler,
  buttonText,
}) => {
  // Contexts
  const { 
    email, 
    // username,
    setEmail,
    // setUsername,
  } = useContext<SessionContextType>(SessionContext)
  // Hooks
  const windowWidth = useWindowWidth()
  // States
  const [
    isHCaptchaVerificationSuccessful, 
    setIsHCaptchaVerificationSuccessful
  ] = useState<boolean>(false)


  // --------------------------- Memoized constants ----------------------------
  const hCaptchaSize = useMemo((): 'compact' | 'normal' => {
    return windowWidth <= 800 ? 'compact' : 'normal'
  }, [windowWidth])

  const showSpinner = useMemo((): boolean => {
    return (state.isPasswordHashing || state.isWaitingForResponse) ? true : false
  }, [ state.isPasswordHashing, state.isWaitingForResponse ])


  const isButtonDisabled = useMemo((): boolean => {
    // Grouped for clarity
    const isLoading = state.isPasswordHashing || state.isWaitingForResponse
    const hasInputError = state.emailNotFound || state.isPasswordIncorrect || state.isEmailIncorrect
    const isEmailEmpty = email === ''
    const isPasswordEmpty = !state.isFirstStep && state.password.hash === ''
    const hCaptchaNotVerified = !state.isFirstStep && !isHCaptchaVerificationSuccessful
    // const isUsernameEmpty = !state.isFirstStep && username === '' // (if username is used)

    return (
      isLoading ||
      hasInputError ||
      (state.isFirstStep && isEmailEmpty) ||
      (!state.isFirstStep && isEmailEmpty) ||
      isPasswordEmpty ||
      hCaptchaNotVerified
      // || isUsernameEmpty // (if username is used)
    )
  }, [
    email,
    // username,
    state.isSignUp,
    state.isFirstStep,
    state.password.hash,
    state.emailNotFound,
    state.isEmailIncorrect,
    // state.isUsernameTaken,
    state.isPasswordHashing,
    state.isPasswordIncorrect,
    state.isWaitingForResponse,
    isHCaptchaVerificationSuccessful,
  ])
  
  // ------------------------------ Regular functions --------------------------
  const formInputType = (i: number): 'email' | 'password' | 'text' => {
    return i === 0 // this line is equivalent to `if (i === i) {`
      ? 'email'
      : i === 1 // this line is equivalent to `if (i === 2) {`
        ? 'password' 
        : 'text'
  }

  const boxShadow = (formInputs: any[], i: number): '0px 0px 6px 1px red' | '' => {
    const _ = '0px 0px 6px 1px red'
    if (state.isEmailIncorrect && i === 0) return _
    // if (state.isUsernameTaken && i === 1) return _
    // if (state.isUsernameIncorrect && i === 1) return _
    if (state.isPasswordIncorrect && i === 2) return _
    return ''
  }


  const borderColor = (formInputs: any[], i: number): 'red' | '' => {
    const _ = 'red'
    if (state.isEmailIncorrect && i === 0) return _
    // if (state.isUsernameTaken && i === 1) return _
    // if (state.isUsernameIncorrect && i === 1) return _
    if (state.isPasswordIncorrect && i === 2) return _
    return ''
  }


  // ------------------------- Form handler functions --------------------------
  const onEmailChange = (e: any): void => {
    set.emailNotFound(false)
    set.isEmailIncorrect(false)
    
    const _ = e.target.value
    const isValid = isValidEmail(_)
    
    if (isValid) {
      set.isEmailIncorrect(false)
      setEmail(_)
    } else {
      set.isEmailIncorrect(true)
    }
  }


  const debouncedOnEmailChange = useMemo(
    (): ((...args: any) => void) => debounce(onEmailChange, debounceTimeout),
    [email]
  )


  // const onUsernameChange = (e: any): void => {
  //   set.isUsernameTaken(false)
  //   set.isUsernameIncorrect(false)
    
  //   const _ = e.target.value
  //   const isValid = isValidUsername(_)

  //   if (isValid) {
  //     set.isUsernameIncorrect(false)
  //     setUsername(_)
  //   } else {
  //     set.isUsernameIncorrect(true)
  //   }
  // }


  // const debouncedOnUsernameChange = useMemo(
  //   (): ((...args: any) => void) => debounce(onUsernameChange, debounceTimeout),
  //   [username]
  // )


  const onPasswordChange = (e: any): void => {
    set.isPasswordHashing(false)
    set.isPasswordIncorrect(false)

    let _ = e.target.value

    if (_ !== '') {
      if (state.isSignUp) {
        // 1. Validate the inputted password
        const isValid = isValidPassword(_)

        if (isValid) {
          set.isPasswordIncorrect(false)
        } else {
          set.isPasswordHashing(false)
          set.isPasswordIncorrect(true)
          return
        }

        set.isPasswordHashing(true)
        // 2. Store encrypted password in database
        hashPassword(_).then((password: { hash: string, salt: string }): void => {
          set.password(password)
          set.isPasswordHashing(false)
        })
      } else {
        // 3. Use the raw password to check against the hashedPassword that is 
        // stored in the database
        set.password(_)
        set.isPasswordHashing(false)
      }
    }
  }


  // function isValidUsername(username: string): boolean {
  //   // Implement username validation logic
  //   const conditional = username !== '' && (
  //     username === undefined ||
  //     username === null
  //   )

  //   if (conditional) {
  //     return false
  //   } else {
  //     return true
  //   }
  // }


  function isValidPassword(password: string) {
    /**
     * @dev Checking `state.isSignUp` is required to silence the error that says
     * that `ruleElement.querySelector` is undefined.
     */
    if (state.isSignUp) {
      const _document: any = document

      const green = 'rgb(52, 173, 52)'

      const updateRuleStatus = (ruleId: string, isValid: boolean): void => {
        const ruleElement = _document.getElementById(ruleId)
        const symbolElement = ruleElement.querySelector('.symbol')

        ruleElement.style.color = isValid ? green : 'red'
        symbolElement.textContent = isValid ? '✔️' : '❌'
      }

      // Check conditions
      const hasSymbol = /[^a-zA-Z0-9]/.test(password)
      const hasNumber = /[0-9]/.test(password)
      const hasCapitalLetter = /[A-Z]/.test(password)
      const hasLowercaseLetter = /[a-z]/.test(password)
      const isLengthValid = password.length >= 13

      // Update UI based on conditions
      updateRuleStatus('ruleSymbol', hasSymbol)
      updateRuleStatus('ruleNumber', hasNumber)
      updateRuleStatus('ruleCapital', hasCapitalLetter)
      updateRuleStatus('ruleLowercase', hasLowercaseLetter)
      updateRuleStatus('ruleLength', isLengthValid)

      // Determine overall validity
      return (
        hasNumber &&
        hasSymbol &&
        hasCapitalLetter &&
        hasLowercaseLetter &&
        isLengthValid
      )
    }
  }


  // -------------------------- Async functions --------------------------------
  async function hashPassword(password: string) {
    try {
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const { hash, salt } = await response.json()
      return { hash, salt }
    } catch (error: any) {
      set.isPasswordHashing(false)
      throw new Error(error)
    }
  }


  async function handleSubmit(e: any) {
    e.preventDefault()

    if (state.isFirstStep) {
      return handler.handleEmailWithPasswordExists(e)
    } else if (state.isSignUp) {
      return handler.handleSignUp(e)
    } else {
      return handler.handleLogIn(e)
    }
  }


  async function handleVerificationSuccess(token: string, eKey: string) {
    set.isWaitingForResponse(true)

    const METHOD = 'POST'

    const response = await fetch('/api/auth/hCaptcha', {
      method: METHOD,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        email,
        token
      })
    })

    const json = await response.json()

    set.isWaitingForResponse(false)

    if (typeof json.success === 'boolean') {
      setIsHCaptchaVerificationSuccessful(json.success)
    } else {
      throw new Error(`${ json.error }`)
    }
  }


  let formInputs: any[] = [
    {
      name: 'email',
      placeholder: `Enter your email`,
      onChange: onEmailChange
    },
    // {
    //   name: 'username',
    //   placeholder: `Username`,
    //   onChange: onUsernameChange
    // },
    {
      name: 'password',
      placeholder: `Password`,
      onChange: onPasswordChange
    },
  ]

  formInputs = state.isFirstStep ? [formInputs[0]] : formInputs



  return (
    <>
      <form
        onSubmit={ (e: any): Promise<void> => handleSubmit(e) }
        className="flex flex-col items-center justify-center mb-4"
      >
        <div
          className="flex flex-col items-center justify-center gap-1 w-full max-w-[245px]"
        >
          <div className="block w-full flex-col items-center justify-center">
            { formInputs.map((fi, i: number) => (
              <Fragment key={ `form-inputs-${i}` }>
                { state.isSignUp && i === 0 && <PasswordValidation /> }
                <div className="mb-2 flex justify-center">
                  <input
                    required
                    id={ fi.name }
                    name={ fi.name }
                    maxLength={ 28 }
                    type={ formInputType(i) }
                    placeholder={ fi.placeholder }
                    onChange={ (e: any) => fi.onChange(e) }
                    className={ [
                      'block',
                      'mx-auto',
                      'w-72',
                      'py-1.5',
                      'px-3',
                      'border',
                      'rounded-2xl',
                      'text-[clamp(12px,2.5vw,13.5px)]',
                      'placeholder-gray-500',
                      'text-gray-900',
                      'focus:outline-none',
                      'focus:ring-0.75',
                      'focus:ring-blue-200',
                      'focus:border-blue-200',
                      boxShadow(formInputs, i) ? 'shadow-[0_0_6px_1px_red]' : '',
                      borderColor(formInputs, i) ? 'border-red-500' : 'border-gray-300',
                    ].join(' ') }
                  />
                </div>

                <IncorrectInput 
                  i={ i } 
                  state={{
                    isSignUp: state.isSignUp,
                    emailNotFound: state.emailNotFound,
                    // isUsernameTaken: state.isUsernameTaken,
                    isEmailIncorrect: state.isEmailIncorrect,
                    // isUsernameIncorrect: state.isUsernameIncorrect,
                    isPasswordIncorrect: state.isPasswordIncorrect,
                  }} 
                />
              </Fragment>
            ))}
          </div>

          { !state.isFirstStep && (
            <>
              <HCaptcha
                size={ hCaptchaSize }
                sitekey={ process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY }
                onVerify={ handleVerificationSuccess }
              />
            </>
          )}

          <div className="block w-full flex justify-center">
            <button
              className={[
                isButtonDisabled
                  ? ''
                  : 'bg-blue-600 hover:bg-blue-700 transition text-white font-semibold',
                'block',
                'mx-auto',
                'w-72',
                'rounded-2xl',
                'h-[clamp(29px,6vw,32px)]',
                'text-[clamp(12px,2.5vw,14px)]',
                'flex',
                'items-center',
                'justify-center',
                isButtonDisabled ? 'cursor-not-allowed bg-gray-300 text-gray-200' : 'cursor-pointer',
                isButtonDisabled ? 'shadow-[inset_0px_1px_6px_rgba(0,43,68,0.412)]' : '',
              ].join(' ')}
              disabled={ isButtonDisabled ? true : false }
              onClick={ (e: any) => handleSubmit(e) }
            >
              { showSpinner 
                ? (
                  <Spinner 
                    width={ 'clamp(18px, 4vw, 22px)' }
                    height={ 'clamp(18px, 4vw, 22px)' }
                  />
                )
                : buttonText 
              }
            </button>
          </div>
        </div>
      </form>
    </>
  )
}

export default Form