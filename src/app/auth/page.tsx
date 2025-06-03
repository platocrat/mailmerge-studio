// Externals
import { Suspense } from 'react'
// Locals
import SignInOrSignUp from '@/sections/sign-in-or-sign-up'
import Spinner from '@/components/Suspense/Spinner'


export default function AuthenticatePage() {
  return (
    <>
      <main
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
          width: '100%',
        }}
      >
        <Suspense 
          fallback={
            <Spinner 
              width={ 'clamp(36px, 4vw, 48px)' }
              height={ 'clamp(36px, 4vw, 48px)' }
            />
          }
        >
          <SignInOrSignUp />
        </Suspense>
      </main>
    </>
  )
}