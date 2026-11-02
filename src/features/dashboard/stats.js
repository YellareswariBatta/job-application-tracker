import { STATUSES } from '../applications/constants'
import { addDays, formatDate, startOfWeekISO, todayISO } from '../../lib/dates'

/**
 * Headline numbers.
 * - responseRate: whole-number % of applications that moved past "Applied".
 * - interviewsThisWeek: interviews dated Monday–Sunday of the current week.
 */
export function calculateStats(applications, now = new Date()) {
  const total = applications.length
  const responded = applications.filter((app) => app.status !== 'Applied').length
  const responseRate = total === 0 ? 0 : Math.round((responded / total) * 100)

  const weekStart = startOfWeekISO(todayISO(now))
  const weekEnd = addDays(weekStart, 6)
  const interviewsThisWeek = applications.filter(
    (app) => app.interviewDate && app.interviewDate >= weekStart && app.interviewDate <= weekEnd,
  ).length

  return { total, responseRate, interviewsThisWeek }
}

/** One entry per status (including zeros) so the order is stable. */
export function statusDistribution(applications) {
  return STATUSES.map((status) => ({
    status,
    count: applications.filter((app) => app.status === status).length,
  }))
}

/** Applications per week for the last `weeks` weeks, oldest first, gaps filled with 0. */
export function applicationsPerWeek(applications, weeks = 8, now = new Date()) {
  const currentWeek = startOfWeekISO(todayISO(now))
  const buckets = Array.from({ length: weeks }, (_, i) => {
    const weekStart = addDays(currentWeek, -7 * (weeks - 1 - i))
    return { weekStart, label: formatDate(weekStart).replace(/ \d{4}$/, ''), count: 0 }
  })
  const byStart = new Map(buckets.map((b) => [b.weekStart, b]))
  for (const app of applications) {
    const bucket = byStart.get(startOfWeekISO(app.dateApplied))
    if (bucket) bucket.count += 1
  }
  return buckets
}
