import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Link as MuiLink, TextField } from '@mui/material'
import AppIcon from '../../../components/AppIcon'
import { usePageTitle } from '../../../hooks/usePageTitle'
import AuthShell from '../components/AuthShell'
import PasswordField from '../components/PasswordField'
import { iconSlot } from '../components/iconSlot'
import { useAuth } from '../AuthContext'
import { loginSchema } from '../authSchemas'

export default function LoginPage() {
  usePageTitle('Log in')
  const { login, notice, clearNotice } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })

  // `ref` must go to `inputRef` (see RegisterPage): otherwise react-hook-form never registers the field.
  const field = (name) => {
    const { ref, ...rest } = register(name)
    return { ...rest, inputRef: ref, error: Boolean(errors[name]), helperText: errors[name]?.message }
  }

  async function onSubmit(values) {
    setFormError(null)
    clearNotice()
    const result = await login(values)
    if (result.ok) navigate(location.state?.from ?? '/board', { replace: true })
    else setFormError(result.error)
  }

  return (
    <AuthShell
      variant="login"
      title="Welcome back"
      subtitle="Log in to see your applications."
      footer={
        <>
          New here? <MuiLink component={Link} to="/register" fontWeight={700}>Create an account</MuiLink>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'grid', gap: 22 }}>
        {notice && <Alert severity="info">{notice}</Alert>}
        {formError && <Alert severity="error">{formError}</Alert>}
        <TextField label="Email" type="email" autoComplete="email" autoFocus slotProps={iconSlot('mail')} {...field('email')} />
        <PasswordField label="Password" autoComplete="current-password" {...field('password')} />
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          endIcon={<AppIcon name="arrowRight" size={20} />}
          sx={{ py: 1.5, borderRadius: 3.5, fontSize: 16 }}
        >
          {isSubmitting ? 'Checking…' : 'Log in'}
        </Button>
      </form>
    </AuthShell>
  )
}
