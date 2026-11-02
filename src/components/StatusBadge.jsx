import { Chip } from '@mui/material'
import AppIcon, { STATUS_ICONS } from './AppIcon'
import { STATUS_STYLES } from '../features/applications/constants'

export default function StatusBadge({ status }) {
  const colour = STATUS_STYLES[status].chart
  return (
    <Chip
      label={status}
      size="small"
      icon={<AppIcon name={STATUS_ICONS[status]} size={14} />}
      sx={{ fontWeight: 600, color: colour, bgcolor: `${colour}22`, '& .MuiChip-icon': { color: colour } }}
    />
  )
}
