import { Box, Fade, Typography } from '@mui/material'
import AppIcon from './AppIcon'

export default function EmptyState({ title, children, compact = false, icon = 'inbox' }) {
  return (
    <Fade in appear timeout={500}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'text.secondary',
          py: compact ? 3 : 8,
          ...(!compact && { border: '2px dashed', borderColor: 'divider', borderRadius: 3 }),
        }}
      >
        <Box sx={{ mb: 1, opacity: 0.6 }}>
          <AppIcon name={icon} size={compact ? 26 : 40} />
        </Box>
        <Typography fontWeight={600} color="text.primary">
          {title}
        </Typography>
        {children && (
          <Typography variant="body2" sx={{ mt: 0.5 }} component="div">
            {children}
          </Typography>
        )}
      </Box>
    </Fade>
  )
}
