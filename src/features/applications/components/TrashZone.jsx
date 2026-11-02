import { useDroppable } from '@dnd-kit/core'
import { Box, Slide, Typography } from '@mui/material'
import AppIcon from '../../../components/AppIcon'

/** Appears at the bottom of the screen while a card is being dragged; dropping on it deletes (after confirming). */
export default function TrashZone({ visible }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'trash', data: { type: 'trash' } })

  return (
    <Slide in={visible} direction="up" mountOnEnter unmountOnExit>
      <Box
        ref={setNodeRef}
        sx={{
          position: 'fixed',
          left: '50%',
          bottom: 24,
          zIndex: (t) => t.zIndex.modal - 1,
          translate: '-50% 0',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 4,
          py: 2,
          borderRadius: 4,
          border: '2px dashed',
          borderColor: 'error.main',
          bgcolor: isOver ? 'error.main' : 'background.paper',
          color: isOver ? '#fff' : 'error.main',
          boxShadow: isOver ? 12 : 6,
          scale: isOver ? '1.08' : '1',
          transition: 'background-color .2s, color .2s, scale .2s, box-shadow .2s',
        }}
      >
        <AppIcon name="trash" size={24} />
        <Typography fontWeight={700}>{isOver ? 'Release to delete' : 'Drop here to delete'}</Typography>
      </Box>
    </Slide>
  )
}
