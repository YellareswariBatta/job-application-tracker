import { useCallback, useRef, useState } from 'react'

// Reads and parses a key. Never throws: corrupt JSON or blocked storage
// falls back to the initial value and reports the problem via `error`.
function readStorage(key, initialValue) {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return { value: initialValue, error: null }
    return { value: JSON.parse(raw), error: null }
  } catch {
    return {
      value: initialValue,
      error: `Saved data for "${key}" could not be read and has been ignored.`,
    }
  }
}

/**
 * useState that persists to localStorage.
 * Returns [value, setValue, error]. setValue accepts a value or an updater function.
 */
export function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => readStorage(key, initialValue))
  const [writeError, setWriteError] = useState(null)
  // Always holds the newest value, so two updates in the same tick build on each other
  // and the write happens here rather than inside a state updater (which React may run twice).
  const latest = useRef(state.value)

  const setValue = useCallback(
    (next) => {
      const value = typeof next === 'function' ? next(latest.current) : next
      latest.current = value
      setState({ value, error: null })
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
        setWriteError(null)
      } catch {
        // Usually a full quota or private mode; keep working in memory.
        setWriteError('Changes could not be saved to this browser.')
      }
    },
    [key],
  )

  return [state.value, setValue, writeError ?? state.error]
}
