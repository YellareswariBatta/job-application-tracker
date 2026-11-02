export const EMPTY_FILTERS = { query: '', status: '', from: '', to: '' }

export const hasActiveFilters = (filters) => Object.values(filters).some(Boolean)

/** Filters by company/role text, status, and an inclusive date-applied range. */
export function filterApplications(applications, { query, status, from, to }) {
  const needle = query.trim().toLowerCase()
  return applications.filter((app) => {
    if (needle && !`${app.company} ${app.role}`.toLowerCase().includes(needle)) return false
    if (status && app.status !== status) return false
    if (from && app.dateApplied < from) return false
    if (to && app.dateApplied > to) return false
    return true
  })
}
