import { motionAllowed, tiltFor } from './motion'

describe('tiltFor', () => {
  it('is flat when the pointer is in the centre', () => {
    expect(tiltFor(0.5, 0.5)).toEqual({ rotateX: -0, rotateY: 0 })
  })

  it('tilts toward the pointer, up to the maximum angle', () => {
    expect(tiltFor(1, 0.5, 10).rotateY).toBe(10) // right edge turns right
    expect(tiltFor(0, 0.5, 10).rotateY).toBe(-10)
    expect(tiltFor(0.5, 0, 10).rotateX).toBe(10) // top edge tips the top toward you
  })

  it('ignores pointer positions outside the card', () => {
    expect(tiltFor(5, -3, 8)).toEqual(tiltFor(1, 0, 8))
  })
})

describe('motionAllowed', () => {
  it('is false when the browser cannot report pointer capabilities (e.g. tests)', () => {
    expect(motionAllowed()).toBe(false)
  })
})
