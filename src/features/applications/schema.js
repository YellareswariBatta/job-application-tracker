import { z } from 'zod'
import { SOURCES, STATUSES } from './constants'
import { isValidISODate } from '../../lib/dates'

// Form inputs give us '' for "left blank"; treat that as missing.
const blankToUndefined = (value) =>
  value === '' || value === null || value === undefined ? undefined : value

const isoDate = (label) =>
  z.string().refine(isValidISODate, { message: `${label} must be a valid date` })

const optionalIsoDate = (label) =>
  z.preprocess(blankToUndefined, isoDate(label).optional())

const optionalSalary = (label) =>
  z.preprocess(
    (value) => {
      const v = blankToUndefined(value)
      return typeof v === 'string' ? Number(v) : v
    },
    z
      .number({ invalid_type_error: `${label} must be a number` })
      .min(0, `${label} cannot be negative`)
      .optional(),
  )

// The fields a user can edit.
const formFields = z.object({
    company: z.string().trim().min(1, 'Company is required').max(100, 'Company is too long'),
    role: z.string().trim().min(1, 'Role is required').max(100, 'Role is too long'),
    dateApplied: isoDate('Date applied'),
    salaryMin: optionalSalary('Minimum salary'),
    salaryMax: optionalSalary('Maximum salary'),
    jobLink: z.preprocess(
      blankToUndefined,
      z
        .string()
        .trim()
        .url('Job link must be a valid URL')
        .refine((url) => /^https?:\/\//i.test(url), 'Job link must start with http:// or https://')
        .optional(),
    ),
    status: z.enum(STATUSES, { errorMap: () => ({ message: 'Choose a valid status' }) }),
    source: z.preprocess(
      blankToUndefined,
      z.enum(SOURCES, { errorMap: () => ({ message: 'Choose a valid source' }) }).optional(),
    ),
    followUpDate: optionalIsoDate('Follow-up date'),
    interviewDate: optionalIsoDate('Interview date'),
    notes: z.string().max(5000, 'Notes are too long (5000 characters maximum)').optional().default(''),
})

// Cross-field rule: a salary range cannot run backwards.
const salaryRangeRule = [
  (data) => data.salaryMin === undefined || data.salaryMax === undefined || data.salaryMax >= data.salaryMin,
  { message: 'Maximum salary must be at least the minimum', path: ['salaryMax'] },
]

export const applicationFormSchema = formFields.refine(...salaryRangeRule)

// One entry per status the application has been in, so we can show a timeline and measure speed.
const historyEntrySchema = z.object({
  status: z.enum(STATUSES),
  at: z.string().min(1),
})

// Details of a job offer, used by the offer comparison page. All optional.
const percent = z.number().min(0).max(100).optional()
export const offerDetailsSchema = z.object({
  baseSalary: z.number().min(0).optional(),
  bonusPercent: percent,
  pensionPercent: percent,
  holidayDays: z.number().min(0).max(100).optional(),
  remoteDays: z.number().min(0).max(5).optional(),
  commuteMinutes: z.number().min(0).max(600).optional(),
})

// A stored application: the form fields plus generated bookkeeping fields.
// `history` defaults to [] so files exported before this feature still import.
export const applicationSchema = formFields
  .extend({
    id: z.string().min(1),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
    history: z.array(historyEntrySchema).default([]),
    offer: offerDetailsSchema.optional(),
  })
  .refine(...salaryRangeRule)

// Shape of an exported file. Used to validate imports.
export const exportFileSchema = z.object({
  version: z.number().int().positive(),
  exportedAt: z.string().optional(),
  applications: z.array(applicationSchema),
})
