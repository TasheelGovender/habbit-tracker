<script setup lang="ts">
import SystemWindow from '~/components/ui/SystemWindow.vue'

defineProps<{
  categories: Array<{
    id: string
    name: string
    level: number
    icon: string
    color: string
  }>
}>()
</script>

<template>
  <SystemWindow eyebrow="Categories" title="Current growth">
    <div class="grid gap-3 sm:grid-cols-2">
      <article
        v-for="category in categories"
        :key="category.id"
        class="pixel-corners border border-cyan-300/15 bg-slate-950/50 p-4"
      >
        <div class="flex items-center gap-3">
          <span class="text-2xl" :style="{ color: category.color }">{{ category.icon }}</span>
          <div>
            <p class="text-sm font-semibold text-cyan-50">{{ category.name }}</p>
            <p class="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Lv. {{ category.level }}</p>
          </div>
        </div>
      </article>
    </div>
  </SystemWindow>
</template>
