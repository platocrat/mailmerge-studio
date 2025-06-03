// src/components/Nav/Header/index.tsx
'use client'

// Externals
import { useContext, useState } from 'react'
import { Mail, Github } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
// Locals
import DropdownMenu, { NavLink } from '@/components/Nav/DropdownMenu'
import ProgressBarLink from '@/components/Progress/ProgressBarLink'
import { SessionContext } from '@/contexts/SessionContext'
import { SessionContextType } from '@/contexts/types'
import { deleteAllCookies } from '@/utils/misc'


const links: NavLink[] = [
  { label: 'Projects', href: '/projects' },
  // { label: 'Dashboard', href: '/dashboards' }
]


/**
 * @dev Header component
 * @returns A React component
 */
const Header = () => {
  // ------------------------------ Contexts ------------------------------------
  const {
    email,
    setHasLoggedOut,
    setIsLoggingOut,
    isAuthenticated,
    setIsAuthenticated,
  } = useContext<SessionContextType>(SessionContext)
  // ------------------------------- Hooks -------------------------------------
  const router = useRouter()
  const pathname = usePathname()
  
  // ----------------------------- Async functions -----------------------------
  // Handle logout logic
  async function handleSignOut(): Promise<void> {
    setIsLoggingOut(true)

    try {
      const response = await fetch('/api/auth/sign-out', {
        method: 'POST',
        body: JSON.stringify({
          email,
        })
      })

      if (response.status === 200) {
        deleteAllCookies() // delete cookies again
        // Remove authentication from user
        setIsAuthenticated(false)

        pathname === '/' ? router.refresh() : router.push('/')

        setHasLoggedOut(true)
        setIsLoggingOut(false)
      } else {
        setIsLoggingOut(false)
        // Handle failed logout attempt (e.g., display a message)
        throw new Error('Logout failed')
      }
    } catch (error: any) {
      setIsLoggingOut(false)
      throw new Error('An error occurred during logout:', error)
    }
  }

  return (
    <header className='bg-white shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center py-4'>
          <div className='flex items-center'>
            <ProgressBarLink href='/' className='flex items-center'>
              <Mail className='h-8 w-8 text-blue-600' />
              <span className='ml-2 text-xl font-bold text-gray-900'>
                { `MailMerge Studio` }
              </span>
            </ProgressBarLink>
          </div>
          <nav className='flex space-x-6 items-center'>
            <ProgressBarLink 
              href='/' 
              className='text-gray-700 hover:text-blue-600 font-medium'
            >
              { `Home` }
            </ProgressBarLink>
            <ProgressBarLink 
              href='/demo' 
              className='text-gray-700 hover:text-blue-600 font-medium'
            >
              { `Demo` }
            </ProgressBarLink>
            <a
              href='https://github.com/platocrat/mailmerge-studio'
              target='_blank'
              rel='noopener noreferrer'
              className='text-gray-700 hover:text-blue-600 font-medium flex items-center'
            >
              <Github className='h-4 w-4 mr-1' />
              { `GitHub` }
            </a>
            { isAuthenticated ? (
              <DropdownMenu links={ links }>
                <a
                  onClick={ handleSignOut }
                  className='text-gray-700 hover:text-blue-600 font-medium flex items-center justify-center py-2'
                  >
                  { `Sign out` }
                </a>
              </DropdownMenu>
            ) : (
              <div className='flex gap-2 items-center'>
                <ProgressBarLink
                  href='/auth'
                  className='px-4 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 font-medium transition'
                >
                  { `Sign In` }
                </ProgressBarLink>
                <ProgressBarLink
                  href='/auth'
                  className='px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition'
                >
                  { `Sign Up` }
                </ProgressBarLink>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header 