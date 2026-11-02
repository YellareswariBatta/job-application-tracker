// Assumptions behind the comparison, shown to the user on the page.
export const HOURS_PER_DAY = 7.5
export const BANK_HOLIDAYS = 8 // England and Wales
export const WEEKDAYS_PER_YEAR = 260
export const DEFAULT_HOLIDAY_DAYS = 25

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

/**
 * Turns an offer into comparable numbers. Returns null without a base salary.
 *  - packageValue: base plus bonus plus the employer pension contribution (before tax).
 *  - effectiveHourly: packageValue divided by paid working hours plus unpaid commuting hours,
 *    so a long commute or fewer holidays lower the figure.
 * An estimate for comparing offers, not tax or financial advice.
 */
export function analyseOffer(offer = {}) {
  const base = offer.baseSalary
  if (!(base > 0)) return null

  const bonus = (base * (offer.bonusPercent ?? 0)) / 100
  const pension = (base * (offer.pensionPercent ?? 0)) / 100
  const packageValue = base + bonus + pension

  const holiday = offer.holidayDays ?? DEFAULT_HOLIDAY_DAYS
  const workingDays = Math.max(0, WEEKDAYS_PER_YEAR - BANK_HOLIDAYS - holiday)
  const remoteDays = clamp(offer.remoteDays ?? 0, 0, 5)
  const officeDays = (workingDays * (5 - remoteDays)) / 5
  const commuteHours = (officeDays * (offer.commuteMinutes ?? 0)) / 60 // minutes are per office day, round trip

  const totalHours = workingDays * HOURS_PER_DAY + commuteHours
  return {
    base,
    bonus,
    pension,
    packageValue,
    workingDays,
    commuteHours,
    effectiveHourly: totalHours === 0 ? 0 : packageValue / totalHours,
  }
}

/** Index of the best value in a list (ignoring nulls), or -1 if there is nothing to compare or all are equal. */
export function bestIndex(values, higherIsBetter = true) {
  const usable = values.map((v, i) => [v, i]).filter(([v]) => typeof v === 'number')
  if (usable.length < 2) return -1
  const best = usable.reduce((a, b) => ((higherIsBetter ? b[0] > a[0] : b[0] < a[0]) ? b : a))
  return usable.every(([v]) => v === best[0]) ? -1 : best[1]
}
