import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button } from '@mui/material'
import AppIcon from '../../components/AppIcon'
import { useApplications } from '../applications/ApplicationsContext'
import { useAuth } from '../auth/AuthContext'
import { buildDemoApplications } from './demoData'

/** Shown only in the demo account: explains the sample data and offers a reset or a real sign-up. */
export default function DemoBanner() {
  const { isDemo, logout } = useAuth()
  const { importData } = useApplications()
  const navigate = useNavigate()
  if (!isDemo) return null

  const reset = () => importData(JSON.stringify({ version: 1, applications: buildDemoApplications() }))
  const signUp = () => {
    navigate('/register')
    logout()
  }

  return (
    <Alert
      severity="info"
      icon={<AppIcon name="sparkles" size={20} />}
      sx={{ borderRadius: 0, justifyContent: 'center', alignItems: 'center', py: 0.5 }}
      action={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="inherit" size="small" onClick={reset}>
            Reset sample data
          </Button>
          <Button color="inherit" size="small" variant="outlined" onClick={signUp}>
            Create my account
          </Button>
        </Box>
      }
    >
      You are exploring a demo with fictional companies. Try dragging cards, then create an account for your own data.
    </Alert>
  )
}
