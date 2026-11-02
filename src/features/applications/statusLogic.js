import { STATUSES } from './constants'

/**
 * Moves an application to `newStatus` and returns a new array (input is not mutated).
 * If `beforeId` is given and is in the target column, the card is placed just before it;
 * otherwise it goes to the end of the target column.
 * A real status change is also recorded in the card's history.
 * Returns the original array untouched when nothing would change.
 */
export function moveApplication(applications, id, newStatus, beforeId = null, now = new Date().toISOString()) {
  if (!STATUSES.includes(newStatus)) return applications

  const current = applications.find((app) => app.id === id)
  if (!current || id === beforeId) return applications

  const moved =
    current.status === newStatus
      ? current
      : {
          ...current,
          status: newStatus,
          updatedAt: now,
          history: [...(current.history ?? []), { status: newStatus, at: now }],
        }
  const rest = applications.filter((app) => app.id !== id)

  const beforeIndex = beforeId ? rest.findIndex((app) => app.id === beforeId) : -1
  if (beforeIndex === -1) {
    // Same column, no target card: nothing to reorder.
    if (current.status === newStatus && !beforeId) return applications
    return [...rest, moved]
  }
  return [...rest.slice(0, beforeIndex), moved, ...rest.slice(beforeIndex)]
}

export const groupByStatus = (applications) =>
  Object.fromEntries(STATUSES.map((status) => [status, applications.filter((app) => app.status === status)]))
