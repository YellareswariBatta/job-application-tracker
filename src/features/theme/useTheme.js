import { useEffect } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'

const systemPrefersDark = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches

/** Theme is remembered in localStorage; the first visit follows the OS setting. */
export function useTheme() {
  const [theme, setTheme] = useLocalStorage('jat.theme', systemPrefersDark() ? 'dark' : 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  return { theme, toggleTheme }
}
