import { addDays } from '../../lib/dates'

// iCalendar (RFC 5545) text escaping and line folding, so the file opens in Google, Outlook and Apple Calendar.
const escapeText = (value) =>
  String(value).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

const encoder = new TextEncoder()

// Lines may be at most 75 bytes; longer ones continue on the next line starting with a space.
function fold(line) {
  if (encoder.encode(line).length <= 75) return line
  const parts = []
  let current = ''
  let bytes = 0
  for (const char of line) {
    const size = encoder.encode(char).length
    const limit = parts.length === 0 ? 75 : 74 // continuation lines lose one byte to the leading space
    if (bytes + size > limit) {
      parts.push(current)
      current = char
      bytes = size
    } else {
      current += char
      bytes += size
    }
  }
  parts.push(current)
  return parts.join('\r\n ')
}

const compactDate = (iso) => iso.replaceAll('-', '')
const stamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

function eventsFor(app) {
  const events = []
  const details = [app.role, app.jobLink].filter(Boolean).join('\n')
  if (app.interviewDate) {
    events.push({ uid: `${app.id}-interview`, date: app.interviewDate, summary: `Interview: ${app.company}`, details })
  }
  // A follow-up on a rejected application is no longer useful, so leave it out.
  if (app.followUpDate && app.status !== 'Rejected') {
    events.push({ uid: `${app.id}-followup`, date: app.followUpDate, summary: `Follow up: ${app.company}`, details })
  }
  return events
}

/** All-day calendar events for interviews and follow-ups. Returns the file text and how many events it has. */
export function buildICS(applications, now = new Date()) {
  const events = applications.flatMap(eventsFor)
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Job Tracker//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH']
  for (const event of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.uid}@job-tracker`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART;VALUE=DATE:${compactDate(event.date)}`,
      `DTEND;VALUE=DATE:${compactDate(addDays(event.date, 1))}`,
      `SUMMARY:${escapeText(event.summary)}`,
      ...(event.details ? [`DESCRIPTION:${escapeText(event.details)}`] : []),
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return { text: `${lines.map(fold).join('\r\n')}\r\n`, count: events.length }
}
