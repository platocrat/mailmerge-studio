'use client'

// Externals
import { createContext } from 'react'
// Locals
import { SessionContextType } from './types'



const INIT_SESSION_CONTEXT: SessionContextType = {
  email: '',
  // username: string
  isLoggingOut: false,
  hasLoggedOut: false,
  isAuthenticated: false,
  isFetchingSession: false,
  setEmail: () => {},
  // setUsername: Dispatch<SetStateAction<string>>
  setIsLoggingOut: () => {},
  setHasLoggedOut: () => {},
  setIsAuthenticated: () => {},
}



export const SessionContext = createContext<SessionContextType>(
  INIT_SESSION_CONTEXT
)