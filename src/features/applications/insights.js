import { STALE_AFTER_DAYS } from './constants'

const DAY_MS = 24 * 60 * 60 * 1000

/** Every status the application has been in, including its current one. Works for old data without history. */
export function visitedStatuses(app) {
  return new Set(['Applied', app.status, ...(app.history ?? []).map((entry) => entry.status)])
}

/** The time of the most recent change: the last history entry, or `updatedAt` for older data. */
export function lastActivityAt(app) {
  const last = app.history?.length ? app.history[app.history.length - 1].at : app.updatedAt
  return new Date(last)
}

/**
 * Whole days since an Applied or Interviewing application last moved, if that is at least `threshold`.
 * Returns null otherwise (finished applications are never "quiet").
 */
export function staleDays(app, now = new Date(), threshold = STALE_AFTER_DAYS) {
  if (app.status !== 'Applied' && app.status !== 'Interviewing') return null
  const last = lastActivityAt(app)
  if (Number.isNaN(last.getTime())) return null
  const days = Math.floor((now.getTime() - last.getTime()) / DAY_MS)
  return days >= threshold ? days : null
}
