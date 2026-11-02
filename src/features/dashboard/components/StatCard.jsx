import { Box, Grow, Paper, Typography } from '@mui/material'
import AppIcon from '../../../components/AppIcon'
import TiltCard from '../../../components/magic/TiltCard'
import { useCountUp } from '../../../hooks/useCountUp'

/** `delay` (ms) staggers the entrance of a row of cards; `gradient` colours the icon tile. */
export default function StatCard({ label, value, suffix = '', hint, icon, gradient, delay = 0 }) {
  const counted = useCountUp(value ?? 0)
  const shown = value === null || value === undefined ? '—' : counted // "—" when there is nothing to measure yet
  return (
    <Grow in appear timeout={500} style={{ transitionDelay: `${delay}ms` }}>
      <div>
      <TiltCard max={6}>
      <Paper
        variant="outlined"
        sx={{ p: 3, borderRadius: 5, display: 'flex', alignItems: 'center', gap: 2.5, transition: 'box-shadow .2s', '&:hover': { boxShadow: 8 } }}
      >
        <Box sx={{ display: 'grid', placeItems: 'center', width: 60, height: 60, borderRadius: 4, color: '#fff', backgroundImage: gradient, boxShadow: 3, flexShrink: 0 }}>
          <AppIcon name={icon} size={26} />
        </Box>
        <div>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h4" component="p" fontWeight={800} sx={{ lineHeight: 1.2 }}>
            {shown}
            {value === null || value === undefined ? '' : suffix}
          </Typography>
          {hint && (
            <Typography variant="caption" color="text.secondary">
              {hint}
            </Typography>
          )}
        </div>
      </Paper>
      </TiltCard>
      </div>
    </Grow>
  )
}
