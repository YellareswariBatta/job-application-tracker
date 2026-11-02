import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import AppThemeProvider from './features/theme/AppThemeProvider'
import { AuthProvider } from './features/auth/AuthContext'

// Renders the real app (providers, routes, guards) at a given address.
function renderApp(path = '/') {
  return render(
    <AppThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </AppThemeProvider>,
  )
}

beforeEach(() => localStorage.clear())

describe('whole app', () => {
  it('shows the landing page first', () => {
    renderApp('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/land your next role/i)
    expect(screen.getByRole('link', { name: /get started free/i })).toBeInTheDocument()
  })

  it('sends a signed-out visitor from a protected address to the login page (no crash)', async () => {
    renderApp('/board')
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
  })

  it('shows a not-found page for unknown addresses, with a way home', () => {
    renderApp('/definitely-not-a-page')
    expect(screen.getByText(/page not found/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/')
  })

  it('opens the demo, shows sample applications, and logging out returns to the landing page', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(screen.getByRole('button', { name: /try the live demo/i }))

    // Wait for the signed-in demo board (the landing page also shows a sample card, so check the banner first).
    expect(await screen.findByText(/exploring a demo/i, {}, { timeout: 8000 })).toBeInTheDocument()
    const applied = await screen.findByRole('region', { name: /applied column/i }, { timeout: 8000 })
    expect(within(applied).getByText('Northwind Digital')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /account menu/i }))
    await user.click(await screen.findByRole('menuitem', { name: /log out/i }))

    // Must end on the landing page, not the login page (the route guard must not win the race).
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/land your next role/i))
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
    expect(localStorage.getItem('jat.session')).toBeNull()
  }, 30000)

  it('lets a demo visitor jump to sign-up from the demo banner', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.click(screen.getByRole('button', { name: /try the live demo/i }))
    await user.click(await screen.findByRole('button', { name: /create my account/i }, { timeout: 8000 }))

    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/create your account/i))
    expect(localStorage.getItem('jat.session')).toBeNull()
  }, 30000)
})
