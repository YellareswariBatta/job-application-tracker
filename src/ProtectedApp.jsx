import Layout from './components/Layout'
import { ApplicationsProvider } from './features/applications/ApplicationsContext'
import { useAuth } from './features/auth/AuthContext'
import { applicationsKeyFor } from './features/auth/authService'
import { RequireAuth } from './features/auth/RouteGuards'

/** Only rendered once RequireAuth has confirmed a user, so `user` is never null here. */
function SignedInShell() {
  const { user } = useAuth()
  // Each user gets their own data store; `key` remounts it when the account changes.
  return (
    <ApplicationsProvider key={user.id} storageKey={applicationsKeyFor(user.id)}>
      <Layout />
    </ApplicationsProvider>
  )
}

/** Everything behind login. Loaded lazily so the landing page stays small. */
export default function ProtectedApp() {
  return (
    <RequireAuth>
      <SignedInShell />
    </RequireAuth>
  )
}
