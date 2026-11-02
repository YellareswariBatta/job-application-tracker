import { groupByStatus, moveApplication } from './statusLogic'

const NOW = '2024-05-01T10:00:00.000Z'
const make = (id, status) => ({ id, status, updatedAt: '2024-01-01T00:00:00.000Z' })

const apps = [make('a', 'Applied'), make('b', 'Applied'), make('c', 'Interviewing')]
const ids = (list) => list.map((app) => app.id)

describe('moveApplication', () => {
  it('changes status and stamps updatedAt', () => {
    const result = moveApplication(apps, 'a', 'Offer', null, NOW)
    const moved = result.find((app) => app.id === 'a')
    expect(moved).toMatchObject({ status: 'Offer', updatedAt: NOW })
  })

  it('records each real status change in the history', () => {
    const result = moveApplication(apps, 'a', 'Interviewing', null, NOW)
    const moved = result.find((app) => app.id === 'a')
    expect(moved.history).toEqual([{ status: 'Interviewing', at: NOW }])
    // A second change appends rather than replaces.
    const again = moveApplication(result, 'a', 'Offer', null, '2024-06-01T00:00:00.000Z').find((app) => app.id === 'a')
    expect(again.history.map((h) => h.status)).toEqual(['Interviewing', 'Offer'])
  })

  it('does not touch the history when only reordering', () => {
    const result = moveApplication(apps, 'b', 'Applied', 'a', NOW)
    expect(result[0].history).toBeUndefined()
  })

  it('does not mutate the original array or objects', () => {
    const snapshot = JSON.stringify(apps)
    moveApplication(apps, 'a', 'Offer', null, NOW)
    expect(JSON.stringify(apps)).toBe(snapshot)
  })

  it('appends to the end when no target card is given', () => {
    expect(ids(moveApplication(apps, 'a', 'Interviewing', null, NOW))).toEqual(['b', 'c', 'a'])
  })

  it('places the card just before the target card', () => {
    expect(ids(moveApplication(apps, 'b', 'Interviewing', 'c', NOW))).toEqual(['a', 'b', 'c'])
  })

  it('reorders within a column without touching updatedAt', () => {
    const result = moveApplication(apps, 'b', 'Applied', 'a', NOW)
    expect(ids(result)).toEqual(['b', 'a', 'c'])
    expect(result[0].updatedAt).toBe('2024-01-01T00:00:00.000Z')
  })

  it('returns the same array when nothing would change', () => {
    expect(moveApplication(apps, 'a', 'Applied')).toBe(apps)
    expect(moveApplication(apps, 'a', 'Applied', 'a')).toBe(apps)
  })

  it('ignores unknown ids and invalid statuses', () => {
    expect(moveApplication(apps, 'zzz', 'Offer')).toBe(apps)
    expect(moveApplication(apps, 'a', 'Ghosted')).toBe(apps)
  })
})

describe('groupByStatus', () => {
  it('returns every column, including empty ones', () => {
    const grouped = groupByStatus(apps)
    expect(Object.keys(grouped)).toEqual(['Applied', 'Interviewing', 'Offer', 'Rejected'])
    expect(ids(grouped.Applied)).toEqual(['a', 'b'])
    expect(grouped.Offer).toEqual([])
  })
})
