import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Alert, Box, Button, Snackbar, Typography } from '@mui/material'
import AppIcon from '../../../components/AppIcon'
import Confetti from '../../../components/Confetti'
import { STATUSES } from '../constants'
import { groupByStatus } from '../statusLogic'
import { useApplications } from '../ApplicationsContext'
import BoardColumn from './BoardColumn'
import TrashZone from './TrashZone'
import { CardContent } from './ApplicationCard'
import Modal from '../../../components/Modal'
import { todayISO } from '../../../lib/dates'

// The trash zone wins whenever the pointer is over it; otherwise pick the nearest column/card.
const collisionDetection = (args) => {
  const overTrash = pointerWithin(args).find((hit) => hit.id === 'trash')
  return overTrash ? [overTrash] : closestCorners(args)
}

/**
 * `visible` is the (possibly filtered) list shown on screen.
 * Drops are applied to the full list in the context so hidden cards keep their place.
 */
export default function Board({ visible, isFiltered }) {
  const { applications, changeStatus, deleteApplication } = useApplications()
  const [activeId, setActiveId] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [burst, setBurst] = useState(0) // changes each time confetti should fire
  const [celebrating, setCelebrating] = useState(null) // company name for the congratulations message

  const sensors = useSensors(
    // A small distance/delay stops simple clicks and scrolls being read as drags.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const columns = useMemo(() => groupByStatus(visible), [visible])
  const activeApplication = visible.find((a) => a.id === activeId)
  const pendingDelete = applications.find((a) => a.id === pendingDeleteId)

  // Party time when a card newly lands in the Offer column.
  function celebrateIfOffer(id, newStatus) {
    const moved = applications.find((a) => a.id === id)
    if (newStatus === 'Offer' && moved && moved.status !== 'Offer') {
      setBurst((n) => n + 1)
      setCelebrating(moved.company)
    }
  }

  function handleDragEnd({ active, over }) {
    setActiveId(null)
    if (!over) return
    const overData = over.data.current
    if (overData?.type === 'trash') {
      setPendingDeleteId(active.id) // confirm first; nothing is deleted yet
    } else if (overData?.type === 'column') {
      celebrateIfOffer(active.id, overData.status)
      changeStatus(active.id, overData.status)
    } else if (overData?.type === 'card' && over.id !== active.id) {
      // Dropped on a card: join its column, placed just before it.
      celebrateIfOffer(active.id, overData.status)
      changeStatus(active.id, overData.status, over.id)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <Box sx={{ display: 'grid', gap: 3, alignItems: 'start', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: 'repeat(4, 1fr)' } }}>
        {STATUSES.map((status) => (
          <BoardColumn key={status} status={status} applications={columns[status]} isFiltered={isFiltered} />
        ))}
      </Box>

      <TrashZone visible={Boolean(activeId)} />

      <Confetti burst={burst} />
      <Snackbar
        open={Boolean(celebrating)}
        autoHideDuration={5000}
        onClose={() => setCelebrating(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" icon={<AppIcon name="partyPopper" size={22} />} onClose={() => setCelebrating(null)}>
          Congratulations! You received an offer from {celebrating}.
        </Alert>
      </Snackbar>

      {/* The floating copy that follows the pointer: tilted and lifted so it reads as "picked up". */}
      <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' }}>
        {activeApplication && (
          <Box
            sx={{
              p: 2.25,
              borderRadius: 3.5,
              border: 2,
              borderColor: 'primary.main',
              bgcolor: 'background.paper',
              boxShadow: 16,
              rotate: '3deg',
              scale: '1.04',
              cursor: 'grabbing',
            }}
          >
            <CardContent application={activeApplication} today={todayISO()} />
          </Box>
        )}
      </DragOverlay>

      {pendingDelete && (
        <Modal title="Delete application?" onClose={() => setPendingDeleteId(null)}>
          <Typography variant="body2">
            This will permanently remove your application to <strong>{pendingDelete.company}</strong>. This cannot be undone.
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button color="inherit" onClick={() => setPendingDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                deleteApplication(pendingDelete.id)
                setPendingDeleteId(null)
              }}
            >
              Delete
            </Button>
          </Box>
        </Modal>
      )}
    </DndContext>
  )
}
