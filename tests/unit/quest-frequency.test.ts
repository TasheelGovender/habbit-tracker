import { describe, expect, it } from 'vitest'
import {
  getCompletionProgress,
  getFrequencyLabel,
  getMonthBounds,
  getWeekBounds,
  isQuestCompletedForPeriod,
} from '~/utils/quest-frequency'

describe('getFrequencyLabel', () => {
  it('returns "daily" for daily frequency', () => {
    expect(getFrequencyLabel('daily', 1, 'day')).toBe('daily')
  })

  it('returns "weekly" for weekly frequency', () => {
    expect(getFrequencyLabel('weekly', 1, 'week')).toBe('weekly')
  })

  it('returns "monthly" for monthly frequency', () => {
    expect(getFrequencyLabel('monthly', 1, 'month')).toBe('monthly')
  })

  it('returns "3x / week" for custom weekly', () => {
    expect(getFrequencyLabel('custom', 3, 'week')).toBe('3x / week')
  })

  it('returns "2x / day" for custom daily', () => {
    expect(getFrequencyLabel('custom', 2, 'day')).toBe('2x / day')
  })

  it('returns "5x / month" for custom monthly', () => {
    expect(getFrequencyLabel('custom', 5, 'month')).toBe('5x / month')
  })
})

describe('getWeekBounds', () => {
  it('returns Monday to Sunday for a mid-week date', () => {
    const [monday, sunday] = getWeekBounds('2026-05-21')
    expect(monday).toBe('2026-05-18')
    expect(sunday).toBe('2026-05-24')
  })

  it('returns correct bounds when today is Monday', () => {
    const [monday, sunday] = getWeekBounds('2026-05-18')
    expect(monday).toBe('2026-05-18')
    expect(sunday).toBe('2026-05-24')
  })

  it('returns correct bounds when today is Sunday', () => {
    const [monday, sunday] = getWeekBounds('2026-05-24')
    expect(monday).toBe('2026-05-18')
    expect(sunday).toBe('2026-05-24')
  })
})

describe('getMonthBounds', () => {
  it('returns first and last day of the month', () => {
    const [first, last] = getMonthBounds('2026-05-15')
    expect(first).toBe('2026-05-01')
    expect(last).toBe('2026-05-31')
  })

  it('handles February in a non-leap year', () => {
    const [first, last] = getMonthBounds('2027-02-10')
    expect(first).toBe('2027-02-01')
    expect(last).toBe('2027-02-28')
  })

  it('handles February in a leap year', () => {
    const [first, last] = getMonthBounds('2028-02-10')
    expect(first).toBe('2028-02-01')
    expect(last).toBe('2028-02-29')
  })
})

describe('getCompletionProgress', () => {
  it('returns 1/1 for a daily quest completed today', () => {
    const progress = getCompletionProgress(['2026-05-23'], 'daily', 1, 'day', '2026-05-23')
    expect(progress).toEqual({ current: 1, target: 1 })
  })

  it('returns 0/1 for a daily quest not completed today', () => {
    const progress = getCompletionProgress(['2026-05-22'], 'daily', 1, 'day', '2026-05-23')
    expect(progress).toEqual({ current: 0, target: 1 })
  })

  it('returns 1/1 for a weekly quest with one completion this week', () => {
    const progress = getCompletionProgress(['2026-05-19'], 'weekly', 1, 'week', '2026-05-23')
    expect(progress).toEqual({ current: 1, target: 1 })
  })

  it('returns 0/1 for a weekly quest with completions only last week', () => {
    const progress = getCompletionProgress(['2026-05-17'], 'weekly', 1, 'week', '2026-05-23')
    expect(progress).toEqual({ current: 0, target: 1 })
  })

  it('returns 2/3 for a custom 3x/week quest with 2 completions this week', () => {
    const progress = getCompletionProgress(
      ['2026-05-19', '2026-05-21'],
      'custom', 3, 'week',
      '2026-05-23',
    )
    expect(progress).toEqual({ current: 2, target: 3 })
  })

  it('returns 1/1 for a monthly quest completed this month', () => {
    const progress = getCompletionProgress(['2026-05-05'], 'monthly', 1, 'month', '2026-05-23')
    expect(progress).toEqual({ current: 1, target: 1 })
  })

  it('returns 0/1 for a monthly quest with completions only last month', () => {
    const progress = getCompletionProgress(['2026-04-28'], 'monthly', 1, 'month', '2026-05-23')
    expect(progress).toEqual({ current: 0, target: 1 })
  })

  it('returns 3/5 for a custom 5x/month quest with 3 completions this month', () => {
    const progress = getCompletionProgress(
      ['2026-05-01', '2026-05-10', '2026-05-15'],
      'custom', 5, 'month',
      '2026-05-23',
    )
    expect(progress).toEqual({ current: 3, target: 5 })
  })

  it('caps current at target even if more completions exist', () => {
    const progress = getCompletionProgress(
      ['2026-05-19', '2026-05-20', '2026-05-21', '2026-05-22'],
      'custom', 3, 'week',
      '2026-05-23',
    )
    expect(progress).toEqual({ current: 3, target: 3 })
  })
})

describe('isQuestCompletedForPeriod', () => {
  it('returns true when current meets target', () => {
    expect(isQuestCompletedForPeriod({ current: 3, target: 3 })).toBe(true)
  })

  it('returns true when current exceeds target', () => {
    expect(isQuestCompletedForPeriod({ current: 4, target: 3 })).toBe(true)
  })

  it('returns false when current is below target', () => {
    expect(isQuestCompletedForPeriod({ current: 2, target: 3 })).toBe(false)
  })
})
