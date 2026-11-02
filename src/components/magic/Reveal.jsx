import { useEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'

/** Fades and slides its content up the first time it scrolls into view. `delay` (ms) staggers siblings. */
export default function Reveal({ children, delay = 0, sx }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setShown(true)
      return undefined
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <Box
      ref={ref}
      sx={{
        opacity: shown ? 1 : 0,
        translate: shown ? '0 0' : '0 32px',
        transition: `opacity .7s ease ${delay}ms, translate .7s cubic-bezier(.2,.8,.2,1) ${delay}ms`,
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
