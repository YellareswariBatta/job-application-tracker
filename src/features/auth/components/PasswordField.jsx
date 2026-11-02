import { useState } from 'react'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import AppIcon from '../../../components/AppIcon'

/** Password input with a leading icon and a show/hide toggle. Accepts the same props as TextField. */
export default function PasswordField({ autoComplete, icon = 'lock', ...props }) {
  const [visible, setVisible] = useState(false)
  return (
    <TextField
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      fullWidth
      {...props}
      slotProps={{
        // Always-raised label so it never sits on top of the leading icon.
        inputLabel: { shrink: true },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <AppIcon name={icon} size={18} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                aria-label={visible ? 'Hide password' : 'Show password'}
                onClick={() => setVisible((v) => !v)}
                onMouseDown={(e) => e.preventDefault()} // keeps focus in the field
              >
                <AppIcon name={visible ? 'eyeOff' : 'eye'} size={20} />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  )
}
