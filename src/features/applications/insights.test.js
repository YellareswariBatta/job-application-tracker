import { lastActivityAt, staleDays, visitedStatuses } from './insights'

const NOW = new Date('2026-06-30T12:00:00Z')
const daysAgo = (n) => new Date(NOW.getTime() - n * 86_400_000).toISOString()

describe('visitedStatuses', () => {
  it('includes Applied, the current status and everything in the history', () => {
    const app = { status: 'Rejected', history: [{ status: 'Applied', at: 'x' }, { status: 'Interviewing', at: 'y' }, { status: 'Rejected', at: 'z' }] }
    expect([...visitedStatuses(app)].sort()).toEqual(['Applied', 'Interviewing', 'Rejected'])
  })

  it('works for older data that has no history', () => {
    expect([...visitedStatuses({ status: 'Offer' })].sort()).toEqual(['Applied', 'Offer'])
  })
})

describe('lastActivityAt', () => {
  it('uses the newest history entry, else updatedAt', () => {
    expect(lastActivityAt({ updatedAt: '2026-01-01T00:00:00Z', history: [{ status: 'Applied', at: '2026-02-01T00:00:00Z' }] }).toISOString()).toBe('2026-02-01T00:00:00.000Z')
    expect(lastActivityAt({ updatedAt: '2026-01-01T00:00:00Z' }).toISOString()).toBe('2026-01-01T00:00:00.000Z')
  })
})

describe('staleDays', () => {
  const app = (status, days) => ({ status, updatedAt: daysAgo(days), history: [{ status, at: daysAgo(days) }] })

  it('flags Applied and Interviewing applications that have gone quiet', () => {
    expect(staleDays(app('Applied', 20), NOW)).toBe(20)
    expect(staleDays(app('Interviewing', 14), NOW)).toBe(14)
  })

  it('does not flag recent activity', () => {
    expect(staleDays(app('Applied', 13), NOW)).toBeNull()
  })

  it('never flags finished applications', () => {
    expect(staleDays(app('Offer', 90), NOW)).toBeNull()
    expect(staleDays(app('Rejected', 90), NOW)).toBeNull()
  })

  it('ignores a date it cannot read', () => {
    expect(staleDays({ status: 'Applied', updatedAt: 'not a date' }, NOW)).toBeNull()
  })
})
