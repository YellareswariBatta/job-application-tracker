import { useState } from 'react'
import { Box, IconButton, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material'
import AppIcon from '../../components/AppIcon'
import { useThemeMode } from './AppThemeProvider'
import { PALETTES } from './palettes'

/** Colour theme picker shown in the header. */
export default function PaletteMenu() {
  const { paletteKey, setPaletteKey } = useThemeMode()
  const [anchor, setAnchor] = useState(null)

  return (
    <>
      <Tooltip title="Colour theme">
        <IconButton color="inherit" aria-label="Colour theme" onClick={(e) => setAnchor(e.currentTarget)}>
          <AppIcon name="palette" />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {Object.entries(PALETTES).map(([key, palette]) => (
          <MenuItem
            key={key}
            selected={key === paletteKey}
            onClick={() => {
              setPaletteKey(key)
              setAnchor(null)
            }}
          >
            <Box sx={{ width: 28, height: 28, mr: 1.5, borderRadius: '50%', backgroundImage: palette.gradient, display: 'grid', placeItems: 'center', color: '#fff' }}>
              {key === paletteKey && <AppIcon name="check" size={16} />}
            </Box>
            <ListItemText>{palette.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
