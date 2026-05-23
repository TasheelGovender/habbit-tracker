import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const { createQuest, loadQuests, completeQuest, uncompleteQuest, deleteQuest } = vi.hoisted(() => ({
  createQuest: vi.fn(),
  loadQuests: vi.fn(),
  completeQuest: vi.fn(),
  uncompleteQuest: vi.fn(),
  deleteQuest: vi.fn(),
}))

vi.mock('~/composables/useQuest', () => ({
  useQuest: () => ({
    createQuest,
    loadQuests,
    completeQuest,
    uncompleteQuest,
    deleteQuest,
  }),
}))

vi.mock('date-fns-tz', () => ({
  formatInTimeZone: () => '2026-05-23',
}))

import { useQuestStore } from '~/stores/quest'
import { usePlayerStore } from '~/stores/player'

describe('useQuestStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    createQuest.mockReset()
    loadQuests.mockReset()
    completeQuest.mockReset()
    uncompleteQuest.mockReset()
    deleteQuest.mockReset()
  })

  describe('loadQuests', () => {
    it('loads quests and sets state', async () => {
      loadQuests.mockResolvedValue([
        {
          id: 'quest-1',
          title: 'Morning Run',
          categoryId: 'default-0',
          difficulty: 3,
          streak: 5,
          completedDates: ['2026-05-23'],
          createdAt: null,
          updatedAt: null,
        },
      ])

      const store = useQuestStore()
      await store.loadQuests('user-1')

      expect(store.quests).toHaveLength(1)
      expect(store.quests[0].title).toBe('Morning Run')
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('sets error on failure', async () => {
      loadQuests.mockRejectedValue(new Error('Network error'))

      const store = useQuestStore()

      await expect(store.loadQuests('user-1')).rejects.toThrow('Network error')
      expect(store.error).toBe('Network error')
      expect(store.isLoading).toBe(false)
    })
  })

  describe('createQuest', () => {
    it('creates a quest and adds it to the array', async () => {
      createQuest.mockResolvedValue({
        id: 'quest-new',
        title: 'Meditate',
        categoryId: 'default-3',
        difficulty: 2,
        frequency: 'daily',
        frequencyTarget: 1,
        frequencyPeriod: 'day',
        streak: 0,
        completedDates: [],
        createdAt: null,
        updatedAt: null,
      })

      const store = useQuestStore()
      await store.createQuest('user-1', {
        title: 'Meditate',
        categoryId: 'default-3',
        difficulty: 2,
        frequency: 'daily',
        frequencyTarget: 1,
        frequencyPeriod: 'day',
      })

      expect(store.quests).toHaveLength(1)
      expect(store.quests[0].id).toBe('quest-new')
    })
  })

  describe('toggleQuestCompletion', () => {
    it('completes an incomplete quest and updates player/category XP', async () => {
      completeQuest.mockResolvedValue({
        xpAwarded: 40,
        categoryLevel: 1,
        categoryXp: 40,
        playerLevel: 1,
        playerXp: 40,
      })

      const playerStore = usePlayerStore()
      playerStore.player = {
        id: 'user-1',
        displayName: 'Hunter',
        email: 'h@test.com',
        photoURL: null,
        level: 1,
        xp: 0,
        rank: 'E',
        hp: 50,
        maxHp: 50,
        title: null,
        inPenaltyZone: false,
        lastActiveDate: '2026-05-23',
        timezone: 'Africa/Johannesburg',
        streakFreezes: 2,
        createdAt: null,
        updatedAt: null,
      }
      playerStore.categories = [
        { id: 'default-0', name: 'Fitness', icon: '💪', color: '#EF4444', level: 1, xp: 0, order: 0, createdAt: null },
      ]

      const store = useQuestStore()
      store.quests = [
        {
          id: 'quest-1',
          title: 'Morning Run',
          categoryId: 'default-0',
          difficulty: 3,
          streak: 5,
          completedDates: [],
          createdAt: null,
          updatedAt: null,
        },
      ]

      await store.toggleQuestCompletion('user-1', 'quest-1')

      expect(completeQuest).toHaveBeenCalledTimes(1)
      expect(store.quests[0].completedDates).toContain('2026-05-23')
      expect(store.quests[0].streak).toBe(6)
      expect(playerStore.player!.xp).toBe(40)
      expect(playerStore.categories[0].xp).toBe(40)
    })

    it('uncompletes a completed quest and reverses XP', async () => {
      uncompleteQuest.mockResolvedValue({
        xpReversed: 40,
        categoryLevel: 1,
        categoryXp: 0,
        playerLevel: 1,
        playerXp: 0,
      })

      const playerStore = usePlayerStore()
      playerStore.player = {
        id: 'user-1',
        displayName: 'Hunter',
        email: 'h@test.com',
        photoURL: null,
        level: 1,
        xp: 40,
        rank: 'E',
        hp: 50,
        maxHp: 50,
        title: null,
        inPenaltyZone: false,
        lastActiveDate: '2026-05-23',
        timezone: 'Africa/Johannesburg',
        streakFreezes: 2,
        createdAt: null,
        updatedAt: null,
      }
      playerStore.categories = [
        { id: 'default-0', name: 'Fitness', icon: '💪', color: '#EF4444', level: 1, xp: 40, order: 0, createdAt: null },
      ]

      const store = useQuestStore()
      store.quests = [
        {
          id: 'quest-1',
          title: 'Morning Run',
          categoryId: 'default-0',
          difficulty: 3,
          streak: 6,
          completedDates: ['2026-05-23'],
          createdAt: null,
          updatedAt: null,
        },
      ]

      await store.toggleQuestCompletion('user-1', 'quest-1')

      expect(uncompleteQuest).toHaveBeenCalledTimes(1)
      expect(store.quests[0].completedDates).not.toContain('2026-05-23')
      expect(store.quests[0].streak).toBe(5)
      expect(playerStore.player!.xp).toBe(0)
      expect(playerStore.categories[0].xp).toBe(0)
    })
  })

  describe('deleteQuest', () => {
    it('removes a quest from the array', async () => {
      deleteQuest.mockResolvedValue(undefined)

      const store = useQuestStore()
      store.quests = [
        {
          id: 'quest-1',
          title: 'Morning Run',
          categoryId: 'default-0',
          difficulty: 3,
          streak: 0,
          completedDates: [],
          createdAt: null,
          updatedAt: null,
        },
      ]

      await store.deleteQuest('user-1', 'quest-1')

      expect(deleteQuest).toHaveBeenCalledTimes(1)
      expect(store.quests).toHaveLength(0)
    })
  })

  describe('todayQuests getter', () => {
    it('maps quest records to quest views with resolved category names', () => {
      const playerStore = usePlayerStore()
      playerStore.player = {
        id: 'user-1',
        displayName: 'Hunter',
        email: 'h@test.com',
        photoURL: null,
        level: 1,
        xp: 0,
        rank: 'E',
        hp: 50,
        maxHp: 50,
        title: null,
        inPenaltyZone: false,
        lastActiveDate: '2026-05-23',
        timezone: 'Africa/Johannesburg',
        streakFreezes: 2,
        createdAt: null,
        updatedAt: null,
      }
      playerStore.categories = [
        { id: 'default-0', name: 'Fitness', icon: '💪', color: '#EF4444', level: 1, xp: 0, order: 0, createdAt: null },
        { id: 'default-1', name: 'Learning', icon: '📚', color: '#3B82F6', level: 1, xp: 0, order: 1, createdAt: null },
      ]

      const store = useQuestStore()
      store.quests = [
        {
          id: 'quest-1',
          title: 'Morning Run',
          categoryId: 'default-0',
          difficulty: 3,
          frequency: 'daily' as const,
          frequencyTarget: 1,
          frequencyPeriod: 'day' as const,
          streak: 5,
          completedDates: ['2026-05-23'],
          createdAt: null,
          updatedAt: null,
        },
        {
          id: 'quest-2',
          title: 'Read 30 min',
          categoryId: 'default-1',
          difficulty: 2,
          frequency: 'weekly' as const,
          frequencyTarget: 1,
          frequencyPeriod: 'week' as const,
          streak: 0,
          completedDates: [],
          createdAt: null,
          updatedAt: null,
        },
      ]

      const views = store.todayQuests

      expect(views).toHaveLength(2)
      expect(views[0].category).toBe('Fitness')
      expect(views[0].completed).toBe(true)
      expect(views[0].xpReward).toBe(40)
      expect(views[0].type).toBe('daily')
      expect(views[0].progress).toEqual({ current: 1, target: 1 })
      expect(views[1].category).toBe('Learning')
      expect(views[1].completed).toBe(false)
      expect(views[1].type).toBe('weekly')
      expect(views[1].progress).toEqual({ current: 0, target: 1 })
    })
  })

  describe('questsByFrequency getter', () => {
    it('groups quests by frequency period', () => {
      const playerStore = usePlayerStore()
      playerStore.player = {
        id: 'user-1', displayName: 'Hunter', email: 'h@test.com', photoURL: null,
        level: 1, xp: 0, rank: 'E', hp: 50, maxHp: 50, title: null,
        inPenaltyZone: false, lastActiveDate: '2026-05-23', timezone: 'UTC',
        streakFreezes: 2, createdAt: null, updatedAt: null,
      }
      playerStore.categories = [
        { id: 'default-0', name: 'Fitness', icon: '💪', color: '#EF4444', level: 1, xp: 0, order: 0, createdAt: null },
      ]

      const store = useQuestStore()
      store.quests = [
        { id: 'q1', title: 'Run', categoryId: 'default-0', difficulty: 3, frequency: 'daily' as const, frequencyTarget: 1, frequencyPeriod: 'day' as const, streak: 0, completedDates: [], createdAt: null, updatedAt: null },
        { id: 'q2', title: 'Gym', categoryId: 'default-0', difficulty: 4, frequency: 'custom' as const, frequencyTarget: 3, frequencyPeriod: 'week' as const, streak: 0, completedDates: [], createdAt: null, updatedAt: null },
        { id: 'q3', title: 'Review', categoryId: 'default-0', difficulty: 2, frequency: 'monthly' as const, frequencyTarget: 1, frequencyPeriod: 'month' as const, streak: 0, completedDates: [], createdAt: null, updatedAt: null },
      ]

      const grouped = store.questsByFrequency

      expect(grouped.daily).toHaveLength(1)
      expect(grouped.daily[0].title).toBe('Run')
      expect(grouped.weekly).toHaveLength(1)
      expect(grouped.weekly[0].title).toBe('Gym')
      expect(grouped.weekly[0].type).toBe('3x / week')
      expect(grouped.monthly).toHaveLength(1)
      expect(grouped.monthly[0].title).toBe('Review')
    })
  })
})
