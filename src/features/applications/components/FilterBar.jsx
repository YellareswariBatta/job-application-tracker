import { Button, InputAdornment, MenuItem, Paper, TextField } from '@mui/material'
import AppIcon from '../../../components/AppIcon'
import DateField from '../../../components/DateField'
import { STATUSES } from '../constants'
import { EMPTY_FILTERS, hasActiveFilters } from '../filters'

export default function FilterBar({ filters, onChange }) {
  const set = (field) => (value) => onChange({ ...filters, [field]: value })

  return (
    <Paper
      variant="outlined"
      sx={{ mb: 3, p: 2.5, borderRadius: 4, display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '2fr 1fr 1fr 1fr auto' } }}
    >
      <TextField
        size="small"
        type="search"
        label="Search company or role"
        value={filters.query}
        onChange={(e) => set('query')(e.target.value)}
        slotProps={{
          // Always-shrunk label so it never sits on top of the icon or placeholder text.
          inputLabel: { shrink: true },
          htmlInput: { 'aria-label': 'Search by company or role' },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <AppIcon name="search" size={18} />
              </InputAdornment>
            ),
          },
        }}
      />
      <TextField
        size="small"
        select
        label="Status"
        value={filters.status}
        onChange={(e) => set('status')(e.target.value)}
        // Shrunk label + displayEmpty: otherwise "All statuses" is drawn over the label.
        slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
      >
        <MenuItem value="">All statuses</MenuItem>
        {STATUSES.map((s) => (
          <MenuItem key={s} value={s}>
            {s}
          </MenuItem>
        ))}
      </TextField>
      <DateField size="small" label="Applied from" value={filters.from} onChange={set('from')} />
      <DateField size="small" label="Applied to" value={filters.to} onChange={set('to')} />
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<AppIcon name="filterX" size={18} />}
        onClick={() => onChange(EMPTY_FILTERS)}
        disabled={!hasActiveFilters(filters)}
      >
        Clear
      </Button>
    </Paper>
  )
}
