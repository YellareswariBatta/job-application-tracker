import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import NotFoundPage from './components/NotFoundPage'
import PageLoader from './components/PageLoader'
import { GuestOnly } from './features/auth/RouteGuards'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import LandingPage from './features/landing/LandingPage'

// Everything behind login is split into separate downloads: the landing page loads first and fast,
// and heavy libraries (charts, date pickers) only arrive when needed.
const ProtectedApp = lazy(() => import('./ProtectedApp'))
const BoardPage = lazy(() => import('./features/applications/pages/BoardPage'))
const ApplicationDetailPage = lazy(() => import('./features/applications/pages/ApplicationDetailPage'))
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'))
const OffersPage = lazy(() => import('./features/offers/OffersPage'))

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route index element={<LandingPage />} />
        <Route element={<GuestOnly />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Signed-in only */}
        <Route element={<ProtectedApp />}>
          <Route path="board" element={<BoardPage />} />
          <Route path="applications/:id" element={<ApplicationDetailPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="offers" element={<OffersPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
