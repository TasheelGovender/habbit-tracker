import { defineStore } from 'pinia'
import { formatInTimeZone } from 'date-fns-tz'

import { useQuest } from '~/composables/useQuest'
import { usePlayerStore } from '~/stores/player'
import type { FrequencyPeriod, QuestFrequency, QuestRecord, QuestView } from '~/types/quest'
import { calculateXpReward } from '~/utils/xp'
import { getCompletionProgress, getFrequencyLabel, isQuestCompletedForPeriod } from '~/utils/quest-frequency'

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
        const frequency = quest.frequency || 'daily'
        const frequencyTarget = quest.frequencyTarget || 1
        const frequencyPeriod = quest.frequencyPeriod || 'day'
        const progress = getCompletionProgress(quest.completedDates, frequency, frequencyTarget, frequencyPeriod, today)

        return {
          id: quest.id,
          title: quest.title,
          type: getFrequencyLabel(frequency, frequencyTarget, frequencyPeriod),
          category: category?.name ?? 'Unknown',
          categoryId: quest.categoryId,
          difficulty: quest.difficulty,
          frequency,
          frequencyTarget,
          frequencyPeriod,
          streak: quest.streak,
          xpReward: calculateXpReward(quest.difficulty, quest.streak),
          completed: isQuestCompletedForPeriod(progress),
          progress,
        }
      })
    },
    questsByFrequency(): { daily: QuestView[]; weekly: QuestView[]; monthly: QuestView[] } {
      const quests = this.todayQuests
      return {
        daily: quests.filter((q) => q.frequencyPeriod === 'day'),
        weekly: quests.filter((q) => q.frequencyPeriod === 'week'),
        monthly: quests.filter((q) => q.frequencyPeriod === 'month'),
      }
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

    async createQuest(uid: string, data: {
      title: string
      categoryId: string
      difficulty: number
      frequency: QuestFrequency
      frequencyTarget: number
      frequencyPeriod: FrequencyPeriod
    }) {
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
      const isCompletedToday = quest.completedDates.includes(today)

      if (isCompletedToday) {
        const result = await uncompleteQuest(uid, questId, quest.categoryId, quest.difficulty, quest.streak)

        quest.completedDates = quest.completedDates.filter((d) => d !== today)
        quest.streak = Math.max(0, quest.streak - 1)

        playerStore.applyQuestXpResult({
          playerXp: result.playerXp,
          playerLevel: result.playerLevel,
          categoryId: quest.categoryId,
          categoryXp: result.categoryXp,
          categoryLevel: result.categoryLevel,
        })
      }
      else {
        const result = await completeQuest(uid, questId, quest.categoryId, quest.difficulty, quest.streak)

        quest.completedDates = [...quest.completedDates, today]
        quest.streak = quest.streak + 1

        playerStore.applyQuestXpResult({
          playerXp: result.playerXp,
          playerLevel: result.playerLevel,
          categoryId: quest.categoryId,
          categoryXp: result.categoryXp,
          categoryLevel: result.categoryLevel,
        })
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
