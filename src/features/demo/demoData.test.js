import { applicationSchema } from '../applications/schema'
import { STATUSES } from '../applications/constants'
import { calculateStats } from '../dashboard/stats'
import { isDueToday, isOverdue, todayISO } from '../../lib/dates'
import { staleDays } from '../applications/insights'
import { buildDemoApplications } from './demoData'

// Wednesday, so Monday (start of the current week) is two days earlier.
const NOW = new Date(2026, 5, 10, 9)

describe('buildDemoApplications', () => {
  const apps = buildDemoApplications(NOW)

  it('produces records that pass the real application schema', () => {
    for (const app of apps) {
      const result = applicationSchema.safeParse(app)
      expect(result.success, `${app.company}: ${result.error?.issues[0]?.message}`).toBe(true)
    }
  })

  it('has unique ids and covers every status', () => {
    expect(new Set(apps.map((a) => a.id)).size).toBe(apps.length)
    for (const status of STATUSES) expect(apps.some((a) => a.status === status)).toBe(true)
  })

  it('never dates an application in the future', () => {
    const today = todayISO(NOW)
    expect(apps.every((a) => a.dateApplied <= today)).toBe(true)
  })

  it('has a consistent status history that ends on the current status', () => {
    for (const app of apps) {
      expect(app.history[0].status).toBe('Applied')
      expect(app.history.at(-1).status).toBe(app.status)
      const times = app.history.map((h) => h.at)
      expect([...times].sort()).toEqual(times) // oldest first
    }
  })

  it('includes quiet applications, sources and comparable offers', () => {
    expect(apps.some((a) => staleDays(a, NOW) !== null)).toBe(true)
    expect(apps.every((a) => a.source)).toBe(true)
    expect(apps.filter((a) => a.offer).length).toBeGreaterThanOrEqual(2)
  })

  it('shows off reminders and this-week interviews', () => {
    const today = todayISO(NOW)
    expect(apps.some((a) => isOverdue(a.followUpDate, today))).toBe(true)
    expect(apps.some((a) => isDueToday(a.followUpDate, today))).toBe(true)
    expect(calculateStats(apps, NOW).interviewsThisWeek).toBeGreaterThanOrEqual(2)
  })
})
