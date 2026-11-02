import { useEffect, useMemo, useState } from 'react'
import { Box } from '@mui/material'

const COLOURS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e', '#a855f7']
const PIECE_COUNT = 70
const DURATION_MS = 3600

/** Fires a burst of falling confetti each time `burst` changes to a new non-zero number. */
export default function Confetti({ burst }) {
  const [active, setActive] = useState(false)

  // New random pieces for every burst.
  const pieces = useMemo(
    () =>
      burst
        ? Array.from({ length: PIECE_COUNT }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            dx: (Math.random() - 0.5) * 300,
            rot: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720),
            dur: 2 + Math.random() * 1.2,
            delay: Math.random() * 0.5,
            w: 6 + Math.random() * 6,
            h: 10 + Math.random() * 8,
            round: Math.random() > 0.7,
            colour: COLOURS[i % COLOURS.length],
          }))
        : [],
    [burst],
  )

  useEffect(() => {
    if (!burst) return undefined
    setActive(true)
    const timer = setTimeout(() => setActive(false), DURATION_MS)
    return () => clearTimeout(timer)
  }, [burst])

  if (!active) return null
  return (
    <Box aria-hidden="true" sx={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: (t) => t.zIndex.snackbar + 1 }}>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.w,
            height: p.round ? p.w : p.h,
            borderRadius: p.round ? '50%' : 2,
            background: p.colour,
            '--dx': `${p.dx}px`,
            '--rot': `${p.rot}deg`,
            '--dur': `${p.dur}s`,
            '--delay': `${p.delay}s`,
          }}
        />
      ))}
    </Box>
  )
}
