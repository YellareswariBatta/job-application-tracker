import { extractKeywords, guessSource, matchKeywords, parseJobAdvert } from './jobAdvert'

describe('parseJobAdvert', () => {
  it('reads "Role at Company" headlines, a salary range and a link', () => {
    const text = `Frontend Developer at Northwind Digital
Salary: £55,000 - £65,000 per annum
Apply: https://example.com/jobs/42.`
    expect(parseJobAdvert(text)).toEqual({
      role: 'Frontend Developer',
      company: 'Northwind Digital',
      salaryMin: 55000,
      salaryMax: 65000,
      jobLink: 'https://example.com/jobs/42',
    })
  })

  it('prefers labelled fields', () => {
    const result = parseJobAdvert('Job title: Platform Engineer\nCompany: Quartz Systems\nSome description here.')
    expect(result).toMatchObject({ role: 'Platform Engineer', company: 'Quartz Systems' })
  })

  it('understands "k" salaries, including "£50-60k"', () => {
    expect(parseJobAdvert('Engineer\n£45k to £55k')).toMatchObject({ salaryMin: 45000, salaryMax: 55000 })
    expect(parseJobAdvert('Engineer\n£50-60k')).toMatchObject({ salaryMin: 50000, salaryMax: 60000 })
  })

  it('takes a single figure as the minimum', () => {
    expect(parseJobAdvert('Engineer\nSalary £48,000')).toMatchObject({ salaryMin: 48000 })
  })

  it('ignores day rates and hourly rates', () => {
    expect(parseJobAdvert('Contractor\n£300 - £400 per day')).not.toHaveProperty('salaryMin')
  })

  it('does not mistake a word starting with k for thousands', () => {
    expect(parseJobAdvert('Engineer\n£60 keyboards').salaryMin).toBeUndefined()
  })

  it('returns only what it found', () => {
    expect(parseJobAdvert('')).toEqual({})
    expect(parseJobAdvert('https://example.com/job')).toEqual({ jobLink: 'https://example.com/job' })
  })
})

describe('extractKeywords', () => {
  const advert = 'We need a React and TypeScript developer. React experience, testing with Jest, and the team uses Docker. Docker is a plus.'

  it('puts known skills first and drops filler words', () => {
    const words = extractKeywords(advert, 5)
    expect(words.slice(0, 2).sort()).toEqual(['docker', 'react'])
    expect(words).not.toContain('the')
    expect(words).not.toContain('experience')
  })

  it('keeps tokens like c# and node.js', () => {
    expect(extractKeywords('Looking for c# and node.js skills')).toEqual(expect.arrayContaining(['c#', 'node.js']))
  })
})

describe('matchKeywords', () => {
  const advert = 'React TypeScript Docker Kubernetes Jest'

  it('scores how many advert keywords the CV covers and lists the gaps', () => {
    const result = matchKeywords(advert, 'Built apps with React and TypeScript, tested using Jest.')
    expect(result.score).toBe(60)
    expect(result.matched.sort()).toEqual(['jest', 'react', 'typescript'])
    expect(result.missing.sort()).toEqual(['docker', 'kubernetes'])
  })

  it('gives no score until a CV is pasted', () => {
    expect(matchKeywords(advert, '  ').score).toBeNull()
  })
})

describe('guessSource', () => {
  it('recognises common job sites', () => {
    expect(guessSource('https://www.linkedin.com/jobs/view/1')).toBe('LinkedIn')
    expect(guessSource('https://uk.indeed.com/viewjob?jk=1')).toBe('Indeed')
    expect(guessSource('https://www.reed.co.uk/jobs/1')).toBe('Job board')
    expect(guessSource('https://careers.example.com/role')).toBe('Company website')
  })

  it('returns nothing for no or invalid links', () => {
    expect(guessSource('')).toBeUndefined()
    expect(guessSource('not a url')).toBeUndefined()
  })
})
