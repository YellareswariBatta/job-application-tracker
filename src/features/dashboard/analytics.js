import { visitedStatuses } from '../applications/insights'

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * The hiring funnel: how many applications ever reached each stage.
 * Uses history, so a rejected application that got an interview still counts as interviewed.
 */
export function funnel(applications) {
  const total = applications.length
  const interviewed = applications.filter((app) => visitedStatuses(app).has('Interviewing') || visitedStatuses(app).has('Offer')).length
  const offered = applications.filter((app) => visitedStatuses(app).has('Offer')).length

  const percent = (part, whole) => (whole === 0 ? 0 : Math.round((part / whole) * 100))
  return [
    { stage: 'Applied', count: total, percentOfApplied: total === 0 ? 0 : 100, percentOfPrevious: null },
    { stage: 'Interviewed', count: interviewed, percentOfApplied: percent(interviewed, total), percentOfPrevious: percent(interviewed, total) },
    { stage: 'Offered', count: offered, percentOfApplied: percent(offered, total), percentOfPrevious: percent(offered, interviewed) },
  ]
}

/** Average whole days from applying to the first move past "Applied". Null when nothing has moved yet. */
export function averageDaysToResponse(applications) {
  const gaps = []
  for (const app of applications) {
    const history = app.history ?? []
    const start = history.find((entry) => entry.status === 'Applied')
    const reply = history.find((entry) => entry.status !== 'Applied')
    if (!start || !reply) continue
    const days = (new Date(reply.at) - new Date(start.at)) / DAY_MS
    if (days >= 0) gaps.push(days)
  }
  return gaps.length === 0 ? null : Math.round(gaps.reduce((sum, d) => sum + d, 0) / gaps.length)
}

/** Reply rate per source, busiest first. Applications with no source are grouped as "Not set". */
export function bySource(applications) {
  const groups = new Map()
  for (const app of applications) {
    const key = app.source ?? 'Not set'
    const group = groups.get(key) ?? { source: key, total: 0, responded: 0 }
    group.total += 1
    if (visitedStatuses(app).size > 1) group.responded += 1 // moved beyond "Applied" at some point
    groups.set(key, group)
  }
  return [...groups.values()]
    .map((g) => ({ ...g, responseRate: Math.round((g.responded / g.total) * 100) }))
    .sort((a, b) => b.total - a.total || a.source.localeCompare(b.source))
}
