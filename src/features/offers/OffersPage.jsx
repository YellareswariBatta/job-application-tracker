import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Link as MuiLink,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import AppIcon from '../../components/AppIcon'
import EmptyState from '../../components/EmptyState'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useApplications } from '../applications/ApplicationsContext'
import { formatMoney } from '../applications/format'
import { BANK_HOLIDAYS, DEFAULT_HOLIDAY_DAYS, HOURS_PER_DAY, analyseOffer, bestIndex } from './offerMath'

const MAX_COMPARED = 3

// The details you type in for each offer. `max` also stops silly values.
const FIELDS = [
  { key: 'baseSalary', label: 'Base salary (£)', step: 1000, max: 1_000_000 },
  { key: 'bonusPercent', label: 'Bonus (% of base)', step: 1, max: 100 },
  { key: 'pensionPercent', label: 'Employer pension (%)', step: 0.5, max: 100 },
  { key: 'holidayDays', label: 'Holiday (days a year)', step: 1, max: 100, placeholder: String(DEFAULT_HOLIDAY_DAYS) },
  { key: 'remoteDays', label: 'Remote days per week', step: 1, max: 5, placeholder: '0' },
  { key: 'commuteMinutes', label: 'Commute per office day (minutes, return)', step: 5, max: 600, placeholder: '0' },
]

// Start with offers, plus anything the user has already entered offer details for (max three).
const defaultSelection = (applications) =>
  applications
    .filter((a) => a.status !== 'Rejected' && (a.status === 'Offer' || a.offer))
    .slice(0, MAX_COMPARED)
    .map((a) => a.id)

const optionLabel = (app) => `${app.company} · ${app.role}`

