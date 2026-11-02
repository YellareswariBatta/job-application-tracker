import { useMemo, useState } from 'react'
import { Box, Button, Chip, LinearProgress, TextField, Typography } from '@mui/material'
import AppIcon from '../../components/AppIcon'
import Modal from '../../components/Modal'
import { formatSalary } from '../applications/format'
import Bookmarklet from './Bookmarklet'
import { guessSource, matchKeywords, parseJobAdvert } from './jobAdvert'

function Found({ label, value }) {
  return value ? (
    <Chip color="primary" variant="outlined" label={`${label}: ${value}`} sx={{ maxWidth: '100%' }} />
  ) : (
    <Chip variant="outlined" disabled label={`${label}: not found`} />
  )
}

/** Paste a job advert to pre-fill the Add form, and optionally check how well a CV matches it. All local. */
export default function JobAdvertDialog({ onClose, onCreate }) {
  const [advert, setAdvert] = useState('')
  const [cv, setCv] = useState('')

  const found = useMemo(() => parseJobAdvert(advert), [advert])
  const source = guessSource(found.jobLink)
  const match = useMemo(() => matchKeywords(advert, cv), [advert, cv])
  const salary = formatSalary(found.salaryMin, found.salaryMax)

  function create() {
    const missing = match.score !== null ? match.missing.slice(0, 10) : []
    onCreate({
      ...found,
      source,
      notes: missing.length > 0 ? `Keywords to cover in my application: ${missing.join(', ')}.` : '',
    })
  }

  return (
    <Modal title="Paste a job advert" onClose={onClose} maxWidth="md">
      <Box sx={{ display: 'grid', gap: 2.5 }}>
        <Typography variant="body2" color="text.secondary">
          Paste the text of a job advert and we will pick out the role, company, salary and link. Everything stays in your browser.
        </Typography>

        <TextField
          label="Job advert"
          multiline
          minRows={6}
          maxRows={12}
          value={advert}
          onChange={(e) => setAdvert(e.target.value)}
          placeholder={'Frontend Developer at Northwind Digital\nSalary: £55,000 - £65,000\nhttps://example.com/jobs/42\n…'}
          slotProps={{ inputLabel: { shrink: true } }}
          autoFocus
        />

        {advert.trim() && (
          <Box aria-label="What we found" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Found label="Role" value={found.role} />
            <Found label="Company" value={found.company} />
            <Found label="Salary" value={salary} />
            <Found label="Link" value={found.jobLink && new URL(found.jobLink, 'https://x.invalid').hostname} />
            <Found label="Source" value={source} />
          </Box>
        )}

        <TextField
          label="Your CV (optional)"
          multiline
          minRows={4}
          maxRows={10}
          value={cv}
          onChange={(e) => setCv(e.target.value)}
          helperText="Used only in this window to check keyword overlap. It is never saved or sent anywhere."
          slotProps={{ inputLabel: { shrink: true } }}
        />

        {match.score !== null && (
          <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: 'action.hover' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AppIcon name="target" size={18} /> Keyword match
              </Typography>
              <Typography fontWeight={800}>{match.score}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={match.score}
              color={match.score >= 70 ? 'success' : match.score >= 40 ? 'warning' : 'error'}
              aria-label="Keyword match"
              sx={{ height: 10, borderRadius: 99, mb: 2 }}
            />
            {match.missing.length > 0 && (
              <>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  Worth mentioning if true:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: match.matched.length ? 2 : 0 }}>
                  {match.missing.map((word) => (
                    <Chip key={word} size="small" color="warning" variant="outlined" label={word} />
                  ))}
                </Box>
              </>
            )}
            {match.matched.length > 0 && (
              <>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  Already covered:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {match.matched.map((word) => (
                    <Chip key={word} size="small" color="success" variant="outlined" label={word} />
                  ))}
                </Box>
              </>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              A rough guide based on matching words. Only add skills you genuinely have.
            </Typography>
          </Box>
        )}

        <Bookmarklet />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button color="inherit" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" disabled={!advert.trim()} onClick={create} startIcon={<AppIcon name="plus" size={18} />}>
            Create application
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}
