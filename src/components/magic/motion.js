/**
 * True only for devices with a real mouse/trackpad whose user hasn't asked for less motion.
 * Touch screens and reduced-motion users skip all the cursor effects.
 */
export function motionAllowed() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return fineHover && !reduced
}

const clamp01 = (n) => Math.min(1, Math.max(0, n))

/** Card rotation in degrees for a pointer at (px, py), each 0 to 1 across the card. Centre = flat. */
export function tiltFor(px, py, max = 8) {
  return {
    rotateX: -(clamp01(py) - 0.5) * 2 * max,
    rotateY: (clamp01(px) - 0.5) * 2 * max,
  }
}
