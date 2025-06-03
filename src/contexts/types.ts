import { Dispatch, SetStateAction } from 'react'


export type SessionContextType = {
  email: string
  isLoggingOut: boolean
  hasLoggedOut: boolean
  isAuthenticated: boolean
  isFetchingSession: boolean
  setEmail: Dispatch<SetStateAction<string>>
  setIsLoggingOut: Dispatch<SetStateAction<boolean>>
  setHasLoggedOut: Dispatch<SetStateAction<boolean>>
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>
}
