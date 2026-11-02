import { applicationsToCSV } from './csv'

const app = { company: 'Acme', role: 'Developer', status: 'Applied', source: 'LinkedIn', dateApplied: '2026-01-05', salaryMin: 50000, notes: '' }

describe('applicationsToCSV', () => {
  it('writes a header and one row per application, with a BOM for Excel', () => {
    const csv = applicationsToCSV([app])
    expect(csv.startsWith('﻿Company,Role,Status,Source')).toBe(true)
    const lines = csv.trim().split('\r\n')
    expect(lines).toHaveLength(2)
    expect(lines[1]).toBe('Acme,Developer,Applied,LinkedIn,2026-01-05,50000,,,,,,')
  })

  it('quotes commas, quotes and line breaks', () => {
    const csv = applicationsToCSV([{ ...app, company: 'Smith, Jones & Co', notes: 'Said "yes"\nCall back' }])
    expect(csv).toContain('"Smith, Jones & Co"')
    expect(csv).toContain('"Said ""yes""\nCall back"')
  })

  it('defuses spreadsheet formulas', () => {
    const csv = applicationsToCSV([{ ...app, company: '=HYPERLINK("http://evil.example")', role: '+cmd', notes: '@SUM(A1)' }])
    expect(csv).not.toMatch(/(^|,)"?=HYPERLINK/m)
    expect(csv).toContain(`'=HYPERLINK`)
    expect(csv).toContain(`'+cmd`)
    expect(csv).toContain(`'@SUM`)
  })
})
