import { Box, Fade, IconButton, Paper, Typography, useTheme } from '@mui/material'
import AppIcon from '../../../components/AppIcon'
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import { useAuth } from '../../auth/AuthContext'

const SIZE = 150
const STROKE = 14
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Progress ring toward a weekly application goal; the goal is adjustable and remembered. */
export default function WeeklyGoalCard({ appliedThisWeek, delay = 0 }) {
  const { palette, custom } = useTheme()
  const { user } = useAuth()
  const [goal, setGoal] = useLocalStorage(`jat.weeklyGoal.${user.id}`, 5) // per user, like the applications
  const safeGoal = Number.isInteger(goal) && goal > 0 ? goal : 5
  const progress = Math.min(appliedThisWeek / safeGoal, 1)
  const reached = appliedThisWeek >= safeGoal

  return (
    <Fade in appear timeout={600} style={{ transitionDelay: `${delay}ms` }}>
      <Paper variant="outlined" sx={{ p: 3.5, borderRadius: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="subtitle1" component="h2" fontWeight={600} sx={{ alignSelf: 'flex-start' }}>
          Weekly goal
        </Typography>

        <Box sx={{ position: 'relative', width: SIZE, height: SIZE, my: 2 }}>
          <svg width={SIZE} height={SIZE} role="img" aria-label={`${appliedThisWeek} of ${safeGoal} applications this week`}>
            <defs>
              <linearGradient id="goal-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={palette.primary.main} />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke={palette.divider} strokeWidth={STROKE} />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="url(#goal-gradient)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)' }}
            />
          </svg>
          <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
            <div>
              {reached ? (
                <Box className="pop-in" sx={{ color: 'warning.main', display: 'flex', justifyContent: 'center' }}>
                  <AppIcon name="trophy" size={34} />
                </Box>
              ) : (
                <Typography variant="h4" component="p" fontWeight={800} sx={{ lineHeight: 1 }}>
                  {appliedThisWeek}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                of {safeGoal} this week
              </Typography>
            </div>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>
          {reached ? 'Goal reached. Brilliant work!' : `${safeGoal - appliedThisWeek} more to hit your goal.`}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" aria-label="Decrease weekly goal" disabled={safeGoal <= 1} onClick={() => setGoal(safeGoal - 1)}>
            <AppIcon name="minus" size={16} />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.25, borderRadius: 99, color: '#fff', backgroundImage: custom.gradient }}>
            <AppIcon name="target" size={14} />
            <Typography variant="caption" fontWeight={700}>
              Goal {safeGoal}
            </Typography>
          </Box>
          <IconButton size="small" aria-label="Increase weekly goal" disabled={safeGoal >= 50} onClick={() => setGoal(safeGoal + 1)}>
            <AppIcon name="plus" size={16} />
          </IconButton>
        </Box>
      </Paper>
    </Fade>
  )
}
