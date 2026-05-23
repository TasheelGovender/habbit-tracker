import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetDoc = vi.fn()
const mockGetDocs = vi.fn()
const mockRunTransaction = vi.fn()
const mockDoc = vi.fn()
const mockCollection = vi.fn()
const mockServerTimestamp = vi.fn()

vi.mock('firebase/firestore', () => ({
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  runTransaction: mockRunTransaction,
  doc: mockDoc,
  collection: mockCollection,
  serverTimestamp: mockServerTimestamp,
}))

vi.mock('date-fns-tz', () => ({
  formatInTimeZone: vi.fn(() => '2026-05-22'),
}))

describe('usePlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('bootstrapPlayerIfNeeded creates a player and starter categories for a first-time user', async () => {
    const fakeDb = { name: 'firestore-db' }
    const playerRef = { path: 'users/hunter-1' }
    const categoriesRef = { path: 'users/hunter-1/categories' }
    const categoryRefs = Array.from({ length: 5 }, (_, index) => ({
      path: `users/hunter-1/categories/default-${index}`,
    }))
    const transaction = {
      get: vi.fn().mockResolvedValue({
        exists: () => false,
      }),
      set: vi.fn(),
    }

    vi.stubGlobal('useFirestore', vi.fn(() => fakeDb))

    mockRunTransaction.mockImplementation(async (_db, callback) => callback(transaction))
    mockServerTimestamp.mockReturnValue({ seconds: 123 })
    mockCollection.mockReturnValue(categoriesRef)
    mockDoc.mockImplementation((...args) => {
      if (args[0] === fakeDb) {
        return playerRef
      }

      const categoryId = args[1] as string
      const matchingCategoryRef = categoryRefs.find((ref) => ref.path.endsWith(categoryId))

      if (!matchingCategoryRef) {
        throw new Error(`Unexpected category doc lookup: ${String(categoryId)}`)
      }

      return matchingCategoryRef
    })
    mockGetDoc.mockResolvedValue({
      id: 'hunter-1',
      exists: () => true,
      data: () => ({
        displayName: 'Sung Jin-Woo',
        email: 'hunter@example.com',
        photoURL: 'https://example.com/avatar.png',
        level: 1,
        xp: 0,
        rank: 'E',
        hp: 50,
        maxHp: 50,
        title: null,
        timezone: 'Africa/Johannesburg',
        lastActiveDate: '2026-05-22',
        inPenaltyZone: false,
        streakFreezes: 2,
        createdAt: { seconds: 123 },
        updatedAt: { seconds: 123 },
      }),
    })

    const { usePlayer } = await import('~/composables/usePlayer')
    const { bootstrapPlayerIfNeeded } = usePlayer()

    const player = await bootstrapPlayerIfNeeded(
      {
        uid: 'hunter-1',
        displayName: 'Sung Jin-Woo',
        email: 'hunter@example.com',
        photoURL: 'https://example.com/avatar.png',
      },
      'Africa/Johannesburg',
    )

    expect(mockRunTransaction).toHaveBeenCalledTimes(1)
    expect(transaction.get).toHaveBeenCalledWith(playerRef)
    expect(transaction.set).toHaveBeenCalledTimes(6)
    expect(mockDoc).toHaveBeenNthCalledWith(1, fakeDb, 'users', 'hunter-1')
    expect(mockDoc).toHaveBeenNthCalledWith(2, categoriesRef, 'default-0')
    expect(mockDoc).toHaveBeenNthCalledWith(3, categoriesRef, 'default-1')
    expect(mockDoc).toHaveBeenNthCalledWith(4, categoriesRef, 'default-2')
    expect(mockDoc).toHaveBeenNthCalledWith(5, categoriesRef, 'default-3')
    expect(mockDoc).toHaveBeenNthCalledWith(6, categoriesRef, 'default-4')
    expect(player.id).toBe('hunter-1')
    expect(player.rank).toBe('E')
  })

  it('bootstrapPlayerIfNeeded skips writes when a concurrent bootstrap wins the transaction retry', async () => {
    const fakeDb = { name: 'firestore-db' }
    const playerRef = { path: 'users/hunter-1' }
    const categoriesRef = { path: 'users/hunter-1/categories' }
    const firstAttempt = {
      get: vi.fn().mockResolvedValue({
        exists: () => false,
      }),
      set: vi.fn(),
    }
    const retryAttempt = {
      get: vi.fn().mockResolvedValue({
        exists: () => true,
      }),
      set: vi.fn(),
    }

    vi.stubGlobal('useFirestore', vi.fn(() => fakeDb))

    mockRunTransaction.mockImplementation(async (_db, callback) => {
      await callback(firstAttempt)
      await callback(retryAttempt)
    })
    mockServerTimestamp.mockReturnValue({ seconds: 123 })
    mockCollection.mockReturnValue(categoriesRef)
    mockDoc.mockImplementation((...args) => {
      if (args[0] === fakeDb) {
        return playerRef
      }

      return { path: `users/hunter-1/categories/${String(args[1])}` }
    })
    mockGetDoc.mockResolvedValue({
      id: 'hunter-1',
      exists: () => true,
      data: () => ({
        displayName: 'Sung Jin-Woo',
        email: 'hunter@example.com',
        photoURL: 'https://example.com/avatar.png',
        level: 1,
        xp: 0,
        rank: 'E',
        hp: 50,
        maxHp: 50,
        title: null,
        timezone: 'Africa/Johannesburg',
        lastActiveDate: '2026-05-22',
        inPenaltyZone: false,
        streakFreezes: 2,
        createdAt: { seconds: 123 },
        updatedAt: { seconds: 123 },
      }),
    })

    const { usePlayer } = await import('~/composables/usePlayer')
    const { bootstrapPlayerIfNeeded } = usePlayer()

    await bootstrapPlayerIfNeeded(
      {
        uid: 'hunter-1',
        displayName: 'Sung Jin-Woo',
        email: 'hunter@example.com',
        photoURL: 'https://example.com/avatar.png',
      },
      'Africa/Johannesburg',
    )

    expect(mockRunTransaction).toHaveBeenCalledTimes(1)
    expect(firstAttempt.set).toHaveBeenCalledTimes(6)
    expect(retryAttempt.set).not.toHaveBeenCalled()
  })
})
