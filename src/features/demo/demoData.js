import { addDays, startOfWeekISO, todayISO } from '../../lib/dates'

// A reserved address (".invalid" can never be a real mailbox) for the shared demo account.
export const DEMO_EMAIL = 'demo@jobtracker.invalid'
export const DEMO_NAME = 'Demo User'

// Fictional companies only. Dates are relative to "today" so the board, reminders and charts always look current.
// `moves` are [status, days after applying] and become the status history (and so the funnel and timeline).
const SAMPLES = [
  { company: 'Northwind Digital', role: 'Frontend Developer', status: 'Applied', source: 'LinkedIn', ago: 1, min: 55000, max: 65000, followUp: 5, note: 'Applied via referral. Tailor the CV towards design systems.' },
  { company: 'Fernhill Studio', role: 'UI Engineer', status: 'Applied', source: 'Company website', ago: 2, min: 50000, max: 60000, followUp: 6 },
  { company: 'Meridian Software', role: 'React Developer', status: 'Applied', source: 'Indeed', ago: 7, min: 60000, max: 70000, followUp: -2, note: 'No reply yet. Send a polite chaser.' },
  { company: 'Tidewater Retail', role: 'Web Developer', status: 'Applied', source: 'Job board', ago: 15, min: 45000, max: 52000 },
  { company: 'Bluebird Labs', role: 'Product Engineer', status: 'Interviewing', source: 'Referral', ago: 17, min: 65000, max: 80000, moves: [['Interviewing', 6]], interview: 'monday', note: 'Technical interview: pair programming plus system design.', offer: { baseSalary: 72000, bonusPercent: 8, pensionPercent: 5, holidayDays: 25, remoteDays: 2, commuteMinutes: 70 } },
  { company: 'Cobalt Health Tech', role: 'Full-stack Engineer', status: 'Interviewing', source: 'Recruiter or agency', ago: 21, min: 70000, max: 85000, moves: [['Interviewing', 8]], followUp: 0, interview: 'today', note: 'Prepare questions about their testing approach.', offer: { baseSalary: 78000, bonusPercent: 5, pensionPercent: 6, holidayDays: 28, remoteDays: 3, commuteMinutes: 90 } },
  { company: 'Quartz Systems', role: 'Platform Engineer', status: 'Interviewing', source: 'LinkedIn', ago: 30, min: 75000, max: 90000, moves: [['Interviewing', 10]] },
  { company: 'Harbour & Co', role: 'Software Engineer', status: 'Offer', source: 'Referral', ago: 36, min: 72000, max: 78000, moves: [['Interviewing', 7], ['Offer', 22]], note: 'Offer received. Decision needed by the end of next week.', offer: { baseSalary: 75000, bonusPercent: 10, pensionPercent: 5, holidayDays: 25, remoteDays: 1, commuteMinutes: 45 } },
  { company: 'Lumen Analytics', role: 'Data Engineer', status: 'Rejected', source: 'Job board', ago: 44, min: 68000, max: 76000, moves: [['Interviewing', 9], ['Rejected', 21]], note: 'Went with an internal candidate. Asked for feedback.' },
  { company: 'Juniper Cloud', role: 'DevOps Engineer', status: 'Rejected', source: 'Indeed', ago: 49, min: 70000, max: 82000, moves: [['Rejected', 12]] },
  { company: 'Atlas Mobility', role: 'TypeScript Developer', status: 'Applied', source: 'LinkedIn', ago: 25, min: 58000, max: 68000 },
  { company: 'Willow & Pine', role: 'Frontend Engineer', status: 'Interviewing', source: 'Company website', ago: 10, min: 62000, max: 72000, moves: [['Interviewing', 4]], note: 'First-round call went well.' },
]

/** Builds valid application records for the demo account. */
export function buildDemoApplications(now = new Date()) {
  const today = todayISO(now)
  const monday = startOfWeekISO(today)

  return SAMPLES.map((s, index) => {
    const dateApplied = addDays(today, -s.ago)
    // Each history entry is dated at midday on its day, never later than today.
    const at = (isoDay) => `${isoDay > today ? today : isoDay}T12:00:00.000Z`
    const history = [
      { status: 'Applied', at: at(dateApplied) },
      ...(s.moves ?? []).map(([status, days]) => ({ status, at: at(addDays(dateApplied, days)) })),
    ]
    const stamp = history[history.length - 1].at
    return {
      id: `demo-${index + 1}`,
      company: s.company,
      role: s.role,
      status: s.status,
      source: s.source,
      dateApplied,
      salaryMin: s.min,
      salaryMax: s.max,
      jobLink: `https://example.com/jobs/${index + 1}`,
      // Follow-up offsets are relative to today; negative means overdue.
      followUpDate: s.followUp === undefined ? undefined : addDays(today, s.followUp),
      // Two interviews inside the current Mon–Sun week so "Interviews this week" is never empty.
      interviewDate: s.interview === 'today' ? today : s.interview === 'monday' ? monday : undefined,
      notes: s.note ?? '',
      history,
      offer: s.offer,
      createdAt: at(dateApplied),
      updatedAt: stamp,
    }
  })
}
