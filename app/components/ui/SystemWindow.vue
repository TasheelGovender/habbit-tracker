<script setup lang="ts">
defineProps<{
  title?: string
  eyebrow?: string
}>()
</script>

<template>
  <section
    class="pixel-corners scanline relative overflow-hidden border border-cyan-300/20 bg-[color:var(--color-surface)] backdrop-blur"
    :style="{ boxShadow: 'var(--shadow-panel)' }"
  >
    <div v-if="title || eyebrow" class="border-b border-cyan-300/10 px-4 py-3 sm:px-5">
      <p v-if="eyebrow" class="text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-200/70">
        {{ eyebrow }}
      </p>
      <h2 v-if="title" class="mt-1 text-base font-semibold text-cyan-50 sm:text-lg">
        {{ title }}
      </h2>
    </div>

    <div class="px-4 py-4 sm:px-5 sm:py-5">
      <slot />
    </div>
  </section>
</template>
