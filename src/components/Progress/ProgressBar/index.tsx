'use client'

// Externals
import { AnimatePresence, motion, useMotionTemplate } from 'framer-motion'
import { ReactNode, createContext, useContext, useLayoutEffect } from 'react'
// Locals
import useProgress from '@/hooks/useProgress'
import styles from '@/components/Progress/ProgressBar/ProgressBar.module.css'



/**
 * @dev ProgressBarContext
 * @returns {ReactNode} The ProgressBarContext component
 */
export const ProgressBarContext = createContext<ReturnType<
  typeof useProgress
> | null>(null)




/**
 * @dev useProgressBar
 * @returns {ReactNode} The useProgressBar component
 */
export function useProgressBar() {
  let progress = useContext(ProgressBarContext)

  if (progress === null) {
    throw new Error('Need to be inside provider')
  }

  return progress
}



/**
 * @dev ProgressBar component
 * @param {ReactNode} children - The children components
 * @returns {ReactNode} The ProgressBar component
 */
const ProgressBar = ({ children }: { children: ReactNode }) => {
  let progress = useProgress()
  let width = useMotionTemplate`${progress.value}%`


  return (
    <ProgressBarContext.Provider value={ progress }>
      <AnimatePresence onExitComplete={ progress.reset }>
        { progress.state !== 'complete' && (
          <motion.div
            style={{ 
              width,
              zIndex: '1000',
              height: '3.75px',
              position: 'fixed',
              filter: 'drop-shadow(0px 1.5px 3px rgba(61, 142, 255, 0.6))',
              backgroundColor: 'rgb(61, 142, 255, 1)',
            }}
            exit={{ opacity: 0 }}
          />
        ) }
      </AnimatePresence>

      { children }
    </ProgressBarContext.Provider>
  )
}


export default ProgressBar