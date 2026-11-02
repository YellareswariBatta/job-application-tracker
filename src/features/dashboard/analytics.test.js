import { averageDaysToResponse, bySource, funnel } from './analytics'

const entry = (status, at) => ({ status, at })
const app = (status, history, source) => ({ status, history, source })

const apps = [
  app('Applied', [entry('Applied', '2026-01-01T09:00:00Z')], 'LinkedIn'),
  app('Interviewing', [entry('Applied', '2026-01-01T09:00:00Z'), entry('Interviewing', '2026-01-05T09:00:00Z')], 'LinkedIn'),
  app('Rejected', [entry('Applied', '2026-01-01T09:00:00Z'), entry('Interviewing', '2026-01-09T09:00:00Z'), entry('Rejected', '2026-01-20T09:00:00Z')], 'Referral'),
  app('Offer', [entry('Applied', '2026-01-01T09:00:00Z'), entry('Interviewing', '2026-01-03T09:00:00Z'), entry('Offer', '2026-01-10T09:00:00Z')], 'Referral'),
  app('Rejected', [entry('Applied', '2026-01-01T09:00:00Z'), entry('Rejected', '2026-01-02T09:00:00Z')], undefined),
]

describe('funnel', () => {
  it('counts every application that ever reached each stage, even if later rejected', () => {
    const [applied, interviewed, offered] = funnel(apps)
    expect(applied.count).toBe(5)
    expect(interviewed.count).toBe(3) // interviewing + rejected-after-interview + offer
    expect(offered.count).toBe(1)
  })

  it('reports conversion against the start and the previous stage', () => {
    const [, interviewed, offered] = funnel(apps)
    expect(interviewed).toMatchObject({ percentOfApplied: 60, percentOfPrevious: 60 })
    expect(offered).toMatchObject({ percentOfApplied: 20, percentOfPrevious: 33 })
  })

  it('handles no applications without dividing by zero', () => {
    expect(funnel([]).map((s) => s.count)).toEqual([0, 0, 0])
    expect(funnel([])[1].percentOfApplied).toBe(0)
  })

  it('still works for older data with no history', () => {
    const [, interviewed, offered] = funnel([{ status: 'Offer' }, { status: 'Interviewing' }, { status: 'Applied' }])
    expect([interviewed.count, offered.count]).toEqual([2, 1])
  })
})

describe('averageDaysToResponse', () => {
  it('averages the days from applying to the first move', () => {
    // 4 days, 8 days, 2 days, 1 day -> 15 / 4 = 3.75 -> 4
    expect(averageDaysToResponse(apps)).toBe(4)
  })

  it('is null when nothing has moved or there is no history', () => {
    expect(averageDaysToResponse([apps[0]])).toBeNull()
    expect(averageDaysToResponse([{ status: 'Offer' }])).toBeNull()
  })
})

describe('bySource', () => {
  it('groups by source with reply rates, busiest first', () => {
    const result = bySource(apps)
    expect(result).toEqual([
      { source: 'LinkedIn', total: 2, responded: 1, responseRate: 50 },
      { source: 'Referral', total: 2, responded: 2, responseRate: 100 },
      { source: 'Not set', total: 1, responded: 1, responseRate: 100 },
    ])
  })
})
