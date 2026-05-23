<script setup lang="ts">
import ProgressBar from '~/components/ui/ProgressBar.vue'
import SystemWindow from '~/components/ui/SystemWindow.vue'

defineProps<{
  player: {
    displayName: string
    rank: string
    title: string | null
    level: number
    xp: number
    hp: number
    maxHp: number
  }
}>()
</script>

<template>
  <SystemWindow eyebrow="Player" :title="player.displayName">
    <div class="space-y-4">
      <div class="grid gap-3 sm:grid-cols-3">
        <div>
          <p class="text-xs uppercase tracking-[0.24em] text-slate-500">Name</p>
          <p class="mt-1 text-sm font-semibold text-cyan-50">{{ player.displayName }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.24em] text-slate-500">Rank</p>
          <p class="mt-1 text-sm font-semibold text-cyan-50">{{ player.rank }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.24em] text-slate-500">Title</p>
          <p class="mt-1 text-sm font-semibold text-cyan-50">{{ player.title ?? 'Unawakened' }}</p>
        </div>
      </div>

      <div class="grid gap-3">
        <ProgressBar label="Level XP" :value="player.xp" :max="100" />
        <ProgressBar label="HP" :value="player.hp" :max="player.maxHp" tone="hp" />
      </div>
    </div>
  </SystemWindow>
</template>
