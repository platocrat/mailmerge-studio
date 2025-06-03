'use client'

// Externals
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CSSProperties, FC, ReactNode, startTransition } from 'react'
// Locals
import { useProgressBar } from '@/components/Progress/ProgressBar'


/**
 * @dev ProgressBarLink component
 * @param {Object} param0 - The props object
 * @param {string} param0.href - The href of the link
 * @param {ReactNode} param0.children - The children components
 * @param {CSSProperties} param0.style - The style of the link
 * @param {string} param0.className - The class name of the link
 * @returns {ReactNode} The ProgressBarLink component
 */
type ProgressBarLinkProps = {
  href: string
  children: ReactNode
  style?: CSSProperties
  className?: string
}



const ProgressBarLink: FC<ProgressBarLinkProps> = ({
  href,
  style,
  children,
  className,
}) => {
  let router = useRouter()
  let { start, done } = useProgressBar()


  return (
    <Link
      href={ href }
      style={ style }
      className={ className }
      onClick={ (e) => {
        e.preventDefault()
        start()

        startTransition(() => {
          done()
          router.push(href)
        })
      } }
    >
      { children }
    </Link>
  )
}


export default ProgressBarLink