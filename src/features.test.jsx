import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import AppThemeProvider from './features/theme/AppThemeProvider'
import { AuthProvider } from './features/auth/AuthContext'

const SLOW = { timeout: 10000 }

// Opens the real app on the landing page and signs into the demo account (sample data).
async function openDemoBoard() {
  const user = userEvent.setup()
  render(
    <AppThemeProvider>
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </AppThemeProvider>,
  )
  await user.click(screen.getByRole('button', { name: /try the live demo/i }))
  await screen.findByRole('region', { name: /applied column/i }, SLOW)
  return user
}

beforeEach(() => localStorage.clear())

describe('features in the real app (demo account)', () => {
  it('lets you undo a deletion', async () => {
    const user = await openDemoBoard()

    await user.click(await screen.findByRole('link', { name: 'Northwind Digital' }))
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Delete' }))

    // Back on the board, the card is gone and the undo bar offers it back.
    expect(await screen.findByText('Deleted Northwind Digital')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Northwind Digital' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /undo/i }))
    expect(await screen.findByRole('link', { name: 'Northwind Digital' })).toBeInTheDocument()
  }, 40000)

  it('shows the status history timeline on an application', async () => {
    const user = await openDemoBoard()
    await user.click(await screen.findByRole('link', { name: 'Harbour & Co' }))

    const timeline = await screen.findByRole('list', { name: /status history/i })
    const steps = within(timeline).getAllByRole('listitem').map((li) => li.textContent)
    expect(steps).toHaveLength(3)
    expect(steps[0]).toMatch(/Offer.*current/) // newest first
    expect(steps[2]).toMatch(/Applied/)
  }, 40000)

  it('compares offers side by side and names the best value', async () => {
    const user = await openDemoBoard()
    await user.click(screen.getByRole('link', { name: /^offers$/i }))

    expect(await screen.findByRole('heading', { name: /compare offers/i })).toBeInTheDocument()
    const table = await screen.findByRole('table', { name: /offer comparison/i })
    expect(within(table).getByText('Effective hourly rate')).toBeInTheDocument()
    expect(within(table).getAllByText('Best').length).toBeGreaterThan(0)
    expect(screen.getByText(/gives the best value/i)).toBeInTheDocument()
  }, 40000)

  it('shows the funnel and reply rate by source on the dashboard', async () => {
    const user = await openDemoBoard()
    await user.click(screen.getByRole('link', { name: /dashboard/i }))

    expect(await screen.findByText('Hiring funnel', {}, SLOW)).toBeInTheDocument()
    expect(screen.getByRole('list', { name: /hiring funnel/i })).toBeInTheDocument()
    expect(screen.getByText('Where replies come from')).toBeInTheDocument()
    expect(screen.getByText('Days to first reply')).toBeInTheDocument()
  }, 40000)

  it('turns a pasted job advert into a pre-filled application form', async () => {
    const user = await openDemoBoard()
    await user.click(screen.getByRole('button', { name: /paste job advert/i }))

    await user.click(await screen.findByRole('textbox', { name: /job advert/i }))
    await user.paste('Backend Engineer at Orchard Labs\nSalary: £60,000 - £70,000\nhttps://www.linkedin.com/jobs/view/123')

    expect(await screen.findByText('Role: Backend Engineer')).toBeInTheDocument()
    expect(screen.getByText('Company: Orchard Labs')).toBeInTheDocument()
    expect(screen.getByText('Source: LinkedIn')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /create application/i }))

    const dialog = await screen.findByRole('dialog')
    await waitFor(() => expect(within(dialog).getByLabelText(/company/i)).toHaveValue('Orchard Labs'))
    expect(within(dialog).getByLabelText(/role/i)).toHaveValue('Backend Engineer')
    expect(within(dialog).getByLabelText(/minimum salary/i)).toHaveValue(60000)
    expect(within(dialog).getByLabelText('Source')).toHaveValue('LinkedIn')
  }, 40000)

  it('records history when a new application is added', async () => {
    const user = await openDemoBoard()
    await user.click(screen.getByRole('button', { name: /^add application$/i }))

    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText(/company/i), 'Orchard Labs')
    await user.type(within(dialog).getByLabelText(/role/i), 'Engineer')
    await user.click(within(dialog).getByRole('button', { name: /add application/i }))

    await user.click(await screen.findByRole('link', { name: 'Orchard Labs' }))
    const timeline = await screen.findByRole('list', { name: /status history/i })
    expect(within(timeline).getAllByRole('listitem')).toHaveLength(1)
  }, 40000)
})
