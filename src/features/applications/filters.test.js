import { EMPTY_FILTERS, filterApplications, hasActiveFilters } from './filters'

const apps = [
  { id: '1', company: 'Acme Ltd', role: 'Frontend Developer', status: 'Applied', dateApplied: '2024-01-05' },
  { id: '2', company: 'Globex', role: 'Data Analyst', status: 'Offer', dateApplied: '2024-02-10' },
  { id: '3', company: 'Initech', role: 'Developer', status: 'Applied', dateApplied: '2024-03-15' },
]
const idsFor = (filters) => filterApplications(apps, { ...EMPTY_FILTERS, ...filters }).map((a) => a.id)

describe('filterApplications', () => {
  it('returns everything when no filters are set', () => {
    expect(idsFor({})).toEqual(['1', '2', '3'])
  })

  it('searches company and role, ignoring case', () => {
    expect(idsFor({ query: 'ACME' })).toEqual(['1'])
    expect(idsFor({ query: 'developer' })).toEqual(['1', '3'])
  })

  it('filters by status', () => {
    expect(idsFor({ status: 'Offer' })).toEqual(['2'])
  })

  it('applies an inclusive date range', () => {
    expect(idsFor({ from: '2024-02-10', to: '2024-03-15' })).toEqual(['2', '3'])
    expect(idsFor({ to: '2024-01-05' })).toEqual(['1'])
  })

  it('combines filters', () => {
    expect(idsFor({ query: 'developer', status: 'Applied', from: '2024-02-01' })).toEqual(['3'])
  })
})

describe('hasActiveFilters', () => {
  it('detects whether any filter is set', () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false)
    expect(hasActiveFilters({ ...EMPTY_FILTERS, status: 'Offer' })).toBe(true)
  })
})
