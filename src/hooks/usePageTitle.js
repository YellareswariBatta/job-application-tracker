import { useEffect } from 'react'

const APP_NAME = 'Job Tracker'

/** Sets the browser tab title, e.g. "Dashboard · Job Tracker". Pass nothing for just the app name. */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME
  }, [title])
}
