import type { AuthUserSeed, CategoryDocument, PlayerDocument } from '~/types/player'

const DEFAULT_CATEGORIES: Omit<CategoryDocument, 'level' | 'xp' | 'createdAt'>[] = [
  { name: 'Fitness', icon: '💪', color: '#EF4444', order: 0 },
  { name: 'Learning', icon: '📚', color: '#3B82F6', order: 1 },
  { name: 'Productivity', icon: '⚡', color: '#F59E0B', order: 2 },
  { name: 'Health', icon: '🧘', color: '#10B981', order: 3 },
  { name: 'Social', icon: '👥', color: '#8B5CF6', order: 4 },
]

export function createDefaultPlayer(
  user: AuthUserSeed,
  timezone: string,
  lastActiveDate: string,
): PlayerDocument {
  const { uid: _uid, email, displayName, photoURL } = user

  return {
    email: email ?? '',
    displayName: displayName ?? 'New Hunter',
    photoURL,
    level: 1,
    xp: 0,
    rank: 'E',
    hp: 50,
    maxHp: 50,
    title: null,
    timezone,
    lastActiveDate,
    inPenaltyZone: false,
    streakFreezes: 2,
    createdAt: null,
    updatedAt: null,
  }
}

export function createDefaultCategories(): CategoryDocument[] {
  return DEFAULT_CATEGORIES.map((category) => ({
    ...category,
    level: 1,
    xp: 0,
    createdAt: null,
  }))
}
