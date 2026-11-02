import { z } from 'zod'

export const MIN_PASSWORD_LENGTH = 10

const email = z.string().trim().toLowerCase().min(1, 'Email is required').email('Enter a valid email address').max(254)

// Length matters most; the character mix rules just block the very weakest choices.
const password = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
  .max(128, 'Password is too long (128 characters maximum)')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/[0-9]/, 'Include a number')

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(60, 'Name is too long'),
    email,
    password,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// Login only checks presence: the real check is against the stored hash.
export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
})

/** 0 (very weak) to 4 (strong), for the strength meter on the sign-up form. */
export function passwordStrength(value) {
  if (!value) return 0
  let score = 0
  if (value.length >= MIN_PASSWORD_LENGTH) score += 1
  if (value.length >= 14) score += 1
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1
  if (/[0-9]/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1
  return score
}
