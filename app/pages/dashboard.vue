<script setup lang="ts">
import { ref } from 'vue'
import DashboardQuestList from '~/components/dashboard/DashboardQuestList.vue'
import QuestCreateModal from '~/components/quests/QuestCreateModal.vue'
import CategoryGrid from '~/components/player/CategoryGrid.vue'
import PlayerOverview from '~/components/player/PlayerOverview.vue'
import GlowButton from '~/components/ui/GlowButton.vue'
import { usePlayerStore } from '~/stores/player'
import { useQuestStore } from '~/stores/quest'

definePageMeta({ middleware: ['auth'] })

const { currentUser, signOutUser } = useAuth()
const playerStore = usePlayerStore()
const questStore = useQuestStore()

const isCreateModalOpen = ref(false)
const createError = ref<string | null>(null)

if (currentUser.value && (playerStore.player?.id !== currentUser.value.uid || playerStore.categories.length === 0)) {
  await playerStore.initializeForUser({
    uid: currentUser.value.uid,
    displayName: currentUser.value.displayName,
    email: currentUser.value.email,
    photoURL: currentUser.value.photoURL,
  })
}

if (currentUser.value && questStore.quests.length === 0 && !questStore.isLoading) {
  await questStore.loadQuests(currentUser.value.uid)
}

async function handleSignOut() {
  await signOutUser()
  playerStore.clearPlayer()
  questStore.clearQuests()
  await navigateTo('/')
}

async function handleToggleComplete(questId: string) {
  if (!currentUser.value) return
  await questStore.toggleQuestCompletion(currentUser.value.uid, questId)
}

async function handleCreateQuest(data: { title: string; categoryId: string; difficulty: number }) {
  if (!currentUser.value) return
  createError.value = null

  try {
    await questStore.createQuest(currentUser.value.uid, data)
    isCreateModalOpen.value = false
  }
  catch (error) {
    createError.value = error instanceof Error ? error.message : 'Failed to create quest. Please try again.'
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 py-4 sm:py-6">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.32em] text-cyan-200/70">System Window</p>
        <h1 class="mt-2 text-3xl font-semibold text-slate-50 sm:text-4xl">Hunter Dashboard</h1>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row">
        <GlowButton variant="secondary" @click="handleSignOut">
          Sign out
        </GlowButton>
      </div>
    </header>

    <div v-if="playerStore.isLoading" class="pixel-corners border border-cyan-300/15 bg-slate-950/45 p-5 text-sm text-slate-300">
      Initializing hunter profile...
    </div>

    <div v-else-if="playerStore.error" class="pixel-corners border border-rose-300/20 bg-rose-950/30 p-5 text-sm text-rose-100">
      {{ playerStore.error }}
    </div>

    <template v-else-if="playerStore.player">
      <section class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <PlayerOverview :player="playerStore.player" />
        <CategoryGrid :categories="playerStore.categories" />
      </section>

      <DashboardQuestList
        :quests="questStore.todayQuests"
        @toggle-complete="handleToggleComplete"
        @open-create-modal="isCreateModalOpen = true"
      />

      <QuestCreateModal
        v-if="isCreateModalOpen"
        :categories="playerStore.categories"
        :error="createError"
        @create-quest="handleCreateQuest"
        @close="isCreateModalOpen = false; createError = null"
      />
    </template>
  </div>
</template>
