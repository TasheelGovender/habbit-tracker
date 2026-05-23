import { beforeEach, describe, expect, it, vi } from 'vitest'

const { addDoc, deleteDoc, getDocs, runTransaction, docFn, collectionFn } = vi.hoisted(() => ({
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(),
  runTransaction: vi.fn(),
  docFn: vi.fn((...parts: string[]) => ({ path: parts.join('/') })),
  collectionFn: vi.fn((...parts: string[]) => ({ path: parts.join('/') })),
}))

vi.mock('firebase/firestore', () => ({
  addDoc,
  deleteDoc,
  getDocs,
  runTransaction,
  doc: (...args: string[]) => docFn(...args),
  collection: (...args: string[]) => collectionFn(...args),
  serverTimestamp: () => 'server-timestamp',
  arrayUnion: (val: string) => ({ _arrayUnion: val }),
  arrayRemove: (val: string) => ({ _arrayRemove: val }),
}))

vi.mock('date-fns-tz', () => ({
  formatInTimeZone: () => '2026-05-23',
}))

vi.stubGlobal('useFirestore', () => ({ name: 'db' }))

import { useQuest } from '~/composables/useQuest'

describe('useQuest', () => {
  beforeEach(() => {
    addDoc.mockReset()
    deleteDoc.mockReset()
    getDocs.mockReset()
    runTransaction.mockReset()
    docFn.mockClear()
    collectionFn.mockClear()
  })

  describe('createQuest', () => {
    it('adds a quest document to the user quests subcollection', async () => {
      addDoc.mockResolvedValue({ id: 'quest-1' })

      const { createQuest } = useQuest()
      const result = await createQuest('user-1', {
        title: 'Morning Run',
        categoryId: 'default-0',
        difficulty: 3,
        frequency: 'weekly',
        frequencyTarget: 1,
        frequencyPeriod: 'week',
      })

      expect(addDoc).toHaveBeenCalledTimes(1)
      const [, data] = addDoc.mock.calls[0]
      expect(data.title).toBe('Morning Run')
      expect(data.categoryId).toBe('default-0')
      expect(data.difficulty).toBe(3)
      expect(data.frequency).toBe('weekly')
      expect(data.frequencyTarget).toBe(1)
      expect(data.frequencyPeriod).toBe('week')
      expect(data.streak).toBe(0)
      expect(data.completedDates).toEqual([])
      expect(result.id).toBe('quest-1')
    })
  })

  describe('loadQuests', () => {
    it('returns all quests for a user', async () => {
      getDocs.mockResolvedValue({
        docs: [
          {
            id: 'quest-1',
            data: () => ({
              title: 'Morning Run',
              categoryId: 'default-0',
              difficulty: 3,
              streak: 5,
              completedDates: ['2026-05-22'],
              createdAt: null,
              updatedAt: null,
            }),
          },
          {
            id: 'quest-2',
            data: () => ({
              title: 'Read 30 min',
              categoryId: 'default-1',
              difficulty: 2,
              streak: 0,
              completedDates: [],
              createdAt: null,
              updatedAt: null,
            }),
          },
        ],
      })

      const { loadQuests } = useQuest()
      const quests = await loadQuests('user-1')

      expect(quests).toHaveLength(2)
      expect(quests[0].id).toBe('quest-1')
      expect(quests[0].title).toBe('Morning Run')
      expect(quests[1].id).toBe('quest-2')
      expect(quests[1].title).toBe('Read 30 min')
    })
  })

  describe('completeQuest', () => {
    it('runs a transaction that updates quest, category, and player', async () => {
      runTransaction.mockImplementation(async (_db: unknown, fn: (t: unknown) => Promise<unknown>) => {
        const transaction = {
          get: vi.fn()
            .mockResolvedValueOnce({
              data: () => ({ completedDates: [], streak: 2 }),
            })
            .mockResolvedValueOnce({
              data: () => ({ xp: 80, level: 1 }),
            })
            .mockResolvedValueOnce({
              data: () => ({ xp: 50, level: 1, timezone: 'Africa/Johannesburg' }),
            }),
          update: vi.fn(),
        }
        return fn(transaction)
      })

      const { completeQuest } = useQuest()
      const result = await completeQuest('user-1', 'quest-1', 'default-0', 3, 2)

      expect(runTransaction).toHaveBeenCalledTimes(1)
      expect(result.xpAwarded).toBe(34)
    })
  })

  describe('uncompleteQuest', () => {
    it('runs a transaction that reverses quest completion and XP', async () => {
      runTransaction.mockImplementation(async (_db: unknown, fn: (t: unknown) => Promise<unknown>) => {
        const transaction = {
          get: vi.fn()
            .mockResolvedValueOnce({
              data: () => ({ completedDates: ['2026-05-23'], streak: 3 }),
            })
            .mockResolvedValueOnce({
              data: () => ({ xp: 10, level: 2 }),
            })
            .mockResolvedValueOnce({
              data: () => ({ xp: 80, level: 1, timezone: 'Africa/Johannesburg' }),
            }),
          update: vi.fn(),
        }
        return fn(transaction)
      })

      const { uncompleteQuest } = useQuest()
      const result = await uncompleteQuest('user-1', 'quest-1', 'default-0', 3, 3)

      expect(runTransaction).toHaveBeenCalledTimes(1)
      expect(result.xpReversed).toBe(36)
    })
  })

  describe('deleteQuest', () => {
    it('deletes the quest document', async () => {
      deleteDoc.mockResolvedValue(undefined)

      const { deleteQuest } = useQuest()
      await deleteQuest('user-1', 'quest-1')

      expect(deleteDoc).toHaveBeenCalledTimes(1)
    })
  })
})
