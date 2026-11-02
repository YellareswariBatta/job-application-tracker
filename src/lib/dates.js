// All dates are stored as local calendar days in "YYYY-MM-DD" form.

const pad = (n) => String(n).padStart(2, '0')

export function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function todayISO(now = new Date()) {
  return toISODate(now)
}

// Parse as a local date (new Date('2024-01-05') would be UTC and can shift a day).
export function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function isValidISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  // Round-trip catches impossible dates such as 2024-02-31.
  return toISODate(parseISODate(value)) === value
}

export function addDays(iso, days) {
  const date = parseISODate(iso)
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

// Weeks start on Monday (UK convention).
export function startOfWeekISO(iso) {
  const date = parseISODate(iso)
  const daysSinceMonday = (date.getDay() + 6) % 7
  return addDays(iso, -daysSinceMonday)
}

export function formatDate(iso) {
  if (!iso) return ''
  return parseISODate(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ISO strings compare correctly as plain strings.
export const isOverdue = (iso, today) => Boolean(iso) && iso < today
export const isDueToday = (iso, today) => Boolean(iso) && iso === today
