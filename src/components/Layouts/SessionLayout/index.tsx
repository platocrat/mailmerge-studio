'use client'

// Externals
import { usePathname, useRouter } from 'next/navigation'
import {
  FC,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState
} from 'react'
// Locals
import { SessionContext } from '@/contexts/SessionContext'

// --------------------------------- Types -------------------------------------
type SessionLayoutProps = {
  children: ReactNode
}

export type SessionType = {
  email: string
  // username: string
}

export type SessionResponse = {
  session?: SessionType
  error?: Error
}

// -------------------------- React function component -------------------------
const SessionLayout: FC<SessionLayoutProps> = ({
  children,
}) => {
  // Hooks
  const router = useRouter()
  const pathname = usePathname()
  // --------------------------------- States ----------------------------------
  const [email, setEmail] = useState<string>('')
  const [hasLoggedOut, setHasLoggedOut] = useState<boolean>(false)
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isFetchingSession, setIsFetchingSession] = useState<boolean>(false)


  // --------------------------- Async functions -------------------------------
  async function getSession(): Promise<SessionResponse> {
    try {
      // First get the user's basic information from their JWT cookie
      const response = await fetch('/api/auth/user', {
        method: 'GET',
      })
      const json = await response.json()

      if ([400, 401].includes(response.status))
        return { session: undefined, error: json.error }

      if (response.status === 500 && json.error.name === 'TokenExpiredError')
        return { session: undefined, error: json.error }

      const user_ = json.user as SessionType
      const session = { ...user_ }
      return { session, error: undefined }
    } catch (error: any) {
      return { session: undefined, error, }
    }
  }

  /**
   * @dev Protects any page by restricting access to users that have already 
   * authenticated and hold a session cookie.
   */
  async function pageProtection(): Promise<void> {
    setHasLoggedOut(false)

    const { session, error } = await getSession()

    if (error) {
      if (pathname !== undefined) {
        if (pathname === '/') {
          setIsAuthenticated(false)
          setIsFetchingSession(false)
        } else {
          setIsFetchingSession(false)
          return
        }
      }
    } else {
      // Update state of the user's session
      setEmail((session as SessionType).email)
      // setUsername((session as SessionType).username)
      // Show the dashboard
      setIsAuthenticated(true)

      pathname === '/auth'
        ? router.push('/')
        : setIsFetchingSession(false)

      return
    }
  }

  // ------------------------------ `useEffect`s -------------------------------
  useEffect(() => {
    if (hasLoggedOut && typeof window !== 'undefined') {
      window.location.reload()
    }
  }, [ hasLoggedOut ])

  
  useLayoutEffect(() => {
    if (pathname?.length > 0) {
      const requests = [
        pageProtection(),
      ]

      Promise.all(requests).then((response: any): void => { })
    }
  }, [pathname])

  // -------------------------- Memoizing Context Value ------------------------
  const contextValue = useMemo(() => ({
    email,
    isLoggingOut,
    hasLoggedOut,
    isAuthenticated,
    isFetchingSession,
    setEmail,
    setHasLoggedOut,
    setIsLoggingOut,
    setIsAuthenticated,
  }), [
    email,
    isLoggingOut,
    hasLoggedOut,
    isAuthenticated,
    isFetchingSession,
    setEmail,
    setHasLoggedOut,
    setIsLoggingOut,
    setIsAuthenticated,
  ])

  // ----------------------------- Return JSX ----------------------------------
  return (
    <SessionContext.Provider value={ contextValue }>
      { children }
    </SessionContext.Provider>
  )
}

export default SessionLayout
