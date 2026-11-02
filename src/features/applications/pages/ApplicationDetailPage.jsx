import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, Button, Divider, Link as MuiLink, Paper, Typography } from '@mui/material'
import AppIcon from '../../../components/AppIcon'
import { usePageTitle } from '../../../hooks/usePageTitle'
import CompanyAvatar from '../../../components/CompanyAvatar'
import { useApplications } from '../ApplicationsContext'
import ApplicationForm from '../components/ApplicationForm'
import Modal from '../../../components/Modal'
import StatusBadge from '../../../components/StatusBadge'
import StatusTimeline from '../components/StatusTimeline'
import { buildICS } from '../../calendar/ics'
import { downloadFile } from '../../../lib/download'
import EmptyState from '../../../components/EmptyState'
import { formatDate, isDueToday, isOverdue, todayISO } from '../../../lib/dates'
import { formatSalary } from '../format'

function Detail({ label, icon, children }) {
  return (
    <div>
      <Typography variant="overline" color="text.secondary" component="dt" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <AppIcon name={icon} size={14} /> {label}
      </Typography>
      <Typography component="dd" sx={{ m: 0 }}>
        {children || <span style={{ opacity: 0.5 }}>—</span>}
      </Typography>
    </div>
  )
}

export default function ApplicationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { applications, updateApplication, deleteApplication } = useApplications()
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const app = applications.find((a) => a.id === id)
  usePageTitle(app ? app.company : 'Not found')
  if (!app) {
    return (
      <EmptyState title="Application not found">
        It may have been deleted. <MuiLink component={Link} to="/board">Back to the board</MuiLink>
      </EmptyState>
    )
  }

  const hasCalendarDates = Boolean(app.interviewDate || (app.followUpDate && app.status !== 'Rejected'))
  const addToCalendar = () =>
    downloadFile(`${app.company.replace(/[^\w-]+/g, '-').toLowerCase()}-dates.ics`, buildICS([app]).text, 'text/calendar;charset=utf-8')

  const today = todayISO()
  const overdue = isOverdue(app.followUpDate, today)
  const dueToday = isDueToday(app.followUpDate, today)

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Button component={Link} to="/board" startIcon={<AppIcon name="arrowLeft" size={18} />} size="small">
        Back to board
      </Button>

      <Paper variant="outlined" sx={{ mt: 1.5, borderRadius: 4, overflow: 'hidden' }}>
        <Box sx={{ height: 8, backgroundImage: (t) => t.custom.gradient }} />
        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CompanyAvatar name={app.company} size={56} />
              <div>
                <Typography variant="h4" component="h1" fontWeight={800} letterSpacing={-0.5}>
                  {app.company}
                </Typography>
                <Typography color="text.secondary">{app.role}</Typography>
              </div>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <StatusBadge status={app.status} />
              {hasCalendarDates && (
                <Button variant="outlined" startIcon={<AppIcon name="calendarPlus" size={16} />} onClick={addToCalendar}>
                  Add to calendar
                </Button>
              )}
              <Button variant="outlined" startIcon={<AppIcon name="pencil" size={16} />} onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button variant="contained" color="error" startIcon={<AppIcon name="trash" size={16} />} onClick={() => setConfirmingDelete(true)}>
                Delete
              </Button>
            </Box>
          </Box>

          {(overdue || dueToday) && (
            <Alert severity="error" icon={<AppIcon name="bellRing" size={20} />} sx={{ mt: 2.5 }}>
              {overdue ? `Follow-up overdue (was due ${formatDate(app.followUpDate)})` : 'Follow-up is due today'}
            </Alert>
          )}

          <Box component="dl" sx={{ mt: 3, mb: 0, display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <Detail label="Date applied" icon="calendar">{formatDate(app.dateApplied)}</Detail>
            <Detail label="Salary" icon="banknote">{formatSalary(app.salaryMin, app.salaryMax)}</Detail>
            <Detail label="Follow-up reminder" icon="bellRing">{formatDate(app.followUpDate)}</Detail>
            <Detail label="Interview date" icon="calendarCheck">{formatDate(app.interviewDate)}</Detail>
            <Detail label="Source" icon="search">{app.source}</Detail>
            <Detail label="Job link" icon="externalLink">
              {app.jobLink && (
                <MuiLink href={app.jobLink} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: 'break-all' }}>
                  {app.jobLink}
                </MuiLink>
              )}
            </Detail>
          </Box>

          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1" component="h2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AppIcon name="notebook" size={18} /> Notes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, whiteSpace: 'pre-wrap' }}>
            {app.notes || 'No notes yet.'}
          </Typography>

          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1" component="h2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AppIcon name="history" size={18} /> Status history
          </Typography>
          <StatusTimeline application={app} />
        </Box>
      </Paper>

      {editing && (
        <Modal title="Edit application" onClose={() => setEditing(false)}>
          <ApplicationForm
            initial={app}
            onCancel={() => setEditing(false)}
            onSubmit={(data) => {
              updateApplication(app.id, data)
              setEditing(false)
            }}
          />
        </Modal>
      )}

      {confirmingDelete && (
        <Modal title="Delete application?" onClose={() => setConfirmingDelete(false)}>
          <Typography variant="body2">
            This will permanently remove your application to <strong>{app.company}</strong>. This cannot be undone.
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button color="inherit" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                deleteApplication(app.id)
                navigate("/board")
              }}
            >
              Delete
            </Button>
          </Box>
        </Modal>
      )}
    </Box>
  )
}
