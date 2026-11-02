import '@testing-library/jest-dom/vitest'
import { webcrypto } from 'node:crypto'

// jsdom has no crypto.subtle (needed for password hashing), so borrow Node's.
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true })
}

// jsdom has no layout engine, so charts (Recharts) need a do-nothing ResizeObserver to mount.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// Newer Node versions ship their own half-working global localStorage that hides jsdom's.
// Swap in a simple in-memory one so tests behave like a browser.
if (typeof globalThis.localStorage?.clear !== 'function') {
  const store = new Map()
  const memoryStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => void store.set(key, String(value)),
    removeItem: (key) => void store.delete(key),
    clear: () => store.clear(),
    key: (index) => [...store.keys()][index] ?? null,
    get length() {
      return store.size
    },
  }
  Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage, configurable: true })
  if (typeof window !== 'undefined') Object.defineProperty(window, 'localStorage', { value: memoryStorage, configurable: true })
}
