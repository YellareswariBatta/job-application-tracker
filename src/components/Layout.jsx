import { Suspense } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Alert, AppBar, Box, Button, Collapse, Container, Toolbar, Typography } from '@mui/material'
import { useApplications } from '../features/applications/ApplicationsContext'
import DataManagement from '../features/data/DataManagement'
import PaletteMenu from '../features/theme/PaletteMenu'
import ThemeToggle from '../features/theme/ThemeToggle'
import UndoSnackbar from '../features/applications/components/UndoSnackbar'
import DemoBanner from '../features/demo/DemoBanner'
import UserMenu from '../features/auth/components/UserMenu'
import AppIcon from './AppIcon'
import PageLoader from './PageLoader'
import { PageBubbles } from './Bubbles'

function NavButton({ to, end, icon, children }) {
  return (
    <Button
      component={NavLink}
      to={to}
      end={end}
      startIcon={<AppIcon name={icon} size={18} />}
      sx={{
        color: '#fff',
        opacity: 0.8,
        px: 1.75,
        transition: 'opacity .2s, background-color .2s',
        '&:hover': { opacity: 1, bgcolor: 'rgba(255,255,255,.14)' },
        '&.active': { opacity: 1, bgcolor: 'rgba(255,255,255,.24)' },
      }}
    >
      {children}
    </Button>
  )
}

export default function Layout() {
  const { storageError } = useApplications()
  const location = useLocation()

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', backgroundImage: (t) => t.custom.glow, backgroundAttachment: 'fixed' }}>
      <PageBubbles />
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          color: '#fff',
          backgroundImage: (t) => t.custom.gradient,
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 16s ease infinite',
          boxShadow: '0 4px 20px rgba(0,0,0,.18)',
          transition: 'background-image .4s',
        }}
      >
        <Toolbar sx={{ flexWrap: 'wrap', gap: 1, maxWidth: 1536, width: '100%', mx: 'auto' }}>
          {/* The logo and name also take you home. */}
          <Box component={Link} to="/" aria-label="Job Tracker home" sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mr: 2, color: 'inherit', textDecoration: 'none' }}>
            <Box className="float-y" sx={{ display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,.22)', backdropFilter: 'blur(6px)' }}>
              <AppIcon name="briefcase" size={22} />
            </Box>
            <Typography variant="h6" fontWeight={800} letterSpacing={-0.3}>
              Job Tracker
            </Typography>
          </Box>
          <Box component="nav" aria-label="Main" sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
            <NavButton to="/" end icon="house">Home</NavButton>
            <NavButton to="/board" icon="kanban">Board</NavButton>
            <NavButton to="/dashboard" icon="barChart">Dashboard</NavButton>
            <NavButton to="/offers" icon="scale">Offers</NavButton>
          </Box>
          <DataManagement />
          <PaletteMenu />
          <ThemeToggle />
          <UserMenu />
        </Toolbar>
      </AppBar>

      <DemoBanner />
      <UndoSnackbar />

      <Collapse in={Boolean(storageError)}>
        <Alert severity="warning" variant="filled" sx={{ borderRadius: 0, justifyContent: 'center' }}>
          {storageError}
        </Alert>
      </Collapse>

      <Container maxWidth="xl" component="main" sx={{ position: 'relative', zIndex: 1, py: 3 }}>
        {/* Re-keyed per route so every page change fades and slides in. */}
        <div key={location.pathname} className="page-enter">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </Container>
    </Box>
  )
}
