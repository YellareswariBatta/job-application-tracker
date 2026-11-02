// Everything here runs in the browser on pasted text. Nothing is sent anywhere.

const STOP_WORDS = new Set(
  `a about above across after again all also am an and any are as at be because been before being below between both
  but by can could did do does doing down during each either few for from further had has have having he her here
  him his how i if in into is it its just may me more most must my no nor not now of off on once one only or other
  our out over own per same she should so some such than that the their them then there these they this those
  through to too under until up us use very via was we were what when where which while who whom why will with
  within without would you your yours able ability about apply applicants application candidate candidates company
  day days different employer environment excellent experience experienced following good great help including
  job join keen looking make need needs new opportunity part people position required requirements responsibilities
  role skills strong successful team teams time understanding well work working year years`.split(/\s+/),
)

// Skills worth ranking higher than ordinary words.
const KNOWN_SKILLS = new Set(
  `react typescript javascript node.js nodejs python java sql nosql aws azure gcp docker kubernetes git graphql rest
  api css html tailwind sass agile scrum jest vitest cypress playwright redux next.js nextjs vue angular figma
  accessibility a11y ci cd devops terraform linux mongodb postgres postgresql mysql django flask spring c# c++ php
  ruby rails go rust swift kotlin android ios testing tdd microservices security`.split(/\s+/),
)

const TOKEN = /[a-z][a-z0-9]*(?:[.+#][a-z0-9+#]*)*/g

function tokens(text) {
  return (text.toLowerCase().match(TOKEN) ?? []).map((t) => t.replace(/\.+$/, ''))
}

/** The most useful words in a piece of text: known skills first, then the most repeated ordinary words. */
export function extractKeywords(text, limit = 25) {
  const counts = new Map()
  for (const token of tokens(text)) {
    const known = KNOWN_SKILLS.has(token)
    if (STOP_WORDS.has(token) || (!known && token.length < 3)) continue
    counts.set(token, (counts.get(token) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([word, count]) => ({ word, score: count + (KNOWN_SKILLS.has(word) ? 3 : 0) }))
    .sort((a, b) => b.score - a.score || a.word.localeCompare(b.word))
    .slice(0, limit)
    .map((entry) => entry.word)
}

/** How many of the advert's keywords appear in the CV. `score` is null until both texts have content. */
export function matchKeywords(advertText, cvText, limit = 25) {
  const keywords = extractKeywords(advertText, limit)
  if (keywords.length === 0 || !cvText.trim()) return { score: null, matched: [], missing: keywords, keywords }
  const cvWords = new Set(tokens(cvText))
  const matched = keywords.filter((k) => cvWords.has(k))
  const missing = keywords.filter((k) => !cvWords.has(k))
  return { score: Math.round((matched.length / keywords.length) * 100), matched, missing, keywords }
}

// ---------- Field detection ----------

const tidy = (value) => value.trim().replace(/[\s.,;:]+$/, '').slice(0, 100)

// "£45,000", "£45k", "£45.5k"; the "k" must not be the start of a word like "keyboard".
const AMOUNT = '£\\s?(\\d{1,3}(?:,\\d{3})+|\\d+(?:\\.\\d+)?)(?:\\s?(k)(?![a-z]))?'
const RANGE = new RegExp(`${AMOUNT}\\s*(?:-|–|—|to)\\s*£?\\s?(\\d{1,3}(?:,\\d{3})+|\\d+(?:\\.\\d+)?)(?:\\s?(k)(?![a-z]))?`, 'i')
const SINGLE = new RegExp(AMOUNT, 'i')
const MIN_ANNUAL_SALARY = 1000 // below this it is probably a day rate or hourly rate

const toNumber = (digits, thousands) => parseFloat(digits.replace(/,/g, '')) * (thousands ? 1000 : 1)

function findSalary(text) {
  const range = text.match(RANGE)
  if (range) {
    const [, a, kA, b, kB] = range
    let min = toNumber(a, kA)
    const max = toNumber(b, kB)
    if (!kA && kB && min < 1000) min *= 1000 // "£50-60k" means 50k to 60k
    if (min >= MIN_ANNUAL_SALARY && max >= min) return { salaryMin: min, salaryMax: max }
  }
  const single = text.match(SINGLE)
  if (single) {
    const value = toNumber(single[1], single[2])
    if (value >= MIN_ANNUAL_SALARY) return { salaryMin: value }
  }
  return {}
}

function labelled(lines, labels) {
  const pattern = new RegExp(`^(?:${labels})\\s*[:\\-–]\\s*(.+)$`, 'i')
  for (const line of lines) {
    const match = line.match(pattern)
    if (match) return tidy(match[1])
  }
  return undefined
}

/** Best-effort guess at the application fields in pasted job advert text. Only fields it found are returned. */
export function parseJobAdvert(text) {
  const result = {}
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) return result

  const url = text.match(/https?:\/\/[^\s<>"')]+/i)
  if (url) result.jobLink = url[0].replace(/[.,;:]+$/, '')

  let role = labelled(lines, 'job title|title|role|position|vacancy')
  let company = labelled(lines, 'company|employer|organisation|organization|client')

  // Fall back to the headline: "Frontend Developer at Northwind Digital", or just a role.
  const first = lines[0]
  if (first.length <= 120 && !/^https?:\/\//i.test(first)) {
    const split = first.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i)
    if (split) {
      role ??= tidy(split[1])
      company ??= tidy(split[2])
    } else if (!/^[\w ]+\s*[:\-–]/.test(first)) {
      role ??= tidy(first)
    }
  }
  if (role) result.role = role
  if (company) result.company = company

  return { ...result, ...findSalary(text) }
}

/** Guesses where the user found a job from its link. */
export function guessSource(link) {
  if (!link) return undefined
  let host
  try {
    host = new URL(link).hostname.toLowerCase()
  } catch {
    return undefined
  }
  if (host.includes('linkedin')) return 'LinkedIn'
  if (host.includes('indeed')) return 'Indeed'
  if (/(reed|totaljobs|glassdoor|cv-library|monster|jobsite|adzuna|workable)/.test(host)) return 'Job board'
  return 'Company website'
}
