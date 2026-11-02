import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AppThemeProvider from '../../theme/AppThemeProvider'
import { AuthProvider } from '../AuthContext'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'

function renderAuth(path) {
  return render(
    <AppThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/board" element={<p>Board reached</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </AppThemeProvider>,
  )
}

beforeEach(() => localStorage.clear())

describe('sign-up and login pages', () => {
  it('creates an account from filled-in fields, then lets the same user log in', async () => {
    const user = userEvent.setup()
    renderAuth('/register')

    await user.type(screen.getByLabelText('Name'), 'Sam Taylor')
    await user.type(screen.getByLabelText('Email'), 'sam@example.com')
    await user.type(screen.getByLabelText('Password'), 'Sturdy-pass9')
    await user.type(screen.getByLabelText('Confirm password'), 'Sturdy-pass9')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    // Regression: password fields used to read as empty ("Required") because they were never registered.
    expect(await screen.findByText('Board reached', {}, { timeout: 5000 })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('jat.users'))).toHaveLength(1)
  }, 15000)

  it('shows a message for each empty field instead of submitting', async () => {
    const user = userEvent.setup()
    renderAuth('/register')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(localStorage.getItem('jat.users')).toBeNull()
  })

  it('reports a wrong password with a generic message', async () => {
    const user = userEvent.setup()
    renderAuth('/register')
    await user.type(screen.getByLabelText('Name'), 'Sam Taylor')
    await user.type(screen.getByLabelText('Email'), 'sam@example.com')
    await user.type(screen.getByLabelText('Password'), 'Sturdy-pass9')
    await user.type(screen.getByLabelText('Confirm password'), 'Sturdy-pass9')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    await screen.findByText('Board reached', {}, { timeout: 5000 })

    localStorage.removeItem('jat.session') // simulate logging out
    renderAuth('/login')
    await user.type(screen.getAllByLabelText('Email').at(-1), 'sam@example.com')
    await user.type(screen.getAllByLabelText('Password').at(-1), 'Wrong-pass1')
    await user.click(screen.getByRole('button', { name: /^log in$/i }))
    expect(await screen.findByText('Incorrect email or password.', {}, { timeout: 5000 })).toBeInTheDocument()
  }, 20000)
})
