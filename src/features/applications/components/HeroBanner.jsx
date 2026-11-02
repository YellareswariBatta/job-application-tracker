import { Box, Button, Typography } from '@mui/material'
import AppIcon, { STATUS_ICONS } from '../../../components/AppIcon'
import { BannerBubbles } from '../../../components/Bubbles'
import { useCountUp } from '../../../hooks/useCountUp'
import { isDueToday, isOverdue, todayISO } from '../../../lib/dates'
import { STATUSES } from '../constants'
import { staleDays } from '../insights'

const greetingFor = (hour) => (hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening')

/** Glass-style counter pill; the number counts up when it appears. */
function StatPill({ status, count, delay }) {
  const shown = useCountUp(count, 700)
  return (
    <Box
      className="pop-in"
      sx={{
        animationDelay: `${delay}ms`,
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 2,
        py: 1,
        borderRadius: 99,
        bgcolor: 'rgba(255,255,255,.18)',
        border: '1px solid rgba(255,255,255,.3)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <AppIcon name={STATUS_ICONS[status]} size={16} />
      <Typography variant="body2" fontWeight={700} component="span">
        {shown}
      </Typography>
      <Typography variant="caption" component="span" sx={{ opacity: 0.9 }}>
        {status}
      </Typography>
    </Box>
  )
}

/** Welcome banner: greeting, follow-up nudge, per-status counts and the main call to action. */
export default function HeroBanner({ applications, onAdd, onPasteAdvert }) {
  const today = todayISO()
  const dueCount = applications.filter(
    (a) => isOverdue(a.followUpDate, today) || isDueToday(a.followUpDate, today),
  ).length

  const quietCount = applications.filter((a) => staleDays(a) !== null).length

  const message =
    applications.length === 0
      ? 'Add your first application and watch your pipeline come to life.'
      : dueCount > 0
        ? `You have ${dueCount} follow-up${dueCount === 1 ? '' : 's'} to chase today.`
        : quietCount > 0
          ? `${quietCount} application${quietCount === 1 ? ' has' : 's have'} gone quiet. Time for a gentle nudge?`
          : 'You are all caught up. Keep the momentum going!'

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        mb: 3.5,
        p: { xs: 3, sm: 5 },
        borderRadius: 5,
        color: '#fff',
        backgroundImage: (t) => t.custom.gradient,
        backgroundSize: '200% 200%',
        animation: 'gradient-shift 14s ease infinite',
        boxShadow: '0 12px 32px -12px rgba(0,0,0,.35)',
      }}
    >
      <BannerBubbles />
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 1.5 }}>
            {greetingFor(new Date().getHours())}
          </Typography>
          <Typography variant="h4" component="h1" fontWeight={800} letterSpacing={-0.5}>
            Applications
          </Typography>
          <Typography sx={{ mt: 0.5, opacity: 0.92 }}>{message}</Typography>
          <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {STATUSES.map((status, i) => (
              <StatPill
                key={status}
                status={status}
                count={applications.filter((a) => a.status === status).length}
                delay={i * 90}
              />
            ))}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Box className="float-y" sx={{ display: { xs: 'none', md: 'block' }, opacity: 0.9 }}>
            <AppIcon name="rocket" size={72} />
          </Box>
          <Button
            variant="outlined"
            size="large"
            startIcon={<AppIcon name="clipboardPaste" size={20} />}
            onClick={onPasteAdvert}
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,.65)', borderWidth: 2, '&:hover': { borderColor: '#fff', borderWidth: 2, bgcolor: 'rgba(255,255,255,.16)' } }}
          >
            Paste job advert
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<AppIcon name="plus" size={20} />}
            onClick={onAdd}
            sx={{
              bgcolor: '#fff',
              color: 'primary.main',
              backgroundImage: 'none',
              '&:hover': { bgcolor: '#fff', backgroundImage: 'none', filter: 'none', transform: 'scale(1.05)' },
            }}
          >
            Add application
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
