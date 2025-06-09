'use client'

import { useState, useEffect, useLayoutEffect } from 'react'


function useWindowWidth () {
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setWindowWidth(window.innerWidth)
      }
  
      window.addEventListener('resize', handleResize)
  
      // Cleanup the event listener on component unmount
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth)
    }
  }, [])


  return windowWidth
}


export default useWindowWidth