import { hashPassword, isCryptoAvailable, verifyPassword } from './passwordHash'

// Everything lives in localStorage because there is no backend. That means anyone with access to this
// browser profile can read or edit it: this keeps honest users apart, it is not server-grade security.

export const USERS_KEY = 'jat.users'
export const SESSION_KEY = 'jat.session'
const LOCKOUTS_KEY = 'jat.lockouts'
export const LEGACY_APPLICATIONS_KEY = 'jat.applications' // data saved before accounts existed

export const MAX_FAILED_ATTEMPTS = 5
export const LOCKOUT_MS = 5 * 60 * 1000
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000
export const MAX_SESSION_MS = 12 * 60 * 60 * 1000

const GENERIC_LOGIN_ERROR = 'Incorrect email or password.' // same text for "no such user" and "wrong password"

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`)

// Only these fields ever leave this module; the salt and hash stay inside.
const toPublicUser = ({ id, name, email }) => ({ id, name, email })

const getUsers = () => {
  const users = read(USERS_KEY, [])
  return Array.isArray(users) ? users : []
}

export const applicationsKeyFor = (userId) => `${LEGACY_APPLICATIONS_KEY}.${userId}`

// ---------- Accounts ----------

export async function registerUser({ name, email, password }, now = Date.now()) {
  if (!isCryptoAvailable()) {
    return { ok: false, error: 'Secure sign-up needs HTTPS or localhost. Open the app from a secure address.' }
  }
  const users = getUsers()
  if (users.some((u) => u.email === email)) {
    return { ok: false, error: 'An account with this email already exists. Try logging in instead.' }
  }

  const user = { id: newId(), name, email, ...(await hashPassword(password)), createdAt: new Date(now).toISOString() }
  if (!write(USERS_KEY, [...users, user])) {
    return { ok: false, error: 'Your account could not be saved. Browser storage may be full or blocked.' }
  }

  // The very first account adopts any applications saved before login existed, so nothing is lost.
  if (users.length === 0) {
    const legacy = localStorage.getItem(LEGACY_APPLICATIONS_KEY)
    if (legacy) {
      localStorage.setItem(applicationsKeyFor(user.id), legacy)
      localStorage.removeItem(LEGACY_APPLICATIONS_KEY)
    }
  }
  return { ok: true, user: toPublicUser(user) }
}

/**
 * Finds or creates the shared demo account. Nobody knows its password (it is random and never shown),
 * so it can only be entered through the "demo" button, never through the login form.
 * Unlike registerUser, it never adopts pre-login data.
 */
export async function ensureDemoUser(email, name) {
  const users = getUsers()
  const existing = users.find((u) => u.email === email)
  if (existing) return { ok: true, user: toPublicUser(existing), created: false }

  if (!isCryptoAvailable()) return { ok: false, error: 'The demo needs HTTPS or localhost.' }
  const randomPassword = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24))))
  const user = { id: newId(), name, email, ...(await hashPassword(randomPassword)), createdAt: new Date().toISOString() }
  if (!write(USERS_KEY, [...users, user])) return { ok: false, error: 'The demo could not be saved. Browser storage may be blocked.' }
  return { ok: true, user: toPublicUser(user), created: true }
}

// ---------- Failed-attempt lockout ----------

const getLockouts = () => read(LOCKOUTS_KEY, {})

export function getLockRemainingMs(email, now = Date.now()) {
  const entry = getLockouts()[email]
  return entry?.until && entry.until > now ? entry.until - now : 0
}

function recordFailure(email, now) {
  const lockouts = getLockouts()
  const count = (lockouts[email]?.count ?? 0) + 1
  lockouts[email] =
    count >= MAX_FAILED_ATTEMPTS ? { count: 0, until: now + LOCKOUT_MS } : { count, until: 0 }
  write(LOCKOUTS_KEY, lockouts)
}

function clearFailures(email) {
  const lockouts = getLockouts()
  delete lockouts[email]
  write(LOCKOUTS_KEY, lockouts)
}

// A throwaway record so an unknown email costs the same time as a wrong password.
let dummyRecord
const getDummyRecord = async () => (dummyRecord ??= await hashPassword('dummy-password-for-timing'))

export async function authenticate({ email, password }, now = Date.now()) {
  const remaining = getLockRemainingMs(email, now)
  if (remaining > 0) {
    const minutes = Math.ceil(remaining / 60000)
    return {
      ok: false,
      locked: true,
      error: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
    }
  }

  const user = getUsers().find((u) => u.email === email)
  const valid = await verifyPassword(password, user ?? (await getDummyRecord()))
  if (!user || !valid) {
    recordFailure(email, now)
    return { ok: false, error: GENERIC_LOGIN_ERROR }
  }

  clearFailures(email)
  return { ok: true, user: toPublicUser(user) }
}

// ---------- Sessions ----------
// Stored: who, when it started, when it was last used. Expires after 30 min idle or 12 h in total.

export function startSession(userId, now = Date.now()) {
  write(SESSION_KEY, { userId, startedAt: now, lastActive: now })
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* nothing useful to do if storage is blocked */
  }
}

/** Returns the signed-in public user, or null (and clears the session) if missing, expired or orphaned. */
export function readSessionUser(now = Date.now()) {
  const session = read(SESSION_KEY, null)
  if (!session || typeof session.userId !== 'string') return null

  const expired = now - session.lastActive > IDLE_TIMEOUT_MS || now - session.startedAt > MAX_SESSION_MS
  const user = expired ? null : getUsers().find((u) => u.id === session.userId)
  if (!user) {
    clearSession()
    return null
  }
  return toPublicUser(user)
}

/** Records activity so an in-use session doesn't hit the idle timeout. */
export function touchSession(now = Date.now()) {
  const session = read(SESSION_KEY, null)
  if (session) write(SESSION_KEY, { ...session, lastActive: now })
}
