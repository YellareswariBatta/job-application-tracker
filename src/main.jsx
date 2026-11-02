import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import MagicCursor from './components/magic/MagicCursor'
import AppThemeProvider from './features/theme/AppThemeProvider'
import { AuthProvider } from './features/auth/AuthContext'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/sora'
import './index.css'

// On GitHub Pages the site lives under "/<repository-name>/", so routes need that prefix (empty locally).
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AppThemeProvider>
        <MagicCursor />
        <BrowserRouter basename={basename}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </AppThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
