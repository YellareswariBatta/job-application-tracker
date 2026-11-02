import { Box, Fade, LinearProgress, Paper, Typography } from '@mui/material'

/** Which sources actually get replies: share of applications from each that moved past "Applied". */
export default function SourceCard({ sources, delay = 0 }) {
  const known = sources.filter((s) => s.source !== 'Not set')
  // Only rank sources with at least two applications; one reply out of one is not a trend.
  const best = known.filter((s) => s.total >= 2).sort((a, b) => b.responseRate - a.responseRate)[0]

  return (
    <Fade in appear timeout={600} style={{ transitionDelay: `${delay}ms` }}>
      <Paper variant="outlined" sx={{ p: 3.5, borderRadius: 5 }}>
        <Typography variant="subtitle1" component="h2" fontWeight={600} sx={{ mb: 0.5 }}>
          Where replies come from
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {best
            ? `${best.source} has the best reply rate (${best.responseRate}% of ${best.total}).`
            : 'Set a source on your applications to see which channels work.'}
        </Typography>
        <Box component="ul" aria-label="Reply rate by source" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 2.25 }}>
          {sources.map((s) => (
            <li key={s.source}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" fontWeight={600}>
                  {s.source}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {s.responded} of {s.total} replied · {s.responseRate}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={s.responseRate}
                aria-label={`${s.source} reply rate`}
                sx={{ height: 10, borderRadius: 99, bgcolor: 'action.hover' }}
              />
            </li>
          ))}
        </Box>
      </Paper>
    </Fade>
  )
}
