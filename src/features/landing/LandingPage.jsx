import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Box, Button, Container, Paper, Typography } from '@mui/material'
import AppIcon, { STATUS_ICONS } from '../../components/AppIcon'
import { BannerBubbles, PageBubbles } from '../../components/Bubbles'
import CompanyAvatar from '../../components/CompanyAvatar'
import PublicHeader from '../../components/PublicHeader'
import { usePageTitle } from '../../hooks/usePageTitle'
import Magnetic from '../../components/magic/Magnetic'
import Reveal from '../../components/magic/Reveal'
import TiltCard from '../../components/magic/TiltCard'
import { STATUS_STYLES } from '../applications/constants'
import { useAuth } from '../auth/AuthContext'

const FEATURES = [
  { icon: 'kanban', title: 'Drag-and-drop board', text: 'Move applications between Applied, Interviewing, Offer and Rejected with a simple drag.', gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
  { icon: 'chartPie', title: 'Insightful dashboard', text: 'See your response rate, weekly activity and status mix at a glance.', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)' },
  { icon: 'bellRing', title: 'Follow-up reminders', text: 'Never forget to chase. Due and overdue follow-ups are highlighted for you.', gradient: 'linear-gradient(135deg,#f97316,#ec4899)' },
  { icon: 'target', title: 'Weekly goals', text: 'Set a target for applications each week and watch your progress ring fill.', gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
  { icon: 'fileJson', title: 'Import and export', text: 'Back up everything as a JSON file, or drop a file onto the page to restore it.', gradient: 'linear-gradient(135deg,#0ea5e9,#6366f1)' },
  { icon: 'scale', title: 'Compare offers fairly', text: 'See the real hourly value of each offer once commute, holiday, bonus and pension are counted.', gradient: 'linear-gradient(135deg,#8b5cf6,#ec4899)' },
  { icon: 'clipboardPaste', title: 'Paste a job advert', text: 'Drop in an advert to pre-fill the form and see which keywords your CV is missing. All done locally.', gradient: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
  { icon: 'calendarPlus', title: 'Calendar and spreadsheet export', text: 'Send interviews and follow-ups to your calendar, or open everything in Excel. Undo any slip.', gradient: 'linear-gradient(135deg,#f43f5e,#f97316)' },
  { icon: 'shieldCheck', title: 'Private by design', text: 'Your data stays in your browser behind your own login. No servers, no tracking.', gradient: 'linear-gradient(135deg,#14b8a6,#22c55e)' },
]

const STEPS = [
  { icon: 'userPlus', title: 'Create your account', text: 'Sign up in seconds with an email and a strong password.' },
  { icon: 'plus', title: 'Add your applications', text: 'Record company, role, salary, links, notes and follow-up dates.' },
  { icon: 'trophy', title: 'Track your way to an offer', text: 'Drag cards forward as you progress, and celebrate when the offer arrives.' },
]

// Static sample cards for the hero preview. Not real user data.
const PREVIEW = [
  { status: 'Applied', company: 'Northwind Digital', role: 'Frontend Developer' },
  { status: 'Interviewing', company: 'Bluebird Labs', role: 'Product Engineer' },
  { status: 'Offer', company: 'Harbour & Co', role: 'Software Engineer' },
]

function PreviewBoard() {
  return (
    <Box sx={{ position: 'relative', display: 'grid', gap: 1.5, gridTemplateColumns: 'repeat(3, 1fr)', p: 2, borderRadius: 4, bgcolor: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.3)', backdropFilter: 'blur(10px)' }}>
      {PREVIEW.map((item, i) => {
        const accent = STATUS_STYLES[item.status].chart
        return (
          <Box key={item.status}>
            <Typography variant="caption" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, color: '#fff' }}>
              <AppIcon name={STATUS_ICONS[item.status]} size={14} /> {item.status}
            </Typography>
            <Paper
              className="float-y"
              sx={{ p: 1.25, borderRadius: 2.5, borderLeft: `4px solid ${accent}`, animationDelay: `${i * 0.7}s`, boxShadow: 6 }}
            >
              <CompanyAvatar name={item.company} size={26} />
              <Typography variant="caption" fontWeight={700} noWrap sx={{ display: 'block', mt: 0.75 }}>
                {item.company}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                {item.role}
              </Typography>
            </Paper>
          </Box>
        )
      })}
    </Box>
  )
}

const ghostButton = {
  color: '#fff',
  borderColor: 'rgba(255,255,255,.65)',
  borderWidth: 2,
  '&:hover': { borderColor: '#fff', borderWidth: 2, bgcolor: 'rgba(255,255,255,.16)' },
}

// What the project is built with, shown as chips for anyone reviewing the code.
const TECH = [
  { name: 'React 18', icon: 'zap' },
  { name: 'Vite', icon: 'rocket' },
  { name: 'Material UI', icon: 'palette' },
  { name: 'Tailwind CSS', icon: 'sparkles' },
  { name: 'React Router', icon: 'arrowRight' },
  { name: 'dnd-kit', icon: 'gripVertical' },
  { name: 'React Hook Form + Zod', icon: 'check' },
  { name: 'Recharts', icon: 'chartPie' },
  { name: 'Web Crypto (PBKDF2)', icon: 'lock' },
  { name: 'Vitest + Testing Library', icon: 'shieldCheck' },
]

// Short, checkable claims about the engineering.
const HIGHLIGHTS = [
  { icon: 'shieldCheck', title: 'Secure by design', text: 'Salted PBKDF2 password hashing, login lockout, idle session expiry and per-user data.' },
  { icon: 'check', title: 'Validated and tested', text: 'Zod schemas on every form and import, with unit and component tests across the app.' },
  { icon: 'kanban', title: 'Accessible interactions', text: 'Drag and drop works with a keyboard, with clear focus states and reduced-motion support.' },
  { icon: 'zap', title: 'Fast and private', text: 'Code-split routes, no backend and no tracking. Everything runs in your browser.' },
]

export default function LandingPage() {
  usePageTitle()
  const { user, startDemo } = useAuth()
  const navigate = useNavigate()
  const [demoLoading, setDemoLoading] = useState(false)

  async function openDemo() {
    setDemoLoading(true)
    const result = await startDemo()
    setDemoLoading(false)
    if (result.ok) navigate('/board')
  }

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', backgroundImage: (t) => t.custom.glow, backgroundAttachment: 'fixed' }}>
      <PageBubbles />
      <PublicHeader />

      <Box component="main" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 6 } }}>
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 6,
              color: '#fff',
              p: { xs: 3, sm: 5, md: 7 },
              backgroundImage: (t) => t.custom.gradient,
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 14s ease infinite',
              boxShadow: '0 24px 60px -20px rgba(0,0,0,.45)',
              display: 'grid',
              gap: 5,
              alignItems: 'center',
              gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
            }}
          >
            <BannerBubbles />
            <Box sx={{ position: 'relative' }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.5, mb: 2, borderRadius: 99, bgcolor: 'rgba(255,255,255,.2)', fontSize: 13, fontWeight: 600 }}>
                <AppIcon name="sparkles" size={14} /> Free, private and runs in your browser
              </Box>
              <Typography variant="h2" component="h1" fontWeight={800} letterSpacing={-1.5} sx={{ fontSize: { xs: '2.25rem', md: '3.4rem' }, lineHeight: 1.05 }}>
                Land your <span className="text-shine">next role</span>, one application at a time.
              </Typography>
              <Typography sx={{ mt: 2, fontSize: { xs: 16, md: 18 }, opacity: 0.93, maxWidth: 520 }}>
                Track every application on a colourful drag-and-drop board, stay on top of follow-ups and see your progress at a glance.
              </Typography>
              <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
                <Magnetic>
                  <Button
                    component={Link}
                    to={user ? '/board' : '/register'}
                    size="large"
                    variant="contained"
                    endIcon={<AppIcon name="arrowRight" size={20} />}
                    sx={{ bgcolor: '#fff', color: 'primary.main', backgroundImage: 'none', px: 3, '&:hover': { bgcolor: '#fff', backgroundImage: 'none', filter: 'none', transform: 'scale(1.05)' } }}
                  >
                    {user ? 'Open your board' : 'Get started free'}
                  </Button>
                </Magnetic>
                {!user && (
                  <>
                    <Button
                      size="large"
                      variant="outlined"
                      disabled={demoLoading}
                      onClick={openDemo}
                      startIcon={<AppIcon name="sparkles" size={20} />}
                      sx={ghostButton}
                    >
                      {demoLoading ? 'Loading demo…' : 'Try the live demo'}
                    </Button>
                    <Button component={Link} to="/login" size="large" variant="text" sx={{ color: '#fff', opacity: 0.9, '&:hover': { bgcolor: 'rgba(255,255,255,.14)' } }}>
                      Log in
                    </Button>
                  </>
                )}
              </Box>
            </Box>
            <PreviewBoard />
          </Box>
        </Container>

        {/* Features */}
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Reveal>
            <Typography variant="h4" component="h2" fontWeight={800} textAlign="center" letterSpacing={-0.5}>
              Everything you need to stay organised
            </Typography>
            <Typography color="text.secondary" textAlign="center" sx={{ mt: 1, mb: 5 }}>
              Simple tools that make a long job search feel manageable.
            </Typography>
          </Reveal>
          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' } }}>
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 110}>
                <TiltCard>
                  <Paper variant="outlined" sx={{ p: 3, height: '100%', borderRadius: 4, boxShadow: 1 }}>
                    <Box sx={{ display: 'grid', placeItems: 'center', width: 50, height: 50, mb: 2, borderRadius: 3, color: '#fff', backgroundImage: f.gradient, boxShadow: 3 }}>
                      <AppIcon name={f.icon} size={24} />
                    </Box>
                    <Typography variant="h6" component="h3" fontWeight={700}>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                      {f.text}
                    </Typography>
                  </Paper>
                </TiltCard>
              </Reveal>
            ))}
          </Box>
        </Container>

        {/* How it works */}
        <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 10 } }}>
          <Reveal>
            <Typography variant="h4" component="h2" fontWeight={800} textAlign="center" letterSpacing={-0.5} sx={{ mb: 5 }}>
              How it works
            </Typography>
          </Reveal>
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 150} sx={{ textAlign: 'center', px: 2 }}>
                <Box sx={{ position: 'relative', display: 'inline-grid', placeItems: 'center', width: 72, height: 72, mb: 2, borderRadius: '50%', color: '#fff', backgroundImage: (t) => t.custom.gradient, boxShadow: 5 }}>
                  <AppIcon name={s.icon} size={30} />
                  <Box sx={{ position: 'absolute', top: -4, right: -4, width: 26, height: 26, display: 'grid', placeItems: 'center', borderRadius: '50%', bgcolor: 'background.paper', color: 'text.primary', fontSize: 13, fontWeight: 800, boxShadow: 2 }}>
                    {i + 1}
                  </Box>
                </Box>
                <Typography variant="h6" component="h3" fontWeight={700}>
                  {s.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  {s.text}
                </Typography>
              </Reveal>
            ))}
          </Box>
        </Container>

        {/* Engineering highlights and tech stack */}
        <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 10 } }}>
          <Reveal>
            <Typography variant="h4" component="h2" fontWeight={800} textAlign="center" letterSpacing={-0.5}>
              Built with care
            </Typography>
            <Typography color="text.secondary" textAlign="center" sx={{ mt: 1, mb: 5 }}>
              A production-style front-end project, from validation to security to polish.
            </Typography>
          </Reveal>
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' } }}>
            {HIGHLIGHTS.map((h, i) => (
              <Reveal key={h.title} delay={i * 100}>
                <Box sx={{ height: '100%', p: 3, borderRadius: 4, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Box sx={{ color: 'primary.main', mb: 1.5 }}>
                    <AppIcon name={h.icon} size={28} />
                  </Box>
                  <Typography fontWeight={700}>{h.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                    {h.text}
                  </Typography>
                </Box>
              </Reveal>
            ))}
          </Box>
          <Reveal delay={150}>
            <Box sx={{ mt: 5, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.5 }}>
              {TECH.map((t) => (
                <Box
                  key={t.name}
                  sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderRadius: 99, border: 1, borderColor: 'divider', bgcolor: 'background.paper', fontSize: 14, fontWeight: 600, transition: 'translate .2s, box-shadow .2s', '&:hover': { translate: '0 -3px', boxShadow: 4 } }}
                >
                  <Box sx={{ color: 'primary.main', display: 'flex' }}>
                    <AppIcon name={t.icon} size={16} />
                  </Box>
                  {t.name}
                </Box>
              ))}
            </Box>
          </Reveal>
        </Container>

        {/* Final call to action */}
        {!user && (
          <Container maxWidth="md" sx={{ pb: 8 }}>
            <Box sx={{ position: 'relative', overflow: 'hidden', textAlign: 'center', p: { xs: 4, md: 6 }, borderRadius: 5, color: '#fff', backgroundImage: (t) => t.custom.gradient }}>
              <BannerBubbles />
              <Box sx={{ position: 'relative' }}>
                <Typography variant="h4" component="h2" fontWeight={800}>
                  Ready to get organised?
                </Typography>
                <Typography sx={{ mt: 1, mb: 3, opacity: 0.92 }}>Create a free account and add your first application in under a minute.</Typography>
                <Button component={Link} to="/register" size="large" variant="contained" endIcon={<AppIcon name="arrowRight" size={20} />} sx={{ bgcolor: '#fff', color: 'primary.main', backgroundImage: 'none', '&:hover': { bgcolor: '#fff', backgroundImage: 'none', filter: 'none', transform: 'scale(1.05)' } }}>
                  Create your account
                </Button>
              </Box>
            </Box>
          </Container>
        )}

        <Box component="footer" sx={{ py: 3, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Job Application Tracker · Your data is stored in your browser only.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
