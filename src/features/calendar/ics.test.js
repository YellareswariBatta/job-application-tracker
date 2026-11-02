import { buildICS } from './ics'

const NOW = new Date('2026-06-10T09:00:00Z')
const base = { company: 'Acme', role: 'Developer', jobLink: 'https://example.com/jobs/1', status: 'Interviewing' }

describe('buildICS', () => {
  it('creates all-day events for interviews and follow-ups', () => {
    const { text, count } = buildICS([{ ...base, id: 'a1', interviewDate: '2026-06-12', followUpDate: '2026-06-20' }], NOW)
    expect(count).toBe(2)
    expect(text).toContain('BEGIN:VCALENDAR')
    expect(text).toContain('UID:a1-interview@job-tracker')
    expect(text).toContain('DTSTART;VALUE=DATE:20260612')
    expect(text).toContain('DTEND;VALUE=DATE:20260613')
    expect(text).toContain('SUMMARY:Interview: Acme')
    expect(text).toContain('SUMMARY:Follow up: Acme')
    expect(text).toContain('DTSTAMP:20260610T090000Z')
  })

  it('uses CRLF line endings and ends cleanly', () => {
    const { text } = buildICS([{ ...base, id: 'a1', interviewDate: '2026-06-12' }], NOW)
    expect(text.split('\r\n').at(-2)).toBe('END:VCALENDAR')
    expect(text.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/)
  })

  it('leaves out follow-ups for rejected applications, and applications with no dates', () => {
    const { count } = buildICS(
      [
        { ...base, id: 'r', status: 'Rejected', followUpDate: '2026-06-20' },
        { ...base, id: 'n' },
      ],
      NOW,
    )
    expect(count).toBe(0)
  })

  it('escapes special characters and folds long lines to 75 bytes', () => {
    const company = 'Smith, Jones; & Co ' + 'x'.repeat(100)
    const { text } = buildICS([{ ...base, id: 'a1', company, interviewDate: '2026-06-12' }], NOW)
    expect(text).toContain('Smith\\, Jones\\; & Co')
    for (const line of text.split('\r\n')) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75)
  })
})
