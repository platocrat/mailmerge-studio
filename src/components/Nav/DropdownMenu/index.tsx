'use client'

// Externals
import Image from 'next/image'
import {
  FC,
  useRef,
  useState,
  Fragment,
  ReactNode,
  useContext,
  useLayoutEffect,
} from 'react'
import { usePathname } from 'next/navigation'
// Locals
import ProgressBarLink from '@/components/Progress/ProgressBarLink'
import { SessionContext } from '@/contexts/SessionContext'
import { SessionContextType } from '@/contexts/types'
import useClickOutside from '@/hooks/useClickOutside'
import { getConsoleMetadata, imgPaths } from '@/utils'
import styles from '@/components/Nav/DropdownMenu/Dropdown.module.css'
import { link } from 'fs'



type DropdownMenuProps = {
  links: NavLink[]
  children: ReactNode
}

export type NavLink = {
  label: string
  href: string
}


const GRAVATAR_DEFAULT_IMAGE_URL = `https://gravatar.com/avatar/0`


const DropdownMenu: FC<DropdownMenuProps> = ({
  links,
  children
}) => {
  // Contexts
  const { email } = useContext<SessionContextType>(SessionContext)
  // Hooks
  const pathname = usePathname()
  // Refs
  const dropdownRef = useRef<any>(null)
  const notificationRef = useRef(null)
  // States
  const [ 
    gravatarUrl, 
    setGravatarUrl
  ] = useState<string>(GRAVATAR_DEFAULT_IMAGE_URL)
  const [ 
    isLoadingGravatarUrl, 
    setIsLoadingGravatarUrl
  ] = useState<boolean>(false)
  const [ isVisible, setIsVisible ] = useState<boolean>(false)

  // --------------------- `OnClick` Functions Handlers ------------------------
  const onClick = (e: any) => {
    setIsVisible(false)
  }

  const toggleDropdown = () => {
    setIsVisible(!isVisible)
  }


  async function getGravatarUrl(
    userEmail: string
  ) {
    try {
      const apiEndpoint = `/api/auth/gravatar-url?email=${userEmail}`
      const response = await fetch(apiEndpoint, { 
        method: 'GET',
        cache: 'force-cache',
      })
      const json = await response.json()

      if (response.status === 400) throw new Error(json.error)
      if (response.status === 405) {
        throw new Error(json.error)
      } else if (response.status === 200) {
        const gravatarUrl_ = json.gravatarUrl
        setGravatarUrl(gravatarUrl_)
        setIsLoadingGravatarUrl(false)
      }
    } catch (error: any) {
      throw new Error(error)
    }
  }


  // -------------------------------- Hooks ------------------------------------
  useClickOutside(dropdownRef, () => setIsVisible(false))

  // ------------------------- `useLayoutEffect`s ------------------------------
  // Update the signed in user's Gravatar image
  useLayoutEffect(() => {
    if (email !== undefined || email !== null || email !== '') {
      const requests = [
        getGravatarUrl(email),
      ]

      Promise.all(requests).then(() => { })
    }
  }, [ email ])

  
  // Close dropdown menu when the page is rendered and the pathname changes
  useLayoutEffect(() => {
    setIsVisible(false)
  }, [ pathname ])




  return (
    <>
      <div
        className="relative inline-block"
        ref={ dropdownRef }
      >
        <div>
          {/* { isLoading && user ? ( */}
          { isLoadingGravatarUrl && !email ? (
            <>
              <Image
                width={ 40 }
                height={ 40 }
                alt='Round menu icon to open the navbar menu'
                className="rounded-full cursor-pointer shadow-md hover:scale-95 transition-transform"
                onClick={ toggleDropdown }
                src={
                  isVisible
                    ? `${imgPaths().png}ph_x-bold.png`
                    : `${imgPaths().png}ic_round-menu.png`
                }
              />
            </>
          ) : (
            <>
              <div
                className="flex h-10 w-10 items-center justify-center"
              >
                <img
                  className={ styles.img }
                  alt='Profile'
                  style={ {
                    position: 'relative',
                    top: '0px',
                    right: '0px',
                    boxShadow: isVisible
                      ? '0px 3px 5px 1.5px rgba(0, 75, 118, 0.5)'
                      : ''
                  } }
                  width={ 40 }
                  height={ 40 }
                  // src={ user && (user.picture ?? '') }
                  src={ gravatarUrl }
                  onClick={ toggleDropdown }
                />
              </div>
            </>
          )}
        </div>

        { isVisible && (
          <Fragment key={ `dropdown-menu` }>
            <div 
              className={ 
                `${styles['dropdown-content']} ${isVisible ? 'slideIn' : 'slideOut'}`
              }
            >
              { links.map((link: NavLink, i: number) => (
                <Fragment
                  key={ i }
                >
                  <ProgressBarLink
                    href={ link.href }
                    className={ styles['dropdown-link'] }
                  >
                    { i === 0 
                      ? (
                        <>
                        <div className={ styles.username }>
                          <div className='flex justify-center items-center'>
                            <p>
                              {/* { user?.name } */}
                              { email }
                            </p>
                          </div>
                          <div className={ styles['view-profile'] }>
                            <p>
                              { `View Projects` }
                            </p>
                          </div>
                        </div>
                        </>
                      ) 
                    : (
                      <div className={ styles['dropdown-link'] }>
                        <p className="text-center">
                          { link.label }
                        </p>
                      </div>
                      )
                    }
                  </ProgressBarLink>
                </Fragment>
              )) }
              { children }
            </div>
          </Fragment>
        ) }
      </div>
    </>
  )
}

export default DropdownMenu