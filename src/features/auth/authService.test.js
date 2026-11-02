import {
  IDLE_TIMEOUT_MS,
  LEGACY_APPLICATIONS_KEY,
  LOCKOUT_MS,
  MAX_FAILED_ATTEMPTS,
  MAX_SESSION_MS,
  USERS_KEY,
  applicationsKeyFor,
  authenticate,
  clearSession,
  getLockRemainingMs,
  readSessionUser,
  registerUser,
  startSession,
  touchSession,
} from './authService'
import { hashPassword, verifyPassword } from './passwordHash'

const details = { name: 'Sam Taylor', email: 'sam@example.com', password: 'Sturdy-pass9' }

beforeEach(() => localStorage.clear())

describe('passwordHash', () => {
  it('verifies the right password and rejects the wrong one', async () => {
    const record = await hashPassword('Sturdy-pass9', 1000) // few iterations keeps the test quick
    expect(await verifyPassword('Sturdy-pass9', record)).toBe(true)
    expect(await verifyPassword('Sturdy-pass8', record)).toBe(false)
  })

  it('uses a fresh salt each time', async () => {
    const [a, b] = await Promise.all([hashPassword('same', 1000), hashPassword('same', 1000)])
    expect(a.salt).not.toBe(b.salt)
    expect(a.hash).not.toBe(b.hash)
  })
})

describe('registerUser', () => {
  it('creates an account without ever storing the password', async () => {
    const result = await registerUser(details)
    expect(result.ok).toBe(true)
    expect(result.user).toEqual({ id: expect.any(String), name: 'Sam Taylor', email: 'sam@example.com' })

    const stored = localStorage.getItem(USERS_KEY)
    expect(stored).not.toContain('Sturdy-pass9')
    expect(stored).toContain('"hash"')
  })

  it('rejects a duplicate email', async () => {
    await registerUser(details)
    const again = await registerUser(details)
    expect(again.ok).toBe(false)
    expect(again.error).toMatch(/already exists/)
  })

  it('moves pre-login applications to the first account only', async () => {
    localStorage.setItem(LEGACY_APPLICATIONS_KEY, '[{"id":"1"}]')
    const first = await registerUser(details)
    expect(localStorage.getItem(applicationsKeyFor(first.user.id))).toBe('[{"id":"1"}]')
    expect(localStorage.getItem(LEGACY_APPLICATIONS_KEY)).toBeNull()

    const second = await registerUser({ ...details, email: 'other@example.com' })
    expect(localStorage.getItem(applicationsKeyFor(second.user.id))).toBeNull()
  })
})

describe('authenticate', () => {
  it('logs in with the right password', async () => {
    await registerUser(details)
    const result = await authenticate({ email: details.email, password: details.password })
    expect(result.ok).toBe(true)
    expect(result.user).not.toHaveProperty('hash')
  })

  it('gives the same error for a wrong password and an unknown email', async () => {
    await registerUser(details)
    const wrongPassword = await authenticate({ email: details.email, password: 'Wrong-pass1' })
    const unknownUser = await authenticate({ email: 'nobody@example.com', password: 'Wrong-pass1' })
    expect(wrongPassword.ok).toBe(false)
    expect(wrongPassword.error).toBe(unknownUser.error)
  })

  it('locks the account after repeated failures, then unlocks after the lockout period', async () => {
    await registerUser(details)
    const t0 = 1_000_000
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i += 1) {
      await authenticate({ email: details.email, password: 'Wrong-pass1' }, t0)
    }
    // Even the correct password is refused while locked.
    const locked = await authenticate({ email: details.email, password: details.password }, t0 + 1000)
    expect(locked).toMatchObject({ ok: false, locked: true })
    expect(getLockRemainingMs(details.email, t0 + 1000)).toBeGreaterThan(0)

    const later = await authenticate({ email: details.email, password: details.password }, t0 + LOCKOUT_MS + 1)
    expect(later.ok).toBe(true)
  }, 30000)
})

describe('sessions', () => {
  const user = { id: 'u1', name: 'Sam', email: 'sam@example.com' }
  const seedUser = () => localStorage.setItem(USERS_KEY, JSON.stringify([{ ...user, salt: 's', hash: 'h', iterations: 1 }]))

  it('returns the user while the session is fresh', () => {
    seedUser()
    startSession('u1', 1000)
    expect(readSessionUser(2000)).toEqual(user)
  })

  it('expires after the idle timeout, but activity extends it', () => {
    seedUser()
    startSession('u1', 0)
    touchSession(IDLE_TIMEOUT_MS - 1)
    expect(readSessionUser(IDLE_TIMEOUT_MS + 1000)).toEqual(user) // active recently
    expect(readSessionUser(IDLE_TIMEOUT_MS * 2 + 5000)).toBeNull() // idle for too long
  })

  it('expires after the absolute maximum even if always active', () => {
    seedUser()
    startSession('u1', 0)
    touchSession(MAX_SESSION_MS + 1000)
    expect(readSessionUser(MAX_SESSION_MS + 2000)).toBeNull()
  })

  it('rejects a session for a user that no longer exists, and clears it', () => {
    startSession('ghost', 0)
    expect(readSessionUser(1)).toBeNull()
    expect(localStorage.getItem('jat.session')).toBeNull()
  })

  it('ends on clearSession', () => {
    seedUser()
    startSession('u1', 0)
    clearSession()
    expect(readSessionUser(1)).toBeNull()
  })
})
