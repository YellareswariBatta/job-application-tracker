import { createContext, useContext, useMemo } from 'react'
import { alpha, createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useTheme } from './useTheme'
import { DEFAULT_PALETTE, PALETTES } from './palettes'

const ThemeModeContext = createContext(null)

const FALLBACK_FONTS = 'ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif'
const BODY_FONT = `"Plus Jakarta Sans Variable", ${FALLBACK_FONTS}`
const HEADING_FONT = `"Sora Variable", ${FALLBACK_FONTS}`

const buildTheme = (mode, palette) => {
  const primary = mode === 'dark' ? palette.dark : palette.main
  return createTheme({
    palette: {
      mode,
      primary: { main: primary },
      background:
        mode === 'dark' ? { default: '#0b1020', paper: '#131a2e' } : { default: '#f5f7fb', paper: '#ffffff' },
    },
    // Non-standard keys are kept by createTheme; components read them as theme.custom.
    custom: {
      gradient: palette.gradient,
      // Soft colour glows behind the page content.
      glow: `radial-gradient(700px circle at 0% 0%, ${alpha(primary, mode === 'dark' ? 0.18 : 0.12)}, transparent 60%),
             radial-gradient(600px circle at 100% 10%, ${alpha('#ec4899', mode === 'dark' ? 0.1 : 0.07)}, transparent 55%)`,
    },
    shape: { borderRadius: 12 },
    typography: {
      // Plus Jakarta Sans for reading text, Sora for headings: bundled via @fontsource (no external requests).
      fontFamily: BODY_FONT,
      ...Object.fromEntries(
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((h) => [h, { fontFamily: HEADING_FONT, letterSpacing: '-0.02em' }]),
      ),
      subtitle1: { fontFamily: HEADING_FONT, fontWeight: 600 },
      subtitle2: { fontFamily: HEADING_FONT, fontWeight: 600 },
      button: { fontFamily: BODY_FONT, textTransform: 'none', fontWeight: 700, letterSpacing: '0.005em' },
      body1: { lineHeight: 1.65 },
      body2: { lineHeight: 1.6 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          containedPrimary: ({ theme }) => ({
            backgroundImage: theme.custom.gradient,
            transition: 'filter .2s, box-shadow .2s, translate .2s',
            '&:hover': { filter: 'brightness(1.1)', boxShadow: theme.shadows[6], translate: '0 -1px' },
          }),
        },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 14 },
          // Browsers paint autofilled fields pale blue; keep them in the app's own colours instead.
          input: ({ theme }) => ({
            '&:-webkit-autofill': {
              WebkitBoxShadow: `0 0 0 100px ${theme.palette.background.paper} inset`,
              WebkitTextFillColor: theme.palette.text.primary,
              caretColor: theme.palette.text.primary,
              borderRadius: 'inherit',
            },
          }),
        },
      },
    },
  })
}

/** Single source of truth for light/dark and the colour palette; drives MUI, Tailwind's `dark` class and storage. */
export default function AppThemeProvider({ children }) {
  const { theme, toggleTheme } = useTheme()
  const [storedPalette, setPaletteKey] = useLocalStorage('jat.palette', DEFAULT_PALETTE)
  const paletteKey = PALETTES[storedPalette] ? storedPalette : DEFAULT_PALETTE

  const muiTheme = useMemo(() => buildTheme(theme, PALETTES[paletteKey]), [theme, paletteKey])
  const value = useMemo(
    () => ({ theme, toggleTheme, paletteKey, setPaletteKey }),
    [theme, toggleTheme, paletteKey, setPaletteKey],
  )

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext)
  if (!ctx) throw new Error('useThemeMode must be used inside <AppThemeProvider>')
  return ctx
}
