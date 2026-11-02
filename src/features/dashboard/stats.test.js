import { applicationsPerWeek, calculateStats, statusDistribution } from './stats'

// Wednesday 10 January 2024, so the current week is Mon 8 – Sun 14 January.
const NOW = new Date(2024, 0, 10, 12)

const app = (status, extra = {}) => ({ status, dateApplied: '2024-01-09', ...extra })

describe('calculateStats', () => {
  it('returns zeros for no applications (no divide-by-zero)', () => {
    expect(calculateStats([], NOW)).toEqual({ total: 0, responseRate: 0, interviewsThisWeek: 0 })
  })

  it('counts anything past "Applied" as a response, rounded to a whole percentage', () => {
    const apps = [app('Applied'), app('Interviewing'), app('Rejected')]
    expect(calculateStats(apps, NOW)).toMatchObject({ total: 3, responseRate: 67 })
  })

  it('counts interviews from Monday to Sunday of the current week only', () => {
    const apps = [
      app('Interviewing', { interviewDate: '2024-01-08' }), // Monday: in
      app('Interviewing', { interviewDate: '2024-01-14' }), // Sunday: in
      app('Interviewing', { interviewDate: '2024-01-07' }), // previous Sunday: out
      app('Interviewing', { interviewDate: '2024-01-15' }), // next Monday: out
      app('Applied'), // no interview date
    ]
    expect(calculateStats(apps, NOW).interviewsThisWeek).toBe(2)
  })
})

describe('statusDistribution', () => {
  it('lists every status in board order, with zeros', () => {
    expect(statusDistribution([app('Offer'), app('Offer'), app('Applied')])).toEqual([
      { status: 'Applied', count: 1 },
      { status: 'Interviewing', count: 0 },
      { status: 'Offer', count: 2 },
      { status: 'Rejected', count: 0 },
    ])
  })
})

describe('applicationsPerWeek', () => {
  it('buckets by Monday-start week, oldest first, filling gaps with zero', () => {
    const apps = [
      app('Applied', { dateApplied: '2024-01-08' }),
      app('Applied', { dateApplied: '2024-01-14' }),
      app('Applied', { dateApplied: '2023-12-26' }),
    ]
    const result = applicationsPerWeek(apps, 3, NOW)
    expect(result.map((b) => [b.weekStart, b.count])).toEqual([
      ['2023-12-25', 1],
      ['2024-01-01', 0],
      ['2024-01-08', 2],
    ])
  })

  it('ignores applications older than the window', () => {
    const result = applicationsPerWeek([app('Applied', { dateApplied: '2023-01-01' })], 3, NOW)
    expect(result.every((b) => b.count === 0)).toBe(true)
  })
})
