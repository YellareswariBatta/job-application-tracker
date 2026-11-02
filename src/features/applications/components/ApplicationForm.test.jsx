import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ApplicationForm from './ApplicationForm'

describe('ApplicationForm', () => {
  it('shows validation errors and does not submit when required fields are empty', async () => {
    const onSubmit = vi.fn()
    render(<ApplicationForm onSubmit={onSubmit} onCancel={() => {}} />)

    await userEvent.click(screen.getByRole('button', { name: 'Add application' }))

    expect(await screen.findByText('Company is required')).toBeInTheDocument()
    expect(screen.getByText('Role is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows an error for an invalid job link', async () => {
    render(<ApplicationForm onSubmit={() => {}} onCancel={() => {}} />)

    await userEvent.type(screen.getByLabelText(/company/i), 'Acme')
    await userEvent.type(screen.getByLabelText(/role/i), 'Developer')
    await userEvent.type(screen.getByLabelText(/job link/i), 'not-a-url')
    await userEvent.click(screen.getByRole('button', { name: 'Add application' }))

    expect(await screen.findByText('Job link must be a valid URL')).toBeInTheDocument()
  })

  it('submits cleaned, validated data', async () => {
    const onSubmit = vi.fn()
    render(<ApplicationForm onSubmit={onSubmit} onCancel={() => {}} />)

    await userEvent.type(screen.getByLabelText(/company/i), '  Acme  ')
    await userEvent.type(screen.getByLabelText(/role/i), 'Developer')
    await userEvent.type(screen.getByLabelText(/minimum salary/i), '40000')
    await userEvent.click(screen.getByRole('button', { name: 'Add application' }))

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      company: 'Acme', // trimmed
      role: 'Developer',
      salaryMin: 40000, // converted to a number
      status: 'Applied',
    })
  })

  it('pre-fills the fields when editing', () => {
    const initial = { company: 'Globex', role: 'Analyst', dateApplied: '2024-02-10', status: 'Offer', notes: '' }
    render(<ApplicationForm initial={initial} onSubmit={() => {}} onCancel={() => {}} />)

    expect(screen.getByLabelText(/company/i)).toHaveValue('Globex')
    expect(screen.getByLabelText('Status')).toHaveValue('Offer')
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })
})