/** Side-by-side offer comparison with an effective hourly rate that accounts for commute and holiday. */
export default function OffersPage() {
  usePageTitle('Compare offers')
  const { applications, updateApplication } = useApplications()
  const options = useMemo(() => applications.filter((a) => a.status !== 'Rejected'), [applications])
  const [selectedIds, setSelectedIds] = useState(() => defaultSelection(applications))

  const selected = selectedIds.map((id) => options.find((a) => a.id === id)).filter(Boolean)

  // The advertised salary stands in until a base salary is typed in.
  const analyses = selected.map((app) =>
    analyseOffer({ ...app.offer, baseSalary: app.offer?.baseSalary ?? app.salaryMax ?? app.salaryMin }),
  )
  const bestHourly = bestIndex(analyses.map((a) => a?.effectiveHourly ?? null))
  const bestPackage = bestIndex(analyses.map((a) => a?.packageValue ?? null))
  const leastCommute = bestIndex(analyses.map((a) => a?.commuteHours ?? null), false)

  function setField(app, field, raw) {
    const number = raw === '' ? undefined : Number(raw)
    if (number !== undefined && Number.isNaN(number)) return
    const value = number === undefined ? undefined : Math.min(field.max, Math.max(0, number))
    // Inline edits skip the undo bar so typing does not flood it.
    updateApplication(app.id, { offer: { ...app.offer, [field.key]: value } }, { undoable: false })
  }

  if (options.length === 0) {
    return (
      <EmptyState icon="scale" title="Nothing to compare yet">
        Add some applications on the <MuiLink component={Link} to="/board">board</MuiLink>, then compare offers here.
      </EmptyState>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Typography variant="h4" component="h1" fontWeight={800} letterSpacing={-0.5}>
          Compare offers
        </Typography>
        <Typography color="text.secondary">
          Put up to {MAX_COMPARED} opportunities side by side. A higher salary is not always the better deal once commute and holiday are counted.
        </Typography>
      </Box>

      <Autocomplete
        multiple
        options={options}
        value={selected}
        getOptionLabel={optionLabel}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        getOptionDisabled={(option) => selected.length >= MAX_COMPARED && !selectedIds.includes(option.id)}
        onChange={(_, value) => setSelectedIds(value.slice(0, MAX_COMPARED).map((a) => a.id))}
        renderInput={(params) => (
          <TextField {...params} label="Applications to compare" helperText={`Choose two or three (up to ${MAX_COMPARED}).`} />
        )}
        sx={{ maxWidth: 720 }}
      />

      {selected.length < 2 ? (
        <Alert severity="info" icon={<AppIcon name="scale" size={20} />}>
          Choose at least two applications above to compare them.
        </Alert>
      ) : (
        <>
          {bestHourly !== -1 && (
            <Alert severity="success" icon={<AppIcon name="trophy" size={22} />}>
              <strong>{selected[bestHourly].company}</strong> gives the best value at about{' '}
              <strong>{formatMoney(analyses[bestHourly].effectiveHourly, { pence: true })} an hour</strong> once commuting time is counted.
            </Alert>
          )}

          <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <TableContainer>
              <Table aria-label="Offer comparison" sx={{ minWidth: 560 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 240 }} />
                    {selected.map((app) => (
                      <TableCell key={app.id} sx={{ verticalAlign: 'bottom' }}>
                        <Typography fontWeight={800}>{app.company}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {app.role}
                        </Typography>
                        <Chip size="small" label={app.status} sx={{ mt: 0.75 }} />
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {FIELDS.map((field) => (
                    <TableRow key={field.key}>
                      <TableCell component="th" scope="row">
                        {field.label}
                      </TableCell>
                      {selected.map((app) => (
                        <TableCell key={app.id}>
                          <TextField
                            size="small"
                            type="number"
                            hiddenLabel
                            fullWidth
                            value={app.offer?.[field.key] ?? ''}
                            placeholder={
                              field.key === 'baseSalary'
                                ? String(app.salaryMax ?? app.salaryMin ?? '')
                                : field.placeholder
                            }
                            onChange={(e) => setField(app, field, e.target.value)}
                            slotProps={{ htmlInput: { min: 0, max: field.max, step: field.step, 'aria-label': `${field.label} for ${app.company}` } }}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                  {/* Results */}
                  <ResultRow label="Yearly package (base + bonus + pension)" values={analyses.map((a) => a && formatMoney(a.packageValue))} best={bestPackage} />
                  <ResultRow label="Commuting per year" values={analyses.map((a) => a && `${Math.round(a.commuteHours)} hours`)} best={leastCommute} />
                  <ResultRow
                    label="Effective hourly rate"
                    values={analyses.map((a) => a && formatMoney(a.effectiveHourly, { pence: true }))}
                    best={bestHourly}
                    emphasis
                  />
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <AppIcon name="clock" size={14} />
            An estimate for comparing offers, before tax, not financial advice. It assumes {HOURS_PER_DAY}-hour working days, {BANK_HOLIDAYS} bank holidays,
            {' '}{DEFAULT_HOLIDAY_DAYS} days&rsquo; holiday if left blank, employer pension counted as pay, and the advertised top salary if no base salary is entered.
            The hourly rate divides the package by paid working hours plus commuting hours.
          </Typography>
          <Box>
            <Button component={Link} to="/board" startIcon={<AppIcon name="arrowLeft" size={16} />}>
              Back to board
            </Button>
          </Box>
        </>
      )}
    </Box>
  )
}

function ResultRow({ label, values, best, emphasis = false }) {
  return (
    <TableRow sx={{ bgcolor: emphasis ? 'action.hover' : undefined }}>
      <TableCell component="th" scope="row" sx={{ fontWeight: emphasis ? 800 : 600 }}>
        {label}
      </TableCell>
      {values.map((value, index) => (
        <TableCell key={index} sx={{ fontWeight: emphasis ? 800 : 500, fontSize: emphasis ? 18 : 14 }}>
          {value ?? <Typography variant="body2" color="text.disabled">Add a base salary</Typography>}
          {best === index && <Chip size="small" color="success" label="Best" sx={{ ml: 1, fontWeight: 700 }} />}
        </TableCell>
      ))}
    </TableRow>
  )
}
