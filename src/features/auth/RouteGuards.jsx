import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

/** Only lets signed-in users through; everyone else goes to /login and is sent back afterwards. */
export function RequireAuth({ children }) {
  const { user, justLoggedOut } = useAuth()
  const location = useLocation()
  if (!user) {
    // The user just clicked "Log out" and the caller is already navigating somewhere (home, sign-up).
    // Redirecting to /login here would race with that navigation, so show nothing for the moment.
    if (justLoggedOut) return null
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  }
  return children ?? <Outlet />
}

/** Keeps signed-in users away from the login and sign-up pages. */
export function GuestOnly({ children }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/board" replace />
  return children ?? <Outlet />
}
