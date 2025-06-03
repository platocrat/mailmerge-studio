// Locals
import SignInOrSignUp from '@/sections/sign-in-or-sign-up'


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
        <SignInOrSignUp />
      </main>
    </>
  )
}