import { loginSchema, passwordStrength, registerSchema } from './authSchemas'

const valid = { name: 'Sam Taylor', email: 'Sam@Example.com ', password: 'Sturdy-pass9', confirmPassword: 'Sturdy-pass9' }
const messagesFor = (input) => {
  const result = registerSchema.safeParse(input)
  return result.success ? [] : result.error.issues.map((i) => i.message)
}

describe('registerSchema', () => {
  it('accepts valid details and normalises the email', () => {
    const result = registerSchema.safeParse(valid)
    expect(result.success).toBe(true)
    expect(result.data.email).toBe('sam@example.com')
  })

  it('requires a name and a valid email', () => {
    expect(messagesFor({ ...valid, name: '  ' })).toContain('Name is required')
    expect(messagesFor({ ...valid, email: 'nope' })).toContain('Enter a valid email address')
  })

  it.each([
    ['Short1a', 'Password must be at least 10 characters'],
    ['alllowercase123', 'Include an uppercase letter'],
    ['ALLUPPERCASE123', 'Include a lowercase letter'],
    ['NoNumbersHereAtAll', 'Include a number'],
  ])('rejects the weak password %s', (password, message) => {
    expect(messagesFor({ ...valid, password, confirmPassword: password })).toContain(message)
  })

  it('rejects mismatched confirmation', () => {
    expect(messagesFor({ ...valid, confirmPassword: 'Different-pass9' })).toContain('Passwords do not match')
  })
})

describe('loginSchema', () => {
  it('only requires an email and some password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true)
    expect(loginSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false)
  })
})

describe('passwordStrength', () => {
  it('scores from 0 to 4', () => {
    expect(passwordStrength('')).toBe(0)
    expect(passwordStrength('short')).toBe(0)
    expect(passwordStrength('Sturdy-pass9')).toBeGreaterThanOrEqual(3)
    expect(passwordStrength('A-very-Long-passphrase-2024!')).toBe(4)
  })
})
