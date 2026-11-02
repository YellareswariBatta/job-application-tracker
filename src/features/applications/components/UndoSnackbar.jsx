import { useState } from 'react'
import { Button, Snackbar } from '@mui/material'
import AppIcon from '../../../components/AppIcon'
import { useApplications } from '../ApplicationsContext'

/** "Moved X to Offer. Undo": appears after any change that can be reversed. */
export default function UndoSnackbar() {
  const { lastChange, undo } = useApplications()
  const [dismissedId, setDismissedId] = useState(null)
  const open = Boolean(lastChange) && lastChange.id !== dismissedId

  return (
    <Snackbar
      open={open}
      autoHideDuration={8000}
      onClose={(_, reason) => reason !== 'clickaway' && setDismissedId(lastChange?.id ?? null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      message={lastChange?.label}
      action={
        <Button color="inherit" size="small" startIcon={<AppIcon name="undo" size={16} />} onClick={undo} sx={{ fontWeight: 800 }}>
          Undo
        </Button>
      }
    />
  )
}
