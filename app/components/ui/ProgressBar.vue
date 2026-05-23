<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  value: number
  max: number
  tone?: 'xp' | 'hp' | 'category'
}>(), {
  tone: 'xp',
})

const percentage = computed(() => {
  if (props.max <= 0) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round((props.value / props.max) * 100)))
})

const toneClass = computed(() => {
  if (props.tone === 'hp') {
    return 'from-rose-500 via-orange-400 to-amber-300'
  }

  if (props.tone === 'category') {
    return 'from-violet-500 via-fuchsia-400 to-cyan-300'
  }

  return 'from-cyan-500 via-sky-400 to-indigo-300'
})
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.24em] text-slate-300">
      <span>{{ label }}</span>
      <span>{{ value }} / {{ max }}</span>
    </div>
    <div class="pixel-corners border border-cyan-300/15 bg-slate-950/70 p-1">
      <div class="h-3 overflow-hidden rounded-sm bg-slate-900">
        <div
          class="h-full bg-gradient-to-r transition-all duration-500"
          :class="toneClass"
          :style="{ width: `${percentage}%` }"
        />
      </div>
    </div>
  </div>
</template>
