import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Fade, Paper, Typography, useTheme } from '@mui/material'
import { STATUS_STYLES } from '../../applications/constants'

function ChartCard({ title, delay, children }) {
  return (
    <Fade in appear timeout={600} style={{ transitionDelay: `${delay}ms` }}>
      <Paper variant="outlined" sx={{ p: 3.5, borderRadius: 5 }}>
        <Typography variant="subtitle1" component="h2" fontWeight={600} sx={{ mb: 2 }}>
          {title}
        </Typography>
        <div style={{ height: 256 }}>{children}</div>
      </Paper>
    </Fade>
  )
}

// Tooltips are rendered by Recharts, so they need the MUI theme colours passed in.
function useTooltipStyle() {
  const { palette } = useTheme()
  return {
    contentStyle: { background: palette.background.paper, border: `1px solid ${palette.divider}`, borderRadius: 8 },
    itemStyle: { color: palette.text.primary },
    labelStyle: { color: palette.text.secondary },
  }
}

export function StatusPieChart({ data }) {
  const tooltip = useTooltipStyle()
  const { palette } = useTheme()
  // Zero-count slices would only clutter the legend.
  const nonZero = data.filter((d) => d.count > 0)
  return (
    <ChartCard title="Status distribution" delay={150}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={nonZero} dataKey="count" nameKey="status" innerRadius={50} outerRadius={88} paddingAngle={3} stroke="none" animationDuration={900}>
            {nonZero.map((d) => (
              <Cell key={d.status} fill={STATUS_STYLES[d.status].chart} />
            ))}
          </Pie>
          <Tooltip {...tooltip} />
          <Legend formatter={(value) => <span style={{ color: palette.text.primary }}>{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function WeeklyBarChart({ data }) {
  const tooltip = useTooltipStyle()
  const { palette } = useTheme()
  const tick = { fontSize: 12, fill: palette.text.secondary }
  return (
    <ChartCard title="Applications per week (last 8 weeks)" delay={300}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={palette.divider} />
          <XAxis dataKey="label" tick={tick} stroke={palette.divider} />
          <YAxis allowDecimals={false} tick={tick} stroke={palette.divider} />
          <Tooltip cursor={{ fill: palette.action.hover }} {...tooltip} />
          <Bar dataKey="count" name="Applications" fill={palette.primary.main} radius={[6, 6, 0, 0]} animationDuration={900} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
