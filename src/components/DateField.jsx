import dayjs from 'dayjs'
import 'dayjs/locale/en-gb'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import AppIcon from './AppIcon'

const CalendarIcon = () => <AppIcon name="calendar" size={20} />

/**
 * Calendar date picker. Takes and returns "YYYY-MM-DD" strings ('' when empty),
 * the same format the rest of the app stores.
 */
export default function DateField({ label, value, onChange, onBlur, error, helperText, size = 'medium' }) {
  const parsed = value ? dayjs(value) : null

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <DatePicker
        label={label}
        value={parsed?.isValid() ? parsed : null}
        onChange={(date) => onChange(date?.isValid() ? date.format('YYYY-MM-DD') : '')}
        format="DD/MM/YYYY"
        slots={{ openPickerIcon: CalendarIcon }}
        slotProps={{
          textField: { size, error, helperText, onBlur, fullWidth: true },
          field: { clearable: true },
          actionBar: { actions: ['today', 'clear'] },
        }}
      />
    </LocalizationProvider>
  )
}
