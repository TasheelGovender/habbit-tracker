import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type { AuthUserSeed, CategoryRecord, PlayerRecord } from '~/types/player'

const mockBootstrapPlayerIfNeeded = vi.fn()
const mockLoadCategories = vi.fn()

vi.mock('~/composables/usePlayer', () => ({
  usePlayer: () => ({
    bootstrapPlayerIfNeeded: mockBootstrapPlayerIfNeeded,
    loadCategories: mockLoadCategories,
  }),
}))

function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

function buildPlayer(id: string): PlayerRecord {
  return {
    id,
    displayName: `Hunter ${id}`,
    email: `${id}@example.com`,
    photoURL: `https://example.com/${id}.png`,
    level: 1,
    xp: 0,
    rank: 'E',
    hp: 50,
    maxHp: 50,
    title: null,
    inPenaltyZone: false,
    lastActiveDate: '2026-05-22',
    timezone: 'Africa/Johannesburg',
    streakFreezes: 2,
    createdAt: { seconds: 1 },
    updatedAt: { seconds: 1 },
  }
}

function buildCategory(id: string): CategoryRecord {
  return {
    id,
    name: `Category ${id}`,
    icon: 'bolt',
    color: '#7c3aed',
    level: 1,
    xp: 0,
    order: 0,
    createdAt: { seconds: 1 },
  }
}

function buildUser(uid: string): AuthUserSeed {
  return {
    uid,
    displayName: `Hunter ${uid}`,
    email: `${uid}@example.com`,
    photoURL: `https://example.com/${uid}.png`,
  }
}

describe('usePlayerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializeForUser hydrates player and categories after bootstrap', async () => {
    const player = buildPlayer('hunter-1')
    const categories = [buildCategory('strength')]

    mockBootstrapPlayerIfNeeded.mockResolvedValue(player)
    mockLoadCategories.mockResolvedValue(categories)

    const { usePlayerStore } = await import('~/stores/player')
    const store = usePlayerStore()

    await store.initializeForUser(buildUser('hunter-1'))

    expect(store.player?.id).toBe('hunter-1')
    expect(store.categories).toHaveLength(1)
    expect(store.error).toBeNull()
  })

  it('applyQuestXpResult updates player and category XP/level', async () => {
    const { usePlayerStore } = await import('~/stores/player')
    const store = usePlayerStore()

    store.player = buildPlayer('hunter-1')
    store.categories = [buildCategory('strength'), buildCategory('focus')]

    store.applyQuestXpResult({
      playerXp: 75,
      playerLevel: 2,
      categoryId: 'strength',
      categoryXp: 40,
      categoryLevel: 3,
    })

    expect(store.player!.xp).toBe(75)
    expect(store.player!.level).toBe(2)
    expect(store.categories[0].xp).toBe(40)
    expect(store.categories[0].level).toBe(3)
    expect(store.categories[1].xp).toBe(0)
    expect(store.categories[1].level).toBe(1)
  })

  it('keeps the latest initializeForUser result when requests resolve out of order', async () => {
    const firstBootstrap = createDeferred<PlayerRecord>()
    const secondBootstrap = createDeferred<PlayerRecord>()
    const secondCategories = createDeferred<CategoryRecord[]>()

    mockBootstrapPlayerIfNeeded.mockImplementation(({ uid }: AuthUserSeed) => {
      if (uid === 'hunter-1') {
        return firstBootstrap.promise
      }

      return secondBootstrap.promise
    })

    mockLoadCategories.mockImplementation((uid: string) => {
      if (uid === 'hunter-2') {
        return secondCategories.promise
      }

      return Promise.resolve([buildCategory('stale-category')])
    })

    const { usePlayerStore } = await import('~/stores/player')
    const store = usePlayerStore()

    const firstInitialize = store.initializeForUser(buildUser('hunter-1'))
    const secondInitialize = store.initializeForUser(buildUser('hunter-2'))

    secondBootstrap.resolve(buildPlayer('hunter-2'))
    secondCategories.resolve([buildCategory('focus')])

    await secondInitialize

    expect(store.player?.id).toBe('hunter-2')
    expect(store.categories).toEqual([buildCategory('focus')])
    expect(store.isLoading).toBe(false)
    expect(store.isBootstrapping).toBe(false)

    firstBootstrap.resolve(buildPlayer('hunter-1'))
    await firstInitialize

    expect(store.player?.id).toBe('hunter-2')
    expect(store.categories).toEqual([buildCategory('focus')])
    expect(store.isLoading).toBe(false)
    expect(store.isBootstrapping).toBe(false)
    expect(mockLoadCategories).toHaveBeenCalledTimes(1)
  })
})
