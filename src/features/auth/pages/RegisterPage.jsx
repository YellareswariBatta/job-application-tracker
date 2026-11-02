import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Box, Button, LinearProgress, Link as MuiLink, TextField, Typography } from '@mui/material'
import AppIcon from '../../../components/AppIcon'
import { usePageTitle } from '../../../hooks/usePageTitle'
import AuthShell from '../components/AuthShell'
import PasswordField from '../components/PasswordField'
import { iconSlot } from '../components/iconSlot'
import { useAuth } from '../AuthContext'
import { passwordStrength, registerSchema } from '../authSchemas'

const STRENGTH = [
  { label: 'Too short', colour: 'error' },
  { label: 'Weak', colour: 'error' },
  { label: 'Fair', colour: 'warning' },
  { label: 'Good', colour: 'info' },
  { label: 'Strong', colour: 'success' },
]

export default function RegisterPage() {
  usePageTitle('Create account')
  const { register: createAccount } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState(null)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  // Connects a field to a MUI input. `ref` must go to `inputRef`: on a custom component React drops `ref`
  // entirely, and react-hook-form then never registers the field (it reads as empty).
  const field = (name) => {
    const { ref, ...rest } = register(name)
    return { ...rest, inputRef: ref, error: Boolean(errors[name]), helperText: errors[name]?.message }
  }

  const password = watch('password')
  const strength = STRENGTH[passwordStrength(password)]

  async function onSubmit({ name, email, password: pw }) {
    setFormError(null)
    const result = await createAccount({ name, email, password: pw })
    if (result.ok) navigate('/board', { replace: true })
    else setFormError(result.error)
  }

  return (
    <AuthShell
      variant="register"
      title="Create your account"
      subtitle="Your applications stay private to your account on this device."
      footer={
        <>
          Already registered? <MuiLink component={Link} to="/login" fontWeight={700}>Log in</MuiLink>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'grid', gap: 22 }}>
        {formError && <Alert severity="error">{formError}</Alert>}
        <TextField label="Name" autoComplete="name" autoFocus slotProps={iconSlot('user')} {...field('name')} />
        <TextField label="Email" type="email" autoComplete="email" slotProps={iconSlot('mail')} {...field('email')} />
        <div>
          <PasswordField
            label="Password"
            autoComplete="new-password"
            {...field('password')}
            helperText={errors.password?.message ?? 'At least 10 characters, with upper and lower case letters and a number.'}
          />
          {password && (
            <Box sx={{ mt: 1 }}>
              <LinearProgress
                variant="determinate"
                value={(passwordStrength(password) / 4) * 100}
                color={strength.colour}
                aria-label="Password strength"
                sx={{ height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" color={`${strength.colour}.main`}>
                {strength.label}
              </Typography>
            </Box>
          )}
        </div>
        <PasswordField label="Confirm password" autoComplete="new-password" icon="shieldCheck" {...field('confirmPassword')} />
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          endIcon={<AppIcon name="arrowRight" size={20} />}
          sx={{ py: 1.5, borderRadius: 3.5, fontSize: 16 }}
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: -1 }}>
          <AppIcon name="shieldCheck" size={16} />
          Accounts are stored in this browser only. Passwords are salted and hashed, never saved as typed.
        </Typography>
      </form>
    </AuthShell>
  )
}
