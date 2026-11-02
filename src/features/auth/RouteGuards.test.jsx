import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import { GuestOnly, RequireAuth } from './RouteGuards'
import { USERS_KEY, startSession } from './authService'

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<GuestOnly><p>Login page</p></GuestOnly>} />
          <Route path="/board" element={<RequireAuth><p>Secret board</p></RequireAuth>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => localStorage.clear())

describe('route guards', () => {
  it('sends signed-out visitors from a protected page to the login page', () => {
    renderAt('/board')
    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Secret board')).not.toBeInTheDocument()
  })

  it('lets a signed-in user see protected pages', () => {
    localStorage.setItem(USERS_KEY, JSON.stringify([{ id: 'u1', name: 'Sam', email: 'sam@example.com', salt: 's', hash: 'h', iterations: 1 }]))
    startSession('u1')
    renderAt('/board')
    expect(screen.getByText('Secret board')).toBeInTheDocument()
  })

  it('keeps signed-in users off the login page', () => {
    localStorage.setItem(USERS_KEY, JSON.stringify([{ id: 'u1', name: 'Sam', email: 'sam@example.com', salt: 's', hash: 'h', iterations: 1 }]))
    startSession('u1')
    renderAt('/login')
    expect(screen.getByText('Secret board')).toBeInTheDocument()
  })
})
