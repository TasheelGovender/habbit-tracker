import { describe, expect, it } from 'vitest'
import { calculateLevelUp, calculateXpReward, calculateXpToNextLevel, reverseLevelUp } from '~/utils/xp'

describe('calculateXpReward', () => {
  it('returns base XP from difficulty alone when streak is 0', () => {
    expect(calculateXpReward(1, 0)).toBe(10)
    expect(calculateXpReward(3, 0)).toBe(30)
    expect(calculateXpReward(5, 0)).toBe(50)
  })

  it('adds streak bonus to base XP', () => {
    expect(calculateXpReward(3, 5)).toBe(40)
    expect(calculateXpReward(5, 10)).toBe(70)
    expect(calculateXpReward(1, 1)).toBe(12)
  })
})

describe('calculateXpToNextLevel', () => {
  it('returns 100 for any level', () => {
    expect(calculateXpToNextLevel(1)).toBe(100)
    expect(calculateXpToNextLevel(5)).toBe(100)
    expect(calculateXpToNextLevel(99)).toBe(100)
  })
})

describe('calculateLevelUp', () => {
  it('does not level up when XP stays below threshold', () => {
    const result = calculateLevelUp(50, 40, 1)
    expect(result).toEqual({ xp: 90, level: 1 })
  })

  it('levels up when XP reaches threshold', () => {
    const result = calculateLevelUp(80, 30, 1)
    expect(result).toEqual({ xp: 10, level: 2 })
  })

  it('levels up exactly at threshold boundary', () => {
    const result = calculateLevelUp(70, 30, 1)
    expect(result).toEqual({ xp: 0, level: 2 })
  })

  it('handles multiple level-ups from a single XP gain', () => {
    const result = calculateLevelUp(90, 210, 1)
    expect(result).toEqual({ xp: 0, level: 4 })
  })

  it('preserves remainder XP after multiple level-ups', () => {
    const result = calculateLevelUp(50, 275, 2)
    expect(result).toEqual({ xp: 25, level: 5 })
  })

  it('works at higher levels', () => {
    const result = calculateLevelUp(95, 10, 10)
    expect(result).toEqual({ xp: 5, level: 11 })
  })
})

describe('reverseLevelUp', () => {
  it('subtracts XP without level change when XP stays positive', () => {
    const result = reverseLevelUp(80, 30, 2)
    expect(result).toEqual({ xp: 50, level: 2 })
  })

  it('drops a level when XP goes negative', () => {
    const result = reverseLevelUp(10, 40, 2)
    expect(result).toEqual({ xp: 70, level: 1 })
  })

  it('drops multiple levels for large XP removal', () => {
    const result = reverseLevelUp(10, 250, 4)
    expect(result).toEqual({ xp: 60, level: 1 })
  })

  it('floors at level 1 with 0 XP', () => {
    const result = reverseLevelUp(10, 500, 2)
    expect(result).toEqual({ xp: 0, level: 1 })
  })

  it('handles exact XP removal', () => {
    const result = reverseLevelUp(50, 50, 3)
    expect(result).toEqual({ xp: 0, level: 3 })
  })
})
