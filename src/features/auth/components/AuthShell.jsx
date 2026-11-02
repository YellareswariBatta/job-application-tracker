import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Box, Button, Divider, Typography } from '@mui/material'
import AppIcon, { STATUS_ICONS } from '../../../components/AppIcon'
import { BannerBubbles, PageBubbles } from '../../../components/Bubbles'
import CompanyAvatar from '../../../components/CompanyAvatar'
import PaletteMenu from '../../theme/PaletteMenu'
import ThemeToggle from '../../theme/ThemeToggle'
import { STATUS_STYLES } from '../../applications/constants'
import { useAuth } from '../AuthContext'

// Copy for the coloured side panel, per page.
const PANEL = {
  login: {
    headline: 'Pick up where you left off.',
    text: 'Your board, reminders and progress are waiting.',
    points: [
      ['kanban', 'Your board, exactly as you left it'],
      ['bellRing', 'Follow-ups that never slip'],
      ['shieldCheck', 'Private to this device'],
    ],
  },
  register: {
    headline: 'Start your search with a plan.',
    text: 'Create a free account in under a minute.',
    points: [
      ['kanban', 'Drag-and-drop application board'],
      ['chartPie', 'Funnel, dashboard and weekly goals'],
      ['scale', 'Fair comparison of job offers'],
    ],
  },
}

// Fictional sample cards that float over the panel. Decorative only.
const FLOATING = [
  { company: 'Northwind Digital', role: 'Frontend Developer', status: 'Interviewing', style: { top: { md: '60%' }, right: { md: '9%' } }, delay: 0 },
  { company: 'Harbour & Co', role: 'Software Engineer', status: 'Offer', style: { top: { md: '76%' }, right: { md: '30%' } }, delay: 1.2 },
]

function FloatingCard({ company, role, status, style, delay }) {
  const accent = STATUS_STYLES[status].chart
  return (
    <Box
      className="float-y"
      sx={{
        position: 'absolute',
        ...style,
        animationDelay: `${delay}s`,
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        gap: 1.5,
        pl: 1.75,
        pr: 2.5,
        py: 1.5,
        borderRadius: 3.5,
        color: '#fff',
        bgcolor: 'rgba(255,255,255,.16)',
        border: '1px solid rgba(255,255,255,.35)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 12px 32px -8px rgba(0,0,0,.35)',
      }}
    >
      <CompanyAvatar name={company} size={38} />
      <div>
        <Typography variant="body2" fontWeight={700} noWrap>
          {company}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.85, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: accent }} />
          {status} · {role}
        </Typography>
      </div>
    </Box>
  )
}

function BrandPanel({ variant }) {
  const copy = PANEL[variant]
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        backgroundImage: (t) => t.custom.gradient,
        backgroundSize: '200% 200%',
        animation: 'gradient-shift 14s ease infinite',
        px: { xs: 3, md: 7 },
        py: { xs: 3, md: 6 },
        minHeight: { md: '100vh' },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <BannerBubbles />
      <Box component={Link} to="/" sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 1.5, color: 'inherit', textDecoration: 'none', width: 'fit-content' }}>
        <Box className="float-y" sx={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 3, bgcolor: 'rgba(255,255,255,.22)' }}>
          <AppIcon name="briefcase" size={24} />
        </Box>
        <Typography variant="h6" fontWeight={800} letterSpacing={-0.3}>
          Job Tracker
        </Typography>
      </Box>

      <Box sx={{ position: 'relative', my: { xs: 3, md: 'auto' }, maxWidth: 440 }}>
        <Typography component="h2" className="page-enter" sx={{ fontFamily: '"Sora Variable", sans-serif', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08, fontSize: { xs: '1.75rem', md: '2.9rem' } }}>
          {copy.headline}
        </Typography>
        <Typography className="page-enter" sx={{ mt: 1.5, opacity: 0.92, fontSize: { xs: 15, md: 17 }, animationDelay: '.1s' }}>
          {copy.text}
        </Typography>
        <Box component="ul" sx={{ display: { xs: 'none', md: 'grid' }, gap: 2, listStyle: 'none', m: 0, mt: 5, p: 0 }}>
          {copy.points.map(([icon, label], i) => (
            <Box component="li" key={label} className="page-enter" sx={{ display: 'flex', alignItems: 'center', gap: 1.75, animationDelay: `${0.2 + i * 0.12}s` }}>
              <Box sx={{ display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.3)' }}>
                <AppIcon name={icon} size={18} />
              </Box>
              <Typography fontWeight={600}>{label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {FLOATING.map((card) => (
        <FloatingCard key={card.company} {...card} />
      ))}

      <Typography variant="caption" sx={{ position: 'relative', display: { xs: 'none', md: 'block' }, opacity: 0.8 }}>
        Your data stays in this browser. Nothing is sent to a server.
      </Typography>
    </Box>
  )
}

/**
 * Split-screen layout for the login and sign-up pages: a coloured brand panel beside a clean form.
 * `variant` is "login" or "register" and picks the panel wording.
 */
export default function AuthShell({ variant = 'login', title, subtitle, children, footer }) {
  const { startDemo } = useAuth()
  const navigate = useNavigate()
  const [demoLoading, setDemoLoading] = useState(false)

  async function openDemo() {
    setDemoLoading(true)
    const result = await startDemo()
    setDemoLoading(false)
    if (result.ok) navigate('/board')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(360px, 5fr) 6fr' },
        gridTemplateRows: { xs: 'auto 1fr', md: '1fr' },
        bgcolor: 'background.default',
      }}
    >
      <BrandPanel variant={variant} />

      <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', backgroundImage: (t) => t.custom.glow, overflow: 'hidden' }}>
        <PageBubbles />
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: { xs: 2, md: 4 }, py: 2 }}>
          <Button component={Link} to="/" color="inherit" startIcon={<AppIcon name="arrowLeft" size={18} />} sx={{ color: 'text.secondary' }}>
            Back to home
          </Button>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <PaletteMenu />
            <ThemeToggle />
          </Box>
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1, flex: 1, display: 'grid', placeItems: 'center', px: { xs: 2.5, sm: 4 }, py: { xs: 3, md: 4 } }}>
          <Box className="pop-in" sx={{ width: '100%', maxWidth: 440 }}>
            <Typography variant="h4" component="h1" fontWeight={800} letterSpacing={-0.5}>
              {title}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75, mb: 3.5 }}>
              {subtitle}
            </Typography>

            {children}

            <Divider sx={{ my: 3, color: 'text.secondary', fontSize: 13 }}>or</Divider>
            <Button
              fullWidth
              size="large"
              variant="outlined"
              color="inherit"
              disabled={demoLoading}
              onClick={openDemo}
              startIcon={<AppIcon name="sparkles" size={18} />}
              sx={{ py: 1.25, borderRadius: 3.5, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
            >
              {demoLoading ? 'Loading demo…' : 'Try the live demo'}
            </Button>

            <Typography color="text.secondary" sx={{ mt: 3, textAlign: 'center', fontSize: 14 }}>
              {footer}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
