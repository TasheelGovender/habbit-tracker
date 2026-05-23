<script setup lang="ts">
defineProps<{
  quest: {
    title: string
    type: string
    category: string
    difficulty: number
    streak: number
    xpReward: number
    completed?: boolean
  }
}>()
</script>

<template>
  <article
    class="pixel-corners border p-4 transition"
    :class="quest.completed ? 'border-emerald-300/30 bg-emerald-400/10' : 'border-cyan-300/15 bg-slate-950/50 hover:border-cyan-300/30'"
  >
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="space-y-2">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-semibold text-slate-50">{{ quest.title }}</span>
          <span class="rounded-full border border-cyan-300/20 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-100/80">
            {{ quest.type }}
          </span>
        </div>
        <p class="text-xs uppercase tracking-[0.22em] text-slate-400">
          {{ quest.category }} · Difficulty {{ quest.difficulty }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs uppercase tracking-[0.2em] text-slate-300 sm:text-right">
        <div>
          <p class="text-slate-500">Streak</p>
          <p class="mt-1 text-cyan-100">{{ quest.streak }} days</p>
        </div>
        <div>
          <p class="text-slate-500">Reward</p>
          <p class="mt-1 text-cyan-100">+{{ quest.xpReward }} XP</p>
        </div>
      </div>
    </div>
  </article>
</template>
