import { defineStore } from 'pinia'

import { usePlayer } from '~/composables/usePlayer'
import type { AuthUserSeed, CategoryRecord, PlayerRecord } from '~/types/player'

interface PlayerState {
  player: PlayerRecord | null
  categories: CategoryRecord[]
  isLoading: boolean
  isBootstrapping: boolean
  error: string | null
  initializationRequestId: number
}

function getInitialState(): PlayerState {
  return {
    player: null,
    categories: [],
    isLoading: false,
    isBootstrapping: false,
    error: null,
    initializationRequestId: 0,
  }
}

export const usePlayerStore = defineStore('player', {
  state: (): PlayerState => getInitialState(),
  actions: {
    async initializeForUser(user: AuthUserSeed) {
      const { bootstrapPlayerIfNeeded, loadCategories } = usePlayer()
      const requestId = this.initializationRequestId + 1

      this.initializationRequestId = requestId
      this.isLoading = true
      this.isBootstrapping = true
      this.error = null

      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        const player = await bootstrapPlayerIfNeeded(user, timezone)

        if (this.initializationRequestId !== requestId) {
          return
        }

        const categories = await loadCategories(user.uid)

        if (this.initializationRequestId !== requestId) {
          return
        }

        this.player = player
        this.categories = categories
      }
      catch (error) {
        if (this.initializationRequestId === requestId) {
          this.error = error instanceof Error ? error.message : 'Unable to initialize hunter profile.'
        }
        throw error
      }
      finally {
        if (this.initializationRequestId === requestId) {
          this.isLoading = false
          this.isBootstrapping = false
        }
      }
    },
    applyQuestXpResult(result: { playerXp: number; playerLevel: number; categoryId: string; categoryXp: number; categoryLevel: number }) {
      if (!this.player) return

      this.player.xp = result.playerXp
      this.player.level = result.playerLevel

      const category = this.categories.find(c => c.id === result.categoryId)
      if (category) {
        category.xp = result.categoryXp
        category.level = result.categoryLevel
      }
    },
    clearPlayer() {
      Object.assign(this, getInitialState())
    },
  },
})
