// Colour themes the user can pick. `main`/`dark` are the primary colour in light/dark mode;
// `gradient` is used for the header and primary buttons.
export const PALETTES = {
  indigo: {
    label: 'Indigo',
    main: '#4f46e5',
    dark: '#818cf8',
    gradient: 'linear-gradient(115deg, #4f46e5 0%, #7c3aed 55%, #db2777 100%)',
  },
  ocean: {
    label: 'Ocean',
    main: '#0284c7',
    dark: '#38bdf8',
    gradient: 'linear-gradient(115deg, #0369a1 0%, #0891b2 55%, #10b981 100%)',
  },
  emerald: {
    label: 'Emerald',
    main: '#059669',
    dark: '#34d399',
    gradient: 'linear-gradient(115deg, #047857 0%, #0d9488 55%, #0ea5e9 100%)',
  },
  sunset: {
    label: 'Sunset',
    main: '#ea580c',
    dark: '#fb923c',
    gradient: 'linear-gradient(115deg, #f97316 0%, #ec4899 55%, #8b5cf6 100%)',
  },
  rose: {
    label: 'Rose',
    main: '#e11d48',
    dark: '#fb7185',
    gradient: 'linear-gradient(115deg, #be123c 0%, #e11d48 50%, #f97316 100%)',
  },
}

export const DEFAULT_PALETTE = 'indigo'
