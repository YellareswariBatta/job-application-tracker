import { Box, CircularProgress } from '@mui/material'

/** Centred spinner shown while a lazily loaded page downloads. */
export default function PageLoader() {
  return (
    <Box role="status" aria-label="Loading" sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
      <CircularProgress />
    </Box>
  )
}
