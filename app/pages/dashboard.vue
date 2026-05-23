<script setup lang="ts">
import DashboardQuestEmptyState from '~/components/dashboard/DashboardQuestEmptyState.vue'
import CategoryGrid from '~/components/player/CategoryGrid.vue'
import PlayerOverview from '~/components/player/PlayerOverview.vue'
import GlowButton from '~/components/ui/GlowButton.vue'
import { usePlayerStore } from '~/stores/player'

definePageMeta({ middleware: ['auth'] })

const { currentUser, signOutUser } = useAuth()
const playerStore = usePlayerStore()

if (currentUser.value && (playerStore.player?.id !== currentUser.value.uid || playerStore.categories.length === 0)) {
  await playerStore.initializeForUser({
    uid: currentUser.value.uid,
    displayName: currentUser.value.displayName,
    email: currentUser.value.email,
    photoURL: currentUser.value.photoURL,
  })
}

async function handleSignOut() {
  await signOutUser()
  playerStore.clearPlayer()
  await navigateTo('/')
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

      <DashboardQuestEmptyState />
    </template>
  </div>
</template>
