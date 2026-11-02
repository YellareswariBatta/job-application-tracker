import { applicationFormSchema, exportFileSchema } from './schema'

const valid = { company: 'Acme', role: 'Developer', dateApplied: '2024-03-01', status: 'Applied' }

const messagesFor = (input) => {
  const result = applicationFormSchema.safeParse(input)
  return result.success ? [] : result.error.issues.map((i) => i.message)
}

describe('applicationFormSchema', () => {
  it('accepts the minimum required fields', () => {
    const result = applicationFormSchema.safeParse(valid)
    expect(result.success).toBe(true)
    expect(result.data.notes).toBe('')
  })

  it('requires company and role, ignoring surrounding whitespace', () => {
    const messages = messagesFor({ ...valid, company: '   ', role: '' })
    expect(messages).toContain('Company is required')
    expect(messages).toContain('Role is required')
  })

  it('rejects an impossible date', () => {
    expect(messagesFor({ ...valid, dateApplied: '2024-02-31' })).toContain('Date applied must be a valid date')
  })

  describe('job link', () => {
    it('treats a blank link as not provided', () => {
      const result = applicationFormSchema.safeParse({ ...valid, jobLink: '' })
      expect(result.success).toBe(true)
      expect(result.data.jobLink).toBeUndefined()
    })

    it('accepts an https URL', () => {
      expect(applicationFormSchema.safeParse({ ...valid, jobLink: 'https://example.com/jobs/1' }).success).toBe(true)
    })

    it('rejects text that is not a URL', () => {
      expect(messagesFor({ ...valid, jobLink: 'not a url' })).toContain('Job link must be a valid URL')
    })

    it('rejects non-http schemes', () => {
      expect(messagesFor({ ...valid, jobLink: 'javascript:alert(1)' })).toContain(
        'Job link must start with http:// or https://',
      )
    })
  })

  describe('salary', () => {
    it('converts form strings to numbers', () => {
      const result = applicationFormSchema.safeParse({ ...valid, salaryMin: '40000', salaryMax: '50000' })
      expect(result.data).toMatchObject({ salaryMin: 40000, salaryMax: 50000 })
    })

    it('rejects negative and non-numeric values', () => {
      expect(messagesFor({ ...valid, salaryMin: '-5' })).toContain('Minimum salary cannot be negative')
      expect(messagesFor({ ...valid, salaryMax: 'lots' })).toContain('Maximum salary must be a number')
    })

    it('rejects a range where the maximum is below the minimum', () => {
      expect(messagesFor({ ...valid, salaryMin: 50000, salaryMax: 40000 })).toContain(
        'Maximum salary must be at least the minimum',
      )
    })
  })

  describe('source', () => {
    it('is optional, and blank means not set', () => {
      expect(applicationFormSchema.safeParse(valid).success).toBe(true)
      expect(applicationFormSchema.safeParse({ ...valid, source: '' }).data.source).toBeUndefined()
    })

    it('accepts known sources and rejects others', () => {
      expect(applicationFormSchema.safeParse({ ...valid, source: 'Referral' }).success).toBe(true)
      expect(messagesFor({ ...valid, source: 'Carrier pigeon' })).toContain('Choose a valid source')
    })
  })

  it('rejects an unknown status', () => {
    expect(messagesFor({ ...valid, status: 'Ghosted' })).toContain('Choose a valid status')
  })
})

describe('exportFileSchema', () => {
  const stored = { ...valid, id: 'a1', createdAt: '2024-03-01T00:00:00Z', updatedAt: '2024-03-01T00:00:00Z' }

  it('accepts a well-formed export', () => {
    expect(exportFileSchema.safeParse({ version: 1, applications: [stored] }).success).toBe(true)
  })

  it('rejects applications missing bookkeeping fields', () => {
    expect(exportFileSchema.safeParse({ version: 1, applications: [valid] }).success).toBe(false)
  })

  it('defaults history to empty so older exports still import', () => {
    const result = exportFileSchema.safeParse({ version: 1, applications: [stored] })
    expect(result.data.applications[0].history).toEqual([])
  })

  it('validates history entries and offer details', () => {
    const withHistory = { ...stored, history: [{ status: 'Applied', at: '2024-03-01T00:00:00Z' }], offer: { baseSalary: 60000, remoteDays: 2 } }
    expect(exportFileSchema.safeParse({ version: 1, applications: [withHistory] }).success).toBe(true)
    const badHistory = { ...stored, history: [{ status: 'Ghosted', at: 'x' }] }
    expect(exportFileSchema.safeParse({ version: 1, applications: [badHistory] }).success).toBe(false)
    const badOffer = { ...stored, offer: { remoteDays: 9 } }
    expect(exportFileSchema.safeParse({ version: 1, applications: [badOffer] }).success).toBe(false)
  })

  it('rejects a file without a version', () => {
    expect(exportFileSchema.safeParse({ applications: [stored] }).success).toBe(false)
  })
})
