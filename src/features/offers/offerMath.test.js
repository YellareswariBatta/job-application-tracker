import { analyseOffer, bestIndex } from './offerMath'

describe('analyseOffer', () => {
  it('needs a base salary', () => {
    expect(analyseOffer({})).toBeNull()
    expect(analyseOffer({ baseSalary: 0 })).toBeNull()
  })

  it('adds bonus and employer pension to the package value', () => {
    const result = analyseOffer({ baseSalary: 60000, bonusPercent: 10, pensionPercent: 5 })
    expect(result).toMatchObject({ bonus: 6000, pension: 3000, packageValue: 69000 })
  })

  it('works out hours including the commute', () => {
    // 260 - 8 bank holidays - 25 holiday = 227 days; 2 remote -> 3/5 in the office = 136.2 days; 60 min each
    const result = analyseOffer({ baseSalary: 60000, bonusPercent: 10, pensionPercent: 5, holidayDays: 25, remoteDays: 2, commuteMinutes: 60 })
    expect(result.workingDays).toBe(227)
    expect(result.commuteHours).toBeCloseTo(136.2, 1)
    expect(result.effectiveHourly).toBeCloseTo(69000 / (227 * 7.5 + 136.2), 2)
  })

  it('rewards a shorter commute, more remote days and more holiday', () => {
    const base = { baseSalary: 50000, holidayDays: 25, remoteDays: 0, commuteMinutes: 90 }
    const worse = analyseOffer(base).effectiveHourly
    expect(analyseOffer({ ...base, commuteMinutes: 20 }).effectiveHourly).toBeGreaterThan(worse)
    expect(analyseOffer({ ...base, remoteDays: 3 }).effectiveHourly).toBeGreaterThan(worse)
    expect(analyseOffer({ ...base, holidayDays: 33 }).effectiveHourly).toBeGreaterThan(worse)
  })

  it('assumes 25 days holiday and no commute when unspecified', () => {
    expect(analyseOffer({ baseSalary: 50000 })).toMatchObject({ workingDays: 227, commuteHours: 0 })
  })
})

describe('bestIndex', () => {
  it('finds the highest or lowest value', () => {
    expect(bestIndex([10, 30, 20])).toBe(1)
    expect(bestIndex([10, 30, 20], false)).toBe(0)
  })

  it('skips missing values', () => {
    expect(bestIndex([null, 5, 9])).toBe(2)
  })

  it('returns -1 when there is nothing meaningful to compare', () => {
    expect(bestIndex([5])).toBe(-1)
    expect(bestIndex([null, 5])).toBe(-1)
    expect(bestIndex([5, 5, 5])).toBe(-1)
  })
})
