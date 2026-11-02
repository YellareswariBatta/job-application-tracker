import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, TextField } from '@mui/material'
import AppIcon from '../../../components/AppIcon'
import DateField from '../../../components/DateField'
import { applicationFormSchema } from '../schema'
import { SOURCES, STATUSES } from '../constants'
import { todayISO } from '../../../lib/dates'

// Stored values may be undefined; inputs want '' for "empty".
const toFormValues = (app) => ({
  company: app?.company ?? '',
  role: app?.role ?? '',
  dateApplied: app?.dateApplied ?? todayISO(),
  salaryMin: app?.salaryMin ?? '',
  salaryMax: app?.salaryMax ?? '',
  jobLink: app?.jobLink ?? '',
  status: app?.status ?? 'Applied',
  source: app?.source ?? '',
  followUpDate: app?.followUpDate ?? '',
  interviewDate: app?.interviewDate ?? '',
  notes: app?.notes ?? '',
})

const moneySlot = { htmlInput: { min: 0, step: 1000 } }
const selectSlot = { select: { native: true }, inputLabel: { shrink: true } }
const full = { gridColumn: { sm: '1 / -1' } }

/**
 * Used for "add" (optionally pre-filled via `prefill`, e.g. from a pasted job advert) and for "edit" (`initial`).
 * onSubmit receives validated data.
 */
export default function ApplicationForm({ initial, prefill, onSubmit, onCancel }) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: toFormValues(initial ?? prefill),
  })

  // Connects a react-hook-form field to a MUI TextField, including its error message.
  const field = (name) => {
    const { ref, ...rest } = register(name)
    return { ...rest, inputRef: ref, error: Boolean(errors[name]), helperText: errors[name]?.message }
  }

  // Calendar pickers are controlled, so they go through Controller instead of register.
  const dateField = (name, label) => (
    <Controller
      name={name}
      control={control}
      render={({ field: f, fieldState }) => (
        <DateField
          label={label}
          value={f.value}
          onChange={f.onChange}
          onBlur={f.onBlur}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message}
        />
      )}
    />
  )

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
      <TextField label="Company *" {...field('company')} />
      <TextField label="Role *" {...field('role')} />
      {dateField('dateApplied', 'Date applied *')}
      <TextField label="Status" select slotProps={selectSlot} {...field('status')}>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </TextField>
      <TextField label="Minimum salary (£)" type="number" slotProps={moneySlot} {...field('salaryMin')} />
      <TextField label="Maximum salary (£)" type="number" slotProps={moneySlot} {...field('salaryMax')} />
      <TextField label="Job link" type="url" placeholder="https://" slotProps={{ inputLabel: { shrink: true } }} {...field('jobLink')} />
      <TextField label="Source" select slotProps={selectSlot} {...field('source')}>
        <option value="">Not set</option>
        {SOURCES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </TextField>
      {dateField('followUpDate', 'Follow-up reminder date')}
      {dateField('interviewDate', 'Interview date')}
      <TextField label="Notes" multiline minRows={4} sx={full} {...field('notes')} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, ...full }}>
        <Button color="inherit" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={<AppIcon name={initial ? 'check' : 'plus'} size={18} />}>
          {initial ? 'Save changes' : 'Add application'}
        </Button>
      </Box>
    </Box>
  )
}
