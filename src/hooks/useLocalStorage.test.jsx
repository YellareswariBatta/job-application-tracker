import { act, renderHook } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

beforeEach(() => localStorage.clear())

describe('useLocalStorage', () => {
  it('starts with the initial value when nothing is saved', () => {
    const { result } = renderHook(() => useLocalStorage('k', ['a']))
    expect(result.current[0]).toEqual(['a'])
  })

  it('saves updates and restores them on the next mount', () => {
    const first = renderHook(() => useLocalStorage('k', 0))
    act(() => first.result.current[1](5))
    expect(JSON.parse(localStorage.getItem('k'))).toBe(5)

    const second = renderHook(() => useLocalStorage('k', 0))
    expect(second.result.current[0]).toBe(5)
  })

  it('applies several updater calls in the same tick on top of each other', () => {
    const { result } = renderHook(() => useLocalStorage('k', 0))
    act(() => {
      result.current[1]((n) => n + 1)
      result.current[1]((n) => n + 1)
      result.current[1]((n) => n + 1)
    })
    expect(result.current[0]).toBe(3)
    expect(JSON.parse(localStorage.getItem('k'))).toBe(3)
  })

  it('ignores corrupt saved data and reports it instead of crashing', () => {
    localStorage.setItem('k', '{not json')
    const { result } = renderHook(() => useLocalStorage('k', 'fallback'))
    expect(result.current[0]).toBe('fallback')
    expect(result.current[2]).toMatch(/could not be read/)
  })

  it('keeps working in memory and reports an error when storage rejects the write', () => {
    const { result } = renderHook(() => useLocalStorage('k', 0))
    const spy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    act(() => result.current[1](9))
    expect(result.current[0]).toBe(9)
    expect(result.current[2]).toMatch(/could not be saved/)
    spy.mockRestore()
  })
})
