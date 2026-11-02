import { useRef } from 'react'
import { Box } from '@mui/material'
import { motionAllowed, tiltFor } from './motion'

/** 3D tilt toward the pointer, with a moving highlight. Wrap any card. */
export default function TiltCard({ children, max = 8, sx }) {
  const ref = useRef(null)

  function handleMove(e) {
    if (!motionAllowed()) return
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const { rotateX, rotateY } = tiltFor(px, py, max)
    ref.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
    ref.current.style.setProperty('--gx', `${px * 100}%`)
    ref.current.style.setProperty('--gy', `${py * 100}%`)
  }

  return (
    <Box
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={() => {
        ref.current.style.transform = ''
      }}
      sx={{
        position: 'relative',
        borderRadius: 4,
        transition: 'transform .25s cubic-bezier(.2,.8,.2,1)',
        '&:hover .tilt-glare': { opacity: 1 },
        ...sx,
      }}
    >
      {children}
      <Box
        className="tilt-glare"
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity .3s',
          background: 'radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,.22), transparent 55%)',
        }}
      />
    </Box>
  )
}
