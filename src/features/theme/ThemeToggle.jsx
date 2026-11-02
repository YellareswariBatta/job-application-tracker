import { IconButton, Tooltip } from '@mui/material'
import AppIcon from '../../components/AppIcon'
import { useThemeMode } from './AppThemeProvider'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeMode()
  const isDark = theme === 'dark'
  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton onClick={toggleTheme} aria-pressed={isDark} aria-label="Dark mode" color="inherit">
        {/* Keyed so the icon spins in each time the theme changes. */}
        <span key={theme} className="theme-icon">
          <AppIcon name={isDark ? 'sun' : 'moon'} />
        </span>
      </IconButton>
    </Tooltip>
  )
}
