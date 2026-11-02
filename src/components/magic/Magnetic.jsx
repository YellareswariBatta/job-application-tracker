import { useRef } from 'react'
import { Box } from '@mui/material'
import { motionAllowed } from './motion'

/** Wraps a button so it drifts toward the pointer when you get close, then springs back. */
export default function Magnetic({ children, strength = 0.35 }) {
  const ref = useRef(null)

  function handleMove(e) {
    if (!motionAllowed()) return
    const rect = ref.current.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    ref.current.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`
  }

  return (
    // Padding (cancelled by the negative margin) widens the zone that attracts the button.
    <Box
      component="span"
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={() => {
        ref.current.style.transform = ''
      }}
      sx={{ display: 'inline-block', p: 1.25, m: -1.25, transition: 'transform .3s cubic-bezier(.2,.8,.2,1)' }}
    >
      {children}
    </Box>
  )
}
