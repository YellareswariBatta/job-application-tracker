import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Box, Button, Fade, ListItemIcon, ListItemText, Menu, MenuItem, Snackbar, Typography } from '@mui/material'
import AppIcon from '../../components/AppIcon'
import { useApplications } from '../applications/ApplicationsContext'
import { buildICS } from '../calendar/ics'
import { downloadFile } from '../../lib/download'
import { todayISO } from '../../lib/dates'
import { applicationsToCSV } from './csv'

const MAX_IMPORT_BYTES = 5 * 1024 * 1024
const headerButton = {
  color: '#fff',
  borderColor: 'rgba(255,255,255,.55)',
  '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,.14)' },
}

const hasFiles = (e) => Array.from(e.dataTransfer?.types ?? []).includes('Files')

/** Export menu (backup, spreadsheet, calendar), import button, and drop-a-file-anywhere import. */
export default function DataManagement() {
  const { applications, exportData, importData } = useApplications()
  const fileInput = useRef(null)
  const [message, setMessage] = useState(null) // { type: 'success' | 'error', text }
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState(null)

  const exportAs = (kind) => {
    setMenuAnchor(null)
    const stamp = todayISO()
    if (kind === 'json') {
      downloadFile(`job-applications-${stamp}.json`, exportData(), 'application/json')
      setMessage({ type: 'success', text: `Backed up ${applications.length} application(s).` })
    } else if (kind === 'csv') {
      downloadFile(`job-applications-${stamp}.csv`, applicationsToCSV(applications), 'text/csv;charset=utf-8')
      setMessage({ type: 'success', text: `Exported ${applications.length} application(s) to a spreadsheet.` })
    } else {
      const { text, count } = buildICS(applications)
      if (count === 0) {
        setMessage({ type: 'error', text: 'No interview or follow-up dates to add to a calendar yet.' })
        return
      }
      downloadFile(`job-tracker-calendar-${stamp}.ics`, text, 'text/calendar;charset=utf-8')
      setMessage({ type: 'success', text: `Exported ${count} calendar event(s). Open the file to add them.` })
    }
  }

  const importFile = useCallback(
    async (file) => {
      if (file.size > MAX_IMPORT_BYTES) {
        setMessage({ type: 'error', text: 'That file is too large (5 MB maximum).' })
        return
      }
      // Importing replaces everything, so ask first when there is data to lose.
      if (applications.length > 0 && !window.confirm('Importing will replace all current applications. Continue?')) return

      setBusy(true)
      try {
        const result = importData(await file.text())
        setMessage(
          result.ok
            ? { type: 'success', text: `Imported ${result.count} application(s).` }
            : { type: 'error', text: result.error },
        )
      } catch {
        setMessage({ type: 'error', text: 'The file could not be read.' })
      } finally {
        setBusy(false)
      }
    },
    [applications.length, importData],
  )

  function handleChosen(event) {
    const file = event.target.files[0]
    event.target.value = '' // lets the same file be chosen again later
    if (file) importFile(file)
  }

  // Drag a file from the desktop anywhere onto the window. (Card dragging uses pointer events, so no clash.)
  useEffect(() => {
    let depth = 0 // dragenter/leave fire for every child element, so count them
    const onEnter = (e) => {
      if (!hasFiles(e)) return
      depth += 1
      setDragging(true)
    }
    const onLeave = (e) => {
      if (!hasFiles(e)) return
      depth = Math.max(0, depth - 1)
      if (depth === 0) setDragging(false)
    }
    const onOver = (e) => hasFiles(e) && e.preventDefault() // required to allow a drop
    const onDrop = (e) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      depth = 0
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) importFile(file)
    }
    window.addEventListener('dragenter', onEnter)
    window.addEventListener('dragleave', onLeave)
    window.addEventListener('dragover', onOver)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onEnter)
      window.removeEventListener('dragleave', onLeave)
      window.removeEventListener('dragover', onOver)
      window.removeEventListener('drop', onDrop)
    }
  }, [importFile])

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        aria-haspopup="menu"
        startIcon={<AppIcon name="download" size={16} />}
        endIcon={<AppIcon name="chevronDown" size={14} />}
        onClick={(e) => setMenuAnchor(e.currentTarget)}
        sx={headerButton}
      >
        Export
      </Button>
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => exportAs('json')}>
          <ListItemIcon><AppIcon name="fileJson" size={18} /></ListItemIcon>
          <ListItemText primary="Backup (JSON)" secondary="Everything, can be re-imported" />
        </MenuItem>
        <MenuItem onClick={() => exportAs('csv')}>
          <ListItemIcon><AppIcon name="spreadsheet" size={18} /></ListItemIcon>
          <ListItemText primary="Spreadsheet (CSV)" secondary="Opens in Excel or Google Sheets" />
        </MenuItem>
        <MenuItem onClick={() => exportAs('ics')}>
          <ListItemIcon><AppIcon name="calendarPlus" size={18} /></ListItemIcon>
          <ListItemText primary="Calendar (.ics)" secondary="Interviews and follow-up dates" />
        </MenuItem>
      </Menu>
      <Button
        size="small"
        variant="outlined"
        startIcon={<AppIcon name="upload" size={16} />}
        disabled={busy}
        onClick={() => fileInput.current.click()}
        sx={headerButton}
      >
        {busy ? 'Importing…' : 'Import'}
      </Button>
      <input ref={fileInput} type="file" accept="application/json,.json" aria-label="Import JSON file" hidden onChange={handleChosen} />

      <Fade in={dragging} unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: (t) => t.zIndex.modal + 1,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'rgba(15,23,42,.65)',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'none',
          }}
        >
          <Box sx={{ textAlign: 'center', color: '#fff', p: 6, border: '3px dashed rgba(255,255,255,.8)', borderRadius: 4 }}>
            <AppIcon name="fileJson" size={56} />
            <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
              Drop your JSON file to import
            </Typography>
            <Typography variant="body2">This replaces your current applications.</Typography>
          </Box>
        </Box>
      </Fade>

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={message?.type === 'error' ? 8000 : 4000}
        onClose={(_, reason) => reason !== 'clickaway' && setMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {/* Snackbar needs a child element; keep the last message while it fades out. */}
        <Alert severity={message?.type ?? 'success'} variant="filled" onClose={() => setMessage(null)}>
          {message?.text}
        </Alert>
      </Snackbar>
    </>
  )
}
