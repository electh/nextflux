import { useEffect, useState } from "react"

const MOBILE_BREAKPOINT = 1024
const MEDIUM_BREAKPOINT = 768
const SMALL_BREAKPOINT = 640

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= SMALL_BREAKPOINT || 
    (window.innerWidth >= MEDIUM_BREAKPOINT && window.innerWidth <= MOBILE_BREAKPOINT)
  )
  const [isMedium, setIsMedium] = useState(window.innerWidth <= MEDIUM_BREAKPOINT)
  // phone-only helper (<= SMALL)
  const [isPhone, setIsPhone] = useState(window.innerWidth <= SMALL_BREAKPOINT)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(
        window.innerWidth <= SMALL_BREAKPOINT || 
        (window.innerWidth >= MEDIUM_BREAKPOINT && window.innerWidth <= MOBILE_BREAKPOINT)
      )
      setIsMedium(window.innerWidth <= MEDIUM_BREAKPOINT)
      setIsPhone(window.innerWidth <= SMALL_BREAKPOINT)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return { isMobile, isMedium, isPhone }
}
