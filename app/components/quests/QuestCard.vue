<script setup lang="ts">
import type { QuestView } from '~/types/quest'

const props = defineProps<{
  quest: QuestView
}>()

const emit = defineEmits<{
  'toggle-complete': [questId: string]
}>()
</script>

<template>
  <article
    class="pixel-corners border p-4 transition"
    :class="quest.completed ? 'border-emerald-300/30 bg-emerald-400/10' : 'border-cyan-300/15 bg-slate-950/50 hover:border-cyan-300/30'"
  >
    <div class="flex items-start gap-3">
      <button
        data-testid="toggle-complete"
        class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border transition"
        :class="quest.completed
          ? 'border-emerald-300/40 bg-emerald-400/20 text-emerald-200'
          : 'border-cyan-300/20 bg-slate-950/50 text-transparent hover:border-cyan-300/40'"
        @click="emit('toggle-complete', quest.id)"
      >
        <svg v-if="quest.completed" class="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none">
          <path d="M2 7l4 4 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <div class="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
    </div>
  </article>
</template>
