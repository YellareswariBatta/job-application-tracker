import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { alpha, Box, Chip, Paper, Typography } from '@mui/material'
import { STATUS_STYLES } from '../constants'
import ApplicationCard from './ApplicationCard'
import AppIcon, { STATUS_ICONS } from '../../../components/AppIcon'
import EmptyState from '../../../components/EmptyState'

export default function BoardColumn({ status, applications, isFiltered }) {
  // The column itself is a drop target so empty columns accept cards.
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { type: 'column', status } })
  const accent = STATUS_STYLES[status].chart

  return (
    <Paper
      component="section"
      aria-label={`${status} column`}
      variant="outlined"
      sx={{
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 5,
        borderColor: isOver ? accent : 'divider',
        // Tinted with the status colour; stronger while a card hovers over it.
        bgcolor: alpha(accent, isOver ? 0.16 : 0.06),
        boxShadow: isOver ? `0 0 0 3px ${alpha(accent, 0.35)}` : 'none',
        transition: 'background-color .2s, box-shadow .2s, border-color .2s',
      }}
    >
      <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 3, bgcolor: alpha(accent, 0.16), color: accent, boxShadow: `inset 0 0 0 1px ${alpha(accent, 0.25)}` }}>
          <AppIcon name={STATUS_ICONS[status]} size={21} />
        </Box>
        <Typography component="h2" variant="subtitle2" fontWeight={700} sx={{ flex: 1 }}>
          {status}
        </Typography>
        <Chip label={applications.length} sx={{ fontWeight: 800, minWidth: 34, bgcolor: alpha(accent, 0.18), color: accent }} />
      </Box>
      <SortableContext items={applications.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <Box
          component="ul"
          ref={setNodeRef}
          sx={{ m: 0, p: 0, minHeight: 140, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {applications.map((application, index) => (
            <ApplicationCard key={application.id} application={application} index={index} />
          ))}
          {applications.length === 0 && (
            <EmptyState
              compact
              icon={isOver ? 'plus' : 'inbox'}
              title={isOver ? 'Drop it here' : isFiltered ? 'No matches' : `No ${status.toLowerCase()} applications`}
            >
              {!isFiltered && !isOver && 'Drag a card here or add a new one.'}
            </EmptyState>
          )}
        </Box>
      </SortableContext>
    </Paper>
  )
}
