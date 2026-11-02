import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { STORAGE_KEY, EXPORT_VERSION } from './constants'
import { moveApplication } from './statusLogic'
import { exportFileSchema } from './schema'

const ApplicationsContext = createContext(null)

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

/**
 * `storageKey` is per user, so accounts never see each other's data.
 * Mount with `key={userId}` so switching account reloads from the right key.
 */
export function ApplicationsProvider({ children, storageKey = STORAGE_KEY }) {
  const [applications, setApplications, storageError] = useLocalStorage(storageKey, [])

  // Always the newest list, so actions fired back to back build on each other.
  const latest = useRef(applications)
  latest.current = applications

  // The most recent undoable change: what to say about it, and the list as it was before.
  const [lastChange, setLastChange] = useState(null)
  const changeCount = useRef(0)

  const save = useCallback(
    (next) => {
      latest.current = next
      setApplications(next)
    },
    [setApplications],
  )

  /** Saves `next` and remembers the old list so the change can be undone. */
  const commit = useCallback(
    (label, next) => {
      if (next === latest.current) return
      changeCount.current += 1
      setLastChange({ id: changeCount.current, label, previous: latest.current })
      save(next)
    },
    [save],
  )

  const undo = useCallback(() => {
    if (!lastChange) return
    save(lastChange.previous)
    setLastChange(null)
  }, [lastChange, save])

  const addApplication = useCallback(
    (fields) => {
      const now = new Date().toISOString()
      const created = {
        ...fields,
        id: newId(),
        createdAt: now,
        updatedAt: now,
        history: [{ status: fields.status, at: now }],
      }
      save([...latest.current, created])
      return created
    },
    [save],
  )

  /** `undoable: false` is for quick inline edits (like the offer comparison) that would flood the undo bar. */
  const updateApplication = useCallback(
    (id, fields, { undoable = true } = {}) => {
      const current = latest.current.find((app) => app.id === id)
      if (!current) return
      const now = new Date().toISOString()
      const statusChanged = fields.status !== undefined && fields.status !== current.status
      const updated = {
        ...current,
        ...fields,
        updatedAt: now,
        ...(statusChanged && { history: [...(current.history ?? []), { status: fields.status, at: now }] }),
      }
      const next = latest.current.map((app) => (app.id === id ? updated : app))
      if (undoable) commit(`Updated ${current.company}`, next)
      else save(next)
    },
    [commit, save],
  )

  const deleteApplication = useCallback(
    (id) => {
      const current = latest.current.find((app) => app.id === id)
      if (!current) return
      commit(`Deleted ${current.company}`, latest.current.filter((app) => app.id !== id))
    },
    [commit],
  )

  const changeStatus = useCallback(
    (id, status, beforeId) => {
      const current = latest.current.find((app) => app.id === id)
      const next = moveApplication(latest.current, id, status, beforeId)
      if (!current || next === latest.current) return
      commit(current.status === status ? 'Reordered cards' : `Moved ${current.company} to ${status}`, next)
    },
    [commit],
  )

  const exportData = useCallback(
    () => JSON.stringify({ version: EXPORT_VERSION, exportedAt: new Date().toISOString(), applications }, null, 2),
    [applications],
  )

  /** Validates JSON text and replaces all data. Returns { ok, count } or { ok: false, error }. */
  const importData = useCallback(
    (text) => {
      let parsed
      try {
        parsed = JSON.parse(text)
      } catch {
        return { ok: false, error: 'The file is not valid JSON.' }
      }
      // Accept either the export format or a bare array of applications.
      const candidate = Array.isArray(parsed) ? { version: EXPORT_VERSION, applications: parsed } : parsed
      const result = exportFileSchema.safeParse(candidate)
      if (!result.success) {
        const issue = result.error.issues[0]
        const where = issue.path.length ? ` (at ${issue.path.join('.')})` : ''
        return { ok: false, error: `Invalid data: ${issue.message}${where}.` }
      }
      const ids = result.data.applications.map((app) => app.id)
      if (new Set(ids).size !== ids.length) return { ok: false, error: 'Invalid data: duplicate application ids.' }
      commit('Replaced all applications with imported data', result.data.applications)
      return { ok: true, count: result.data.applications.length }
    },
    [commit],
  )

  const value = useMemo(
    () => ({
      applications,
      storageError,
      lastChange,
      undo,
      addApplication,
      updateApplication,
      deleteApplication,
      changeStatus,
      exportData,
      importData,
    }),
    [applications, storageError, lastChange, undo, addApplication, updateApplication, deleteApplication, changeStatus, exportData, importData],
  )

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>
}

export function useApplications() {
  const ctx = useContext(ApplicationsContext)
  if (!ctx) throw new Error('useApplications must be used inside <ApplicationsProvider>')
  return ctx
}
