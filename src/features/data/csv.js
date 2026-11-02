const COLUMNS = [
  ['Company', 'company'],
  ['Role', 'role'],
  ['Status', 'status'],
  ['Source', 'source'],
  ['Date applied', 'dateApplied'],
  ['Salary minimum (GBP)', 'salaryMin'],
  ['Salary maximum (GBP)', 'salaryMax'],
  ['Job link', 'jobLink'],
  ['Follow-up date', 'followUpDate'],
  ['Interview date', 'interviewDate'],
  ['Notes', 'notes'],
  ['Last updated', 'updatedAt'],
]

// A spreadsheet treats a cell starting with = + - or @ as a formula. Prefixing an apostrophe stops
// a malicious job title (or imported data) running as one when the file is opened.
function toCell(value) {
  if (value === undefined || value === null) return ''
  let text = String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** CSV text for a spreadsheet. Starts with a byte-order mark so Excel reads £ and accents correctly. */
export function applicationsToCSV(applications) {
  const header = COLUMNS.map(([title]) => toCell(title)).join(',')
  const rows = applications.map((app) => COLUMNS.map(([, key]) => toCell(app[key])).join(','))
  return `﻿${[header, ...rows].join('\r\n')}\r\n`
}
