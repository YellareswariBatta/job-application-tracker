import { forwardRef } from 'react'
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Slide, Grow, useMediaQuery, useTheme } from '@mui/material'
import AppIcon from './AppIcon'

// Slides up from the bottom on phones, grows from the centre on larger screens.
const SlideUp = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />)
const GrowIn = forwardRef((props, ref) => <Grow ref={ref} {...props} />)

/** MUI Dialog already handles Escape, focus trapping and scroll locking. */
export default function Modal({ title, onClose, children, maxWidth = 'sm' }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Dialog
      open
      onClose={onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth={maxWidth}
      slots={{ transition: isMobile ? SlideUp : GrowIn }}
      aria-label={title}
      slotProps={{ paper: { sx: { overflow: 'hidden' } } }}
    >
      {/* Gradient accent strip matching the header. */}
      <Box sx={{ height: 5, backgroundImage: theme.custom.gradient }} />
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        {title}
        <IconButton onClick={onClose} aria-label="Close">
          <AppIcon name="x" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: '8px !important' }}>{children}</DialogContent>
    </Dialog>
  )
}
