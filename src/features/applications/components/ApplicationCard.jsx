import { Link } from 'react-router-dom'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { keyframes } from '@emotion/react'
import { Box, Chip, Typography } from '@mui/material'
import AppIcon from '../../../components/AppIcon'
import CompanyAvatar from '../../../components/CompanyAvatar'
import { formatDate, isDueToday, isOverdue, todayISO } from '../../../lib/dates'
import { formatSalary } from '../format'
import { STATUS_STYLES } from '../constants'
import { staleDays } from '../insights'

// Uses the individual `scale`/`translate` properties so it never fights dnd-kit's inline `transform`.
const cardIn = keyframes`
  from { opacity: 0; translate: 0 10px; scale: 0.97; }
  to { opacity: 1; translate: 0 0; scale: 1; }
`

const metaLine = { display: 'flex', alignItems: 'center', gap: 1 }

/** Card body; also reused inside the floating drag preview. */
export function CardContent({ application, today }) {
  const salary = formatSalary(application.salaryMin, application.salaryMax)
  const overdue = isOverdue(application.followUpDate, today)
  const dueToday = isDueToday(application.followUpDate, today)
  const quietFor = staleDays(application)

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75 }}>
      <CompanyAvatar name={application.company} size={44} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          component={Link}
          to={`/applications/${application.id}`}
          noWrap
          fontWeight={700}
          sx={{ display: 'block', color: 'text.primary', textDecoration: 'none', transition: 'color .2s', '&:hover': { color: 'primary.main' } }}
        >
          {application.company}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {application.role}
        </Typography>
        <Box sx={{ mt: 1.75, display: 'flex', flexDirection: 'column', gap: 0.75, color: 'text.secondary' }}>
          <Typography variant="caption" sx={metaLine}>
            <AppIcon name="calendar" size={14} /> Applied {formatDate(application.dateApplied)}
          </Typography>
          {salary && (
            <Typography variant="caption" sx={metaLine}>
              <AppIcon name="banknote" size={14} /> {salary}
            </Typography>
          )}
        </Box>
        {(overdue || dueToday) && (
          <Chip
            size="small"
            color="error"
            icon={<AppIcon name="bellRing" size={14} />}
            label={overdue ? 'Follow-up overdue' : 'Follow up today'}
            sx={{ mt: 1.75, fontWeight: 700 }}
          />
        )}
        {/* A gentle nudge for applications with no movement for two weeks (a due reminder takes priority). */}
        {!overdue && !dueToday && quietFor !== null && (
          <Chip
            size="small"
            color="warning"
            variant="outlined"
            icon={<AppIcon name="hourglass" size={14} />}
            label={`Quiet for ${quietFor} days`}
            sx={{ mt: 1.75, fontWeight: 700 }}
          />
        )}
      </Box>
      <Box sx={{ color: 'text.disabled', display: 'flex', pt: 0.25 }} aria-hidden="true">
        <AppIcon name="gripVertical" size={18} />
      </Box>
    </Box>
  )
}

export default function ApplicationCard({ application, index = 0 }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: application.id,
    data: { type: 'card', status: application.status },
  })
  const accent = STATUS_STYLES[application.status].chart

  return (
    // The whole card is the drag target; the 6px drag threshold in Board keeps link clicks working.
    <Box
      component="li"
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      role="listitem"
      aria-label={`${application.company}, ${application.role}`}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 }}
      sx={{
        listStyle: 'none',
        p: 2.25,
        borderRadius: 3.5,
        border: 1,
        borderColor: 'divider',
        borderLeft: `4px solid ${accent}`,
        bgcolor: 'background.paper',
        boxShadow: 1,
        cursor: 'grab',
        touchAction: 'manipulation',
        // Cards cascade in one after another (capped so long columns don't wait forever).
        animation: `${cardIn} .4s ease-out ${Math.min(index, 8) * 60}ms backwards`, // "backwards": don't keep `translate` after, or hover lift is blocked
        transition: 'box-shadow .2s, border-color .2s, translate .2s',
        '&:hover': { boxShadow: 6, translate: '0 -2px' },
        '&:active': { cursor: 'grabbing' },
      }}
    >
      <CardContent application={application} today={todayISO()} />
    </Box>
  )
}
