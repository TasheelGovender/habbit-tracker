import { describe, expect, it } from 'vitest'

import type { AuthUserSeed, CategoryDocument, PlayerDocument } from '~/types/player'
import { createDefaultCategories, createDefaultPlayer } from '~/utils/player-defaults'

describe('player defaults', () => {
  it('createDefaultPlayer builds a level-1 rank-E hunter profile from auth user data and keeps timezone/lastActiveDate', () => {
    const user: AuthUserSeed = {
      uid: 'user-123',
      email: 'hunter@example.com',
      displayName: 'Sung Jin-Woo',
      photoURL: 'https://example.com/avatar.png',
    }

    const player: PlayerDocument = createDefaultPlayer(
      user,
      'Africa/Johannesburg',
      '2025-09-01',
    )
    expect(player).toEqual({
      email: 'hunter@example.com',
      displayName: 'Sung Jin-Woo',
      photoURL: 'https://example.com/avatar.png',
      level: 1,
      xp: 0,
      rank: 'E',
      hp: 50,
      maxHp: 50,
      title: null,
      timezone: 'Africa/Johannesburg',
      lastActiveDate: '2025-09-01',
      inPenaltyZone: false,
      streakFreezes: 2,
      createdAt: null,
      updatedAt: null,
    })
    expect(player).not.toHaveProperty('id')
  })

  it('createDefaultPlayer applies string defaults when auth profile fields are missing', () => {
    const user: AuthUserSeed = {
      uid: 'user-456',
      email: null,
      displayName: null,
      photoURL: null,
    }

    const player: PlayerDocument = createDefaultPlayer(
      user,
      'UTC',
      '2025-09-02',
    )

    expect(player.displayName).toBe('New Hunter')
    expect(player.email).toBe('')
    expect(typeof player.displayName).toBe('string')
    expect(typeof player.email).toBe('string')
    expect(player).not.toHaveProperty('id')
  })

  it('createDefaultCategories returns Fitness, Learning, Productivity, Health, Social in order 0..4, all at level 1 and xp 0', () => {
    const categories: CategoryDocument[] = createDefaultCategories()

    expect(categories).toEqual([
      {
        name: 'Fitness',
        icon: '💪',
        color: '#EF4444',
        order: 0,
        level: 1,
        xp: 0,
        createdAt: null,
      },
      {
        name: 'Learning',
        icon: '📚',
        color: '#3B82F6',
        order: 1,
        level: 1,
        xp: 0,
        createdAt: null,
      },
      {
        name: 'Productivity',
        icon: '⚡',
        color: '#F59E0B',
        order: 2,
        level: 1,
        xp: 0,
        createdAt: null,
      },
      {
        name: 'Health',
        icon: '🧘',
        color: '#10B981',
        order: 3,
        level: 1,
        xp: 0,
        createdAt: null,
      },
      {
        name: 'Social',
        icon: '👥',
        color: '#8B5CF6',
        order: 4,
        level: 1,
        xp: 0,
        createdAt: null,
      },
    ])
  })
})
