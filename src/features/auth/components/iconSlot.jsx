import { InputAdornment } from '@mui/material'
import AppIcon from '../../../components/AppIcon'

/** slotProps for a TextField with a leading icon and an always-raised label. */
export const iconSlot = (iconName) => ({
  inputLabel: { shrink: true },
  input: {
    startAdornment: (
      <InputAdornment position="start">
        <AppIcon name={iconName} size={18} />
      </InputAdornment>
    ),
  },
})
