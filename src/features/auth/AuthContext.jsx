import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { DEMO_EMAIL, DEMO_NAME, buildDemoApplications } from '../demo/demoData'
import {
  SESSION_KEY,
  applicationsKeyFor,
  authenticate,
  clearSession,
  ensureDemoUser,
  readSessionUser,
  registerUser,
  startSession,
  touchSession,
} from './authService'

const AuthContext = createContext(null)

const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart']
const ACTIVITY_THROTTLE_MS = 15_000
const EXPIRY_CHECK_MS = 10_000

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSessionUser())
  const [notice, setNotice] = useState(null) // e.g. "Your session expired"
  // True after the user chose to log out, so route guards let the page they navigate to next finish
  // loading instead of redirecting to /login first.
  const [justLoggedOut, setJustLoggedOut] = useState(false)
  const lastTouch = useRef(0)

  const signIn = useCallback((publicUser) => {
    startSession(publicUser.id)
    setNotice(null)
    setJustLoggedOut(false)
    setUser(publicUser)
  }, [])

  const login = useCallback(
    async (credentials) => {
      const result = await authenticate(credentials)
      if (result.ok) signIn(result.user)
      return result
    },
    [signIn],
  )

  const register = useCallback(
    async (details) => {
      const result = await registerUser(details)
      if (result.ok) signIn(result.user)
      return result
    },
    [signIn],
  )

  /** One-click demo: signs into the shared demo account, filling it with sample data the first time. */
  const startDemo = useCallback(async () => {
    const result = await ensureDemoUser(DEMO_EMAIL, DEMO_NAME)
    if (!result.ok) return result
    const key = applicationsKeyFor(result.user.id)
    if (localStorage.getItem(key) === null) localStorage.setItem(key, JSON.stringify(buildDemoApplications()))
    signIn(result.user)
    return result
  }, [signIn])

  const logout = useCallback((reason = null) => {
    clearSession()
    setUser(null)
    setNotice(reason)
    setJustLoggedOut(reason === null) // an expiry (with a reason) should still go to the login page
  }, [])

  // While signed in: note activity, and sign out when the session runs out or is ended in another tab.
  useEffect(() => {
    if (!user) return undefined

    const onActivity = () => {
      const now = Date.now()
      if (now - lastTouch.current > ACTIVITY_THROTTLE_MS) {
        lastTouch.current = now
        touchSession(now)
      }
    }
    const checkExpiry = () => {
      if (!readSessionUser()) logout('Your session expired for your security. Please log in again.')
    }
    const onStorage = (e) => {
      if (e.key === SESSION_KEY && !e.newValue) setUser(null) // logged out elsewhere
    }

    ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, onActivity, { passive: true }))
    window.addEventListener('storage', onStorage)
    const timer = setInterval(checkExpiry, EXPIRY_CHECK_MS)
    return () => {
      ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, onActivity))
      window.removeEventListener('storage', onStorage)
      clearInterval(timer)
    }
  }, [user, logout])

  const value = useMemo(
    () => ({
      user,
      isDemo: user?.email === DEMO_EMAIL,
      justLoggedOut,
      notice,
      clearNotice: () => setNotice(null),
      login,
      register,
      startDemo,
      logout,
    }),
    [user, justLoggedOut, notice, login, register, startDemo, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
