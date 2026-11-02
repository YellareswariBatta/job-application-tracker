import { useEffect, useRef } from 'react'
import { alpha, Box, useTheme } from '@mui/material'
import { motionAllowed } from './motion'

// Things the ring should react to (grow and glow).
const INTERACTIVE = 'a, button, [role="button"], [role="tab"], input, select, textarea, label, [aria-roledescription="sortable"]'
const SPARKLE_COLOURS = ['#ec4899', '#06b6d4', '#f59e0b', '#a855f7']
const MAX_PARTICLES = 160

/**
 * Cursor effects, all drawn outside React's render cycle (one requestAnimationFrame loop):
 *  - a soft spotlight that follows the pointer across the page background
 *  - a sparkle trail behind fast movement, and a burst on click
 *  - a ring that trails the pointer and grows over clickable things
 * Decorative only: it never captures pointer events, and it switches itself off on touch screens
 * and for people who prefer reduced motion.
 */
export default function MagicCursor() {
  const { palette } = useTheme()
  const canvasRef = useRef(null)
  const ringRef = useRef(null)
  const ringInnerRef = useRef(null)
  const dotRef = useRef(null)
  const spotlightRef = useRef(null)

  useEffect(() => {
    if (!motionAllowed()) return undefined
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const colours = [palette.primary.main, ...SPARKLE_COLOURS]

    let width = 0
    let height = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const mouse = { x: -200, y: -200, lastX: -200, lastY: -200, visible: false }
    const ring = { x: -200, y: -200 }
    const particles = []
    let frame

    const spawn = (x, y, count, speed, spread = 0) => {
      for (let i = 0; i < count && particles.length < MAX_PARTICLES; i += 1) {
        const angle = Math.random() * Math.PI * 2
        const v = speed * (0.4 + Math.random())
        particles.push({
          x: x + (Math.random() - 0.5) * spread,
          y: y + (Math.random() - 0.5) * spread,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v - 0.3, // slight upward drift
          life: 1,
          decay: 0.015 + Math.random() * 0.02,
          size: 1.5 + Math.random() * 3,
          colour: colours[Math.floor(Math.random() * colours.length)],
        })
      }
    }

    const setRingState = (state) => {
      if (ringInnerRef.current) ringInnerRef.current.dataset.state = state
    }

    const onMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      if (!mouse.visible) {
        mouse.visible = true
        ring.x = e.clientX
        ring.y = e.clientY
        mouse.lastX = e.clientX
        mouse.lastY = e.clientY
      }
      setRingState(e.target instanceof Element && e.target.closest(INTERACTIVE) ? 'hover' : 'idle')
    }
    const onDown = (e) => {
      setRingState('down')
      spawn(e.clientX, e.clientY, 16, 3.2) // click burst
    }
    const onUp = (e) => setRingState(e.target instanceof Element && e.target.closest(INTERACTIVE) ? 'hover' : 'idle')
    const onLeave = () => {
      mouse.visible = false
    }

    const tick = () => {
      // Leave a short sparkle trail in proportion to how far the pointer moved this frame.
      const moved = Math.hypot(mouse.x - mouse.lastX, mouse.y - mouse.lastY)
      if (mouse.visible && moved > 3) spawn(mouse.x, mouse.y, Math.min(3, Math.ceil(moved / 14)), 0.9, 6)
      mouse.lastX = mouse.x
      mouse.lastY = mouse.y

      // Ring eases toward the pointer; the dot snaps to it.
      ring.x += (mouse.x - ring.x) * 0.18
      ring.y += (mouse.y - ring.y) * 0.18
      const visible = mouse.visible ? 1 : 0
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`
        ringRef.current.style.opacity = visible
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`
        dotRef.current.style.opacity = visible
      }
      if (spotlightRef.current) {
        spotlightRef.current.style.setProperty('--mx', `${ring.x}px`)
        spotlightRef.current.style.setProperty('--my', `${ring.y}px`)
        spotlightRef.current.style.opacity = visible
      }

      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter' // overlapping sparkles add up to a glow
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.97
        p.vy *= 0.97
        p.life -= p.decay
        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.colour
        ctx.shadowBlur = 12
        ctx.shadowColor = p.colour
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life + 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('resize', resize)
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('resize', resize)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [palette.primary.main])

  if (!motionAllowed()) return null

  const layer = { position: 'fixed', pointerEvents: 'none' }
  return (
    <div aria-hidden="true">
      {/* Spotlight sits behind the page content (z-index 0; content is above it). */}
      <Box
        ref={spotlightRef}
        sx={{
          ...layer,
          inset: 0,
          zIndex: 0,
          opacity: 0,
          transition: 'opacity .4s',
          background: `radial-gradient(520px circle at var(--mx, -500px) var(--my, -500px), ${alpha(palette.primary.main, palette.mode === 'dark' ? 0.2 : 0.14)}, transparent 65%)`,
        }}
      />
      {/* Everything below floats above dialogs and tooltips. */}
      <canvas ref={canvasRef} style={{ ...layer, inset: 0, zIndex: 3000 }} />
      <Box ref={ringRef} sx={{ ...layer, top: 0, left: 0, zIndex: 3001, opacity: 0, transition: 'opacity .3s' }}>
        <Box
          ref={ringInnerRef}
          data-state="idle"
          sx={{
            width: 36,
            height: 36,
            ml: '-18px',
            mt: '-18px',
            borderRadius: '50%',
            border: `2px solid ${alpha(palette.primary.main, 0.7)}`,
            transition: 'transform .25s cubic-bezier(.2,.8,.2,1), background-color .25s, border-color .25s',
            '&[data-state="hover"]': { transform: 'scale(1.7)', bgcolor: alpha(palette.primary.main, 0.12), borderColor: '#ec4899' },
            '&[data-state="down"]': { transform: 'scale(0.7)', bgcolor: alpha(palette.primary.main, 0.25) },
          }}
        />
      </Box>
      <Box ref={dotRef} sx={{ ...layer, top: 0, left: 0, zIndex: 3002, opacity: 0, transition: 'opacity .3s' }}>
        <Box sx={{ width: 6, height: 6, ml: '-3px', mt: '-3px', borderRadius: '50%', bgcolor: palette.primary.main, boxShadow: `0 0 10px 2px ${alpha(palette.primary.main, 0.8)}` }} />
      </Box>
    </div>
  )
}
