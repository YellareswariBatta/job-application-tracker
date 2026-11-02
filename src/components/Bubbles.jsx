import { Box } from '@mui/material'

// Fixed layout (not random) so bubbles don't jump around on every re-render.
// size in px, left in %, dur/delay in seconds, drift in px.
const PAGE_BUBBLES = [
  { size: 90, left: 6, dur: 22, delay: 0, drift: 40, c: 0 },
  { size: 40, left: 16, dur: 16, delay: 4, drift: -30, c: 1 },
  { size: 140, left: 28, dur: 28, delay: 8, drift: 60, c: 2 },
  { size: 60, left: 42, dur: 19, delay: 2, drift: -50, c: 0 },
  { size: 30, left: 53, dur: 14, delay: 9, drift: 25, c: 3 },
  { size: 110, left: 64, dur: 26, delay: 5, drift: -45, c: 1 },
  { size: 50, left: 74, dur: 18, delay: 11, drift: 35, c: 2 },
  { size: 80, left: 84, dur: 24, delay: 1, drift: -40, c: 3 },
  { size: 36, left: 92, dur: 15, delay: 7, drift: 20, c: 0 },
  { size: 70, left: 35, dur: 21, delay: 13, drift: -35, c: 1 },
]

const BANNER_BUBBLES = [
  { size: 120, left: '72%', top: '-30%', dur: 9, delay: 0, drift: 18 },
  { size: 60, left: '88%', top: '55%', dur: 7, delay: 1, drift: -14 },
  { size: 36, left: '58%', top: '65%', dur: 6, delay: 2, drift: 12 },
  { size: 80, left: '-3%', top: '60%', dur: 10, delay: 3, drift: 16 },
  { size: 26, left: '30%', top: '10%', dur: 8, delay: 1.5, drift: -10 },
]

const glassBubble = (colour) => ({
  background: `radial-gradient(circle at 30% 28%, rgba(255,255,255,.75), ${colour} 55%, transparent 100%)`,
  border: '1px solid rgba(255,255,255,.35)',
})

/** Soft bubbles floating up behind the whole page. Decorative only. */
export function PageBubbles() {
  const colours = ['rgba(99,102,241,.28)', 'rgba(236,72,153,.24)', 'rgba(6,182,212,.26)', 'rgba(245,158,11,.24)']
  return (
    <Box aria-hidden="true" sx={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0, opacity: { xs: 0.7, md: 1 } }}>
      {PAGE_BUBBLES.map((b, i) => (
        <span
          key={i}
          className="bubble bubble-rise"
          style={{
            '--size': `${b.size}px`,
            '--left': `${b.left}%`,
            '--dur': `${b.dur}s`,
            '--delay': `${b.delay}s`,
            '--drift': `${b.drift}px`,
            ...glassBubble(colours[b.c]),
          }}
        />
      ))}
    </Box>
  )
}

/** Translucent bubbles bobbing inside a gradient banner. Decorative only. */
export function BannerBubbles() {
  return (
    <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {BANNER_BUBBLES.map((b, i) => (
        <span
          key={i}
          className="bubble bubble-bob"
          style={{
            '--size': `${b.size}px`,
            '--left': b.left,
            '--top': b.top,
            '--dur': `${b.dur}s`,
            '--delay': `${b.delay}s`,
            '--drift': `${b.drift}px`,
            ...glassBubble('rgba(255,255,255,.18)'),
          }}
        />
      ))}
    </Box>
  )
}
