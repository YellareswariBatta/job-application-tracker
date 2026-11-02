import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Box, Link as MuiLink, Typography } from '@mui/material'
import { useApplications } from '../applications/ApplicationsContext'
import EmptyState from '../../components/EmptyState'
import { usePageTitle } from '../../hooks/usePageTitle'
import StatCard from './components/StatCard'
import FunnelCard from './components/FunnelCard'
import SourceCard from './components/SourceCard'
import WeeklyGoalCard from './components/WeeklyGoalCard'
import { StatusPieChart, WeeklyBarChart } from './components/Charts'
import { averageDaysToResponse, bySource, funnel } from './analytics'
import { applicationsPerWeek, calculateStats, statusDistribution } from './stats'

export default function DashboardPage() {
  usePageTitle('Dashboard')
  const { applications } = useApplications()
  const stats = useMemo(() => calculateStats(applications), [applications])
  const distribution = useMemo(() => statusDistribution(applications), [applications])
  const weekly = useMemo(() => applicationsPerWeek(applications), [applications])
  const stages = useMemo(() => funnel(applications), [applications])
  const sources = useMemo(() => bySource(applications), [applications])
  const daysToReply = useMemo(() => averageDaysToResponse(applications), [applications])
  const appliedThisWeek = weekly[weekly.length - 1].count // last bucket is the current week

  if (applications.length === 0) {
    return (
      <EmptyState icon="barChart" title="No data to show yet">
        Add an application on the <MuiLink component={Link} to="/board">board</MuiLink> and your stats will appear here.
      </EmptyState>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 2.5 }}>
      <Typography variant="h4" component="h1" fontWeight={800} letterSpacing={-0.5}>
        Dashboard
      </Typography>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' } }}>
        <StatCard
          label="Total applications"
          value={stats.total}
          icon="briefcase"
          gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
        />
        <StatCard
          label="Response rate"
          value={stats.responseRate}
          suffix="%"
          hint="Moved past “Applied”"
          icon="trendingUp"
          gradient="linear-gradient(135deg, #10b981, #06b6d4)"
          delay={100}
        />
        <StatCard
          label="Days to first reply"
          value={daysToReply}
          suffix=" days"
          hint="Average, from applying"
          icon="clock"
          gradient="linear-gradient(135deg, #0ea5e9, #6366f1)"
          delay={200}
        />
        <StatCard
          label="Interviews this week"
          value={stats.interviewsThisWeek}
          hint="Monday to Sunday"
          icon="calendarCheck"
          gradient="linear-gradient(135deg, #f97316, #ec4899)"
          delay={300}
        />
      </Box>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', xl: '1fr 1fr 280px' } }}>
        <StatusPieChart data={distribution} />
        <WeeklyBarChart data={weekly} />
        <WeeklyGoalCard appliedThisWeek={appliedThisWeek} delay={450} />
      </Box>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <FunnelCard stages={stages} delay={500} />
        <SourceCard sources={sources} delay={600} />
      </Box>
    </Box>
  )
}
