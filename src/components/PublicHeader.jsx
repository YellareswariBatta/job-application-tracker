import { Link } from 'react-router-dom'
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import { useAuth } from '../features/auth/AuthContext'
import PaletteMenu from '../features/theme/PaletteMenu'
import ThemeToggle from '../features/theme/ThemeToggle'
import AppIcon from './AppIcon'

/** Header for pages anyone can see: brand on the left, login/sign-up (or "Open board") on the right. */
export default function PublicHeader({ hideAuthButtons = false }) {
  const { user } = useAuth()

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ color: '#fff', backgroundImage: (t) => t.custom.gradient, backgroundSize: '200% 200%', animation: 'gradient-shift 16s ease infinite' }}
    >
      <Toolbar sx={{ gap: 1, maxWidth: 1280, width: '100%', mx: 'auto' }}>
        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
          <Box className="float-y" sx={{ display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,.22)' }}>
            <AppIcon name="briefcase" size={22} />
          </Box>
          <Typography variant="h6" fontWeight={800} letterSpacing={-0.3}>
            Job Tracker
          </Typography>
        </Box>
        <PaletteMenu />
        <ThemeToggle />
        {!hideAuthButtons &&
          (user ? (
            <Button component={Link} to="/board" variant="contained" sx={whiteButton} endIcon={<AppIcon name="arrowRight" size={18} />}>
              Open board
            </Button>
          ) : (
            <>
              <Button component={Link} to="/login" color="inherit" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                Log in
              </Button>
              <Button component={Link} to="/register" variant="contained" sx={whiteButton}>
                Sign up
              </Button>
            </>
          ))}
      </Toolbar>
    </AppBar>
  )
}

const whiteButton = {
  bgcolor: '#fff',
  color: 'primary.main',
  backgroundImage: 'none',
  '&:hover': { bgcolor: '#fff', backgroundImage: 'none', filter: 'none', transform: 'scale(1.05)' },
}
