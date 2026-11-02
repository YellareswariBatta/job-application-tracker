import { Box, Fade, Paper, Typography } from '@mui/material'
import AppIcon from '../../../components/AppIcon'

const STAGE_COLOURS = ['#3b82f6', '#f59e0b', '#22c55e']

/** The hiring funnel: bars narrowing from Applied to Interviewed to Offered, with conversion percentages. */
export default function FunnelCard({ stages, delay = 0 }) {
  return (
    <Fade in appear timeout={600} style={{ transitionDelay: `${delay}ms` }}>
      <Paper variant="outlined" sx={{ p: 3.5, borderRadius: 5 }}>
        <Typography variant="subtitle1" component="h2" fontWeight={600} sx={{ mb: 0.5 }}>
          Hiring funnel
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          How far your applications get. Rejected ones still count if they reached that stage.
        </Typography>
        <Box component="ol" aria-label="Hiring funnel" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 2.5 }}>
          {stages.map((stage, i) => (
            <li key={stage.stage}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography fontWeight={700}>{stage.stage}</Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>{stage.count}</strong>
                  {stage.percentOfPrevious !== null && ` · ${stage.percentOfPrevious}% of ${stages[i - 1].stage.toLowerCase()}`}
                </Typography>
              </Box>
              {/* Bar width is the share of all applications; a minimum keeps tiny values visible. */}
              <Box sx={{ height: 14, borderRadius: 99, bgcolor: 'action.hover', overflow: 'hidden' }}>
                <Box
                  role="presentation"
                  sx={{
                    height: '100%',
                    width: `${stage.count === 0 ? 0 : Math.max(stage.percentOfApplied, 4)}%`,
                    borderRadius: 99,
                    bgcolor: STAGE_COLOURS[i],
                    transition: 'width 1s cubic-bezier(.2,.8,.2,1)',
                  }}
                />
              </Box>
            </li>
          ))}
        </Box>
        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <AppIcon name="trendingUp" size={16} />
          <Typography variant="caption">
            {stages[2].count > 0
              ? `${stages[2].percentOfApplied}% of all applications became an offer.`
              : 'No offers yet. Interviews are the step that matters most.'}
          </Typography>
        </Box>
      </Paper>
    </Fade>
  )
}
