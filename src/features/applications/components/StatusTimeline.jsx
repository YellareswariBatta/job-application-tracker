import { Box, Typography } from '@mui/material'
import { formatDate } from '../../../lib/dates'
import { STATUS_STYLES } from '../constants'

/** Newest-first list of every status the application has been through. */
export default function StatusTimeline({ application }) {
  // Older data has no history, so fall back to one entry for the current status.
  const entries = application.history?.length
    ? application.history
    : [{ status: application.status, at: application.updatedAt }]
  const newestFirst = [...entries].reverse()

  return (
    <Box component="ol" aria-label="Status history" sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {newestFirst.map((entry, index) => {
        const colour = STATUS_STYLES[entry.status].chart
        const isLast = index === newestFirst.length - 1
        return (
          <Box component="li" key={`${entry.status}-${entry.at}`} sx={{ position: 'relative', display: 'flex', gap: 2, pb: isLast ? 0 : 2.5 }}>
            {/* The dot, plus a line joining it to the next (older) entry. */}
            <Box sx={{ position: 'relative', width: 14, flexShrink: 0 }}>
              <Box sx={{ width: 14, height: 14, mt: 0.5, borderRadius: '50%', bgcolor: colour, boxShadow: `0 0 0 4px ${colour}33` }} />
              {!isLast && <Box sx={{ position: 'absolute', top: 22, bottom: -18, left: 6, width: 2, bgcolor: 'divider' }} />}
            </Box>
            <div>
              <Typography fontWeight={700} sx={{ lineHeight: 1.4 }}>
                {entry.status}
                {index === 0 && (
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    current
                  </Typography>
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(entry.at.slice(0, 10))}
              </Typography>
            </div>
          </Box>
        )
      })}
    </Box>
  )
}
