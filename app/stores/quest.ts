import { defineStore } from 'pinia'
import { formatInTimeZone } from 'date-fns-tz'

import { useQuest } from '~/composables/useQuest'
import { usePlayerStore } from '~/stores/player'
import type { QuestRecord, QuestView } from '~/types/quest'
import { calculateXpReward } from '~/utils/xp'

interface QuestState {
  quests: QuestRecord[]
  isLoading: boolean
  error: string | null
  loadRequestId: number
}

function getInitialState(): QuestState {
  return {
    quests: [],
    isLoading: false,
    error: null,
    loadRequestId: 0,
  }
}

function getTodayString(timezone: string): string {
  return formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd')
}

export const useQuestStore = defineStore('quest', {
  state: (): QuestState => getInitialState(),
  getters: {
    todayQuests(state): QuestView[] {
      const playerStore = usePlayerStore()
      const timezone = playerStore.player?.timezone || 'UTC'
      const today = getTodayString(timezone)

      return state.quests.map((quest) => {
        const category = playerStore.categories.find((c) => c.id === quest.categoryId)

        return {
          id: quest.id,
          title: quest.title,
          type: 'daily',
          category: category?.name ?? 'Unknown',
          categoryId: quest.categoryId,
          difficulty: quest.difficulty,
          streak: quest.streak,
          xpReward: calculateXpReward(quest.difficulty, quest.streak),
          completed: quest.completedDates.includes(today),
        }
      })
    },
  },
  actions: {
    async loadQuests(uid: string) {
      const { loadQuests } = useQuest()
      const requestId = this.loadRequestId + 1

      this.loadRequestId = requestId
      this.isLoading = true
      this.error = null

      try {
        const quests = await loadQuests(uid)

        if (this.loadRequestId !== requestId) {
          return
        }

        this.quests = quests
      }
      catch (error) {
        if (this.loadRequestId === requestId) {
          this.error = error instanceof Error ? error.message : 'Unable to load quests.'
        }
        throw error
      }
      finally {
        if (this.loadRequestId === requestId) {
          this.isLoading = false
        }
      }
    },

    async createQuest(uid: string, data: { title: string; categoryId: string; difficulty: number }) {
      const { createQuest } = useQuest()
      const quest = await createQuest(uid, data)
      this.quests.push(quest)
    },

    async toggleQuestCompletion(uid: string, questId: string) {
      const { completeQuest, uncompleteQuest } = useQuest()
      const playerStore = usePlayerStore()

      const quest = this.quests.find((q) => q.id === questId)
      if (!quest || !playerStore.player) return

      const timezone = playerStore.player.timezone || 'UTC'
      const today = getTodayString(timezone)
      const isCompleted = quest.completedDates.includes(today)

      if (isCompleted) {
        const result = await uncompleteQuest(uid, questId, quest.categoryId, quest.difficulty, quest.streak)

        quest.completedDates = quest.completedDates.filter((d) => d !== today)
        quest.streak = Math.max(0, quest.streak - 1)

        const category = playerStore.categories.find((c) => c.id === quest.categoryId)
        if (category) {
          category.xp = result.categoryXp
          category.level = result.categoryLevel
        }

        playerStore.player.xp = result.playerXp
        playerStore.player.level = result.playerLevel
      }
      else {
        const result = await completeQuest(uid, questId, quest.categoryId, quest.difficulty, quest.streak)

        quest.completedDates = [...quest.completedDates, today]
        quest.streak = quest.streak + 1

        const category = playerStore.categories.find((c) => c.id === quest.categoryId)
        if (category) {
          category.xp = result.categoryXp
          category.level = result.categoryLevel
        }

        playerStore.player.xp = result.playerXp
        playerStore.player.level = result.playerLevel
      }
    },

    async deleteQuest(uid: string, questId: string) {
      const { deleteQuest } = useQuest()
      await deleteQuest(uid, questId)
      this.quests = this.quests.filter((q) => q.id !== questId)
    },

    clearQuests() {
      Object.assign(this, getInitialState())
    },
  },
})
