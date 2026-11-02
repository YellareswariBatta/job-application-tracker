import { Link } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import AppIcon from './AppIcon'
import EmptyState from './EmptyState'
import { usePageTitle } from '../hooks/usePageTitle'

export default function NotFoundPage() {
  usePageTitle('Page not found')
  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', px: 2, py: 10 }}>
      <EmptyState icon="search" title="Page not found">
        That address doesn’t exist. Check it and try again.
        <Box sx={{ mt: 3 }}>
          <Button component={Link} to="/" variant="contained" startIcon={<AppIcon name="house" size={18} />}>
            Home
          </Button>
        </Box>
      </EmptyState>
    </Box>
  )
}
