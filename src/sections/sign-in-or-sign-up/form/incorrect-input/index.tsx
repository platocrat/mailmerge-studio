// Externals
import { FC, useMemo } from 'react'
// Locals
import InputError from '@/components/Errors/InputError'


type IncorrectInputProps = {
  i: number
  state: {
    isSignUp: boolean
    emailNotFound: boolean
    // isUsernameTaken: boolean
    isEmailIncorrect: boolean
    // isUsernameIncorrect: boolean
    isPasswordIncorrect: boolean
  }
}


const IncorrectInput: FC<IncorrectInputProps> = ({ i, state }) => {
  const isEmailIncorrect = state.isEmailIncorrect && i === 0 
  // const isUsernameCorrect = state.isUsernameIncorrect && i === 1
  // const isUsernameTaken = state.isUsernameTaken && i === 1
  const isPasswordIncorrect = !state.isSignUp 
    && state.isPasswordIncorrect 
    && i === 1


  const errorText = useMemo((): string => {
    let _ = ''

    if (isEmailIncorrect) _ = ``
    if (state.emailNotFound) _ = `Email not found`
    // if (isUsernameCorrect) _ = `Incorrect username`
    // if (isUsernameTaken) _ = `Username is taken`
    if (isPasswordIncorrect) _ = `Incorrect password`

    return _
  }, [ isEmailIncorrect, isPasswordIncorrect, state.emailNotFound ])



  return (
    <>
      <InputError conditional={ isEmailIncorrect } errorText={ errorText } />
      <InputError conditional={ state.emailNotFound } errorText={ errorText } />
      {/* <InputError conditional={ isUsernameCorrect } errorText={ errorText } /> */}
      {/* <InputError conditional={ isUsernameTaken } errorText={ errorText } /> */}
      <InputError conditional={ isPasswordIncorrect } errorText={ errorText } />
    </>
  )
}


export default IncorrectInput